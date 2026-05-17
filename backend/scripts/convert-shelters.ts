import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import * as fs from 'fs'
import * as path from 'path'

const s3 = new S3Client({ region: 'ap-northeast-1' })
const BUCKET = process.env.BUCKET_NAME!

const DISASTER_COLS: Record<number, string> = {
  8: '洪水',
  9: '崖崩れ等',
  10: '高潮',
  11: '地震',
  12: '津波',
  13: '大規模な火事',
  14: '内水氾濫',
  15: '火山現象',
}

async function main() {
  const csvPath = process.argv[2]
  if (!csvPath) {
    console.error('Usage: npx ts-node scripts/convert-shelters.ts <csv-path>')
    process.exit(1)
  }

  const raw = fs.readFileSync(path.resolve(csvPath), 'utf8')
  const lines = raw.split('\n').slice(1) // ヘッダー除去

  const shelters: { name: string; address: string; lat: number; lng: number; types: string[] }[] = []

  for (const line of lines) {
    const cols = line.split(',').map((c) => c.trim().replace(/^"|"$/g, ''))
    if (cols[5] !== '27') continue // 大阪府（都道府県コード27）以外をスキップ

    const name = cols[2]
    const address = cols[7]
    const lat = Number(cols[0])
    const lng = Number(cols[1])
    if (!name || isNaN(lat) || isNaN(lng)) continue

    const types = Object.entries(DISASTER_COLS)
      .filter(([idx]) => cols[Number(idx)] === '1')
      .map(([, label]) => label)

    shelters.push({ name, address, lat, lng, types })
  }

  console.log(`大阪府の避難場所: ${shelters.length}件`)

  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: 'shelters/osaka.json',
    Body: JSON.stringify(shelters),
    ContentType: 'application/json',
  }))

  console.log('S3にアップロード完了: shelters/osaka.json')
}

main().catch((e) => { console.error(e); process.exit(1) })
