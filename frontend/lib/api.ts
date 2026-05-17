import type { AlertInfo, NewsItem, Shelter, Weather } from '@/types'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? ''

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export async function fetchNews(): Promise<NewsItem[]> {
  const data = await get<{ news: NewsItem[] }>('/api/content?type=news')
  return data.news
}

export async function fetchWeather(areaCode = '270000'): Promise<Weather> {
  return get<Weather>(`/api/content?type=weather&areaCode=${areaCode}`)
}

export async function fetchAlert(areaCode = '270000'): Promise<AlertInfo> {
  return get<AlertInfo>(`/api/content?type=alert&areaCode=${areaCode}`)
}

export async function fetchShelters(lat: number, lng: number): Promise<Shelter[]> {
  const data = await get<{ shelters: Shelter[] }>(`/api/content?type=shelters&lat=${lat}&lng=${lng}&limit=5`)
  return data.shelters
}

export async function geocode(address: string): Promise<{ lat: number; lng: number }> {
  return get<{ lat: number; lng: number }>(`/api/content?type=geocode&address=${encodeURIComponent(address)}`)
}

export async function fetchYouTubeChannels(category: import('@/types').CategoryId): Promise<import('@/types').YoutubeChannel[]> {
  const data = await get<{ channels: import('@/types').YoutubeChannel[] }>(`/api/content?type=youtube&category=${category}`)
  return data.channels
}
