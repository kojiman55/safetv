import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { fetchNhkNews } from './shared/nhk'
import { fetchWeather } from './shared/weather'

const s3 = new S3Client({ region: 'ap-northeast-1' })
const BUCKET = process.env.BUCKET_NAME!
const GSI_GEOCODE = 'https://msearch.gsi.go.jp/address-search/AddressSearch?q='

type CacheEntry = { videos: { id: string; title: string; description: string; channelName: string }[]; expires: number }
const rssCache = new Map<string, CacheEntry>()
const RSS_TTL = 10 * 60 * 1000 // 10分

async function fetchChannelVideos(id: string, name: string) {
  const now = Date.now()
  const cached = rssCache.get(id)
  if (cached && cached.expires > now) return { id, name, videos: cached.videos }

  try {
    const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${id}`)
    if (!res.ok) return { id, name, videos: [] }
    const xml = await res.text()
    const entries = [...xml.matchAll(/<entry>([\s\S]+?)<\/entry>/g)].slice(0, 10)
    const videos = entries
      .map(([, entry]) => {
        const vid = entry.match(/<yt:videoId>(.+?)<\/yt:videoId>/)?.[1] ?? ''
        const title = entry.match(/<media:title>([^<]+)<\/media:title>/)?.[1] ?? ''
        const rawDesc = entry.match(/<media:description>([\s\S]+?)<\/media:description>/)?.[1] ?? ''
        const description = rawDesc.split('\n').find((l) => l.trim() && !l.includes('http')) ?? ''
        return { id: vid, title, description: description.trim(), channelName: name }
      })
      .filter((v) => v.id)
    rssCache.set(id, { videos, expires: now + RSS_TTL })
    return { id, name, videos }
  } catch {
    return { id, name, videos: [] }
  }
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371000
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)))
}

async function getS3Json(key: string) {
  const res = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }))
  const body = await res.Body!.transformToString()
  return JSON.parse(body)
}

export const handler = async (event: { queryStringParameters?: Record<string, string> }) => {
  const params = event.queryStringParameters ?? {}
  const type = params.type

  try {
    if (type === 'news') {
      const news = await fetchNhkNews()
      return { statusCode: 200, headers: CORS, body: JSON.stringify({ news }) }
    }

    if (type === 'weather') {
      const data = await fetchWeather(params.areaCode)
      return { statusCode: 200, headers: CORS, body: JSON.stringify(data) }
    }

    if (type === 'alert') {
      const data = await getS3Json('alerts/latest-osaka.json')
      return { statusCode: 200, headers: CORS, body: JSON.stringify(data) }
    }

    if (type === 'geocode') {
      const address = params.address ?? ''
      const gsiRes = await fetch(`${GSI_GEOCODE}${encodeURIComponent(address)}`)
      if (!gsiRes.ok) throw new Error(`GSI geocode error: ${gsiRes.status}`)
      const features = await gsiRes.json() as { geometry: { coordinates: [number, number] } }[]
      if (!features || features.length === 0) {
        return { statusCode: 404, headers: CORS, body: JSON.stringify({ error: 'address not found' }) }
      }
      const [lng, lat] = features[0].geometry.coordinates
      return { statusCode: 200, headers: CORS, body: JSON.stringify({ lat, lng }) }
    }

    if (type === 'youtube') {
      const CATEGORY_CHANNELS: Record<string, { id: string; name: string }[]> = {
        news: [
          { id: 'UCGCZAYq5Xxojl_tSXcVJhiQ', name: 'ANNnewsCH' },
          { id: 'UCuTAXTexrhetbOe3zgskJBQ', name: '日テレNEWS' },
          { id: 'UC6AG81pAkf6Lbi_1VC5NmPA', name: 'TBS NEWS DIG' },
          { id: 'UCoQBJMzcwmXrRSHBFAlTsIw', name: 'FNNプライムオンライン' },
          { id: 'UCv7_krlrre3GQi79d4guxHQ', name: '読売テレビニュース' },
        ],
        weather: [
          { id: 'UCNsidkYpIAQ4QaufptQBPHQ', name: 'weathernews' },
        ],
        travel: [
          { id: 'UCAxLy5jKqs8_fAI9INnb9aw', name: '旅チャンネル' },
        ],
        nature: [
          { id: 'UCxbY38ReXW3LbaviWUE4omg', name: 'Discovery Japan' },
        ],
      }

      const category = params.category ?? 'news'
      const channelDefs = CATEGORY_CHANNELS[category] ?? CATEGORY_CHANNELS.news

      const channels = await Promise.all(channelDefs.map((ch) => fetchChannelVideos(ch.id, ch.name)))

      return { statusCode: 200, headers: CORS, body: JSON.stringify({ channels: channels.filter((c) => c.videos.length > 0) }) }
    }

    if (type === 'shelters') {
      const lat = Number(params.lat)
      const lng = Number(params.lng)
      const limit = Number(params.limit ?? 5)
      const all: { name: string; address: string; lat: number; lng: number; types: string[] }[] =
        await getS3Json('shelters/osaka.json')
      const shelters = all
        .map((s) => {
          const distance = haversine(lat, lng, s.lat, s.lng)
          return { ...s, distance, walkMinutes: Math.ceil(distance / 60) }
        })
        .sort((a, b) => a.distance - b.distance)
        .slice(0, limit)
      return { statusCode: 200, headers: CORS, body: JSON.stringify({ shelters }) }
    }

    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'invalid type' }) }
  } catch (err) {
    console.error(err)
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'internal error' }) }
  }
}
