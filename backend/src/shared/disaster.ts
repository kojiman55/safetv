export type AlertInfo = {
  level: 0 | 1 | 2 | 3 | 4 | 5
  type: string
  area: string
  issuedAt: string
  message: string
}

function levelFromType(type: string): 0 | 1 | 2 | 3 | 4 | 5 {
  if (type.includes('緊急安全確保')) return 5
  if (type.includes('避難指示')) return 4
  if (type.includes('高齢者等避難')) return 3
  if (type.includes('大雨') || type.includes('洪水')) return 2
  if (type.includes('注意報')) return 1
  return 0
}

export async function fetchDisasterAlert(): Promise<AlertInfo> {
  const res = await fetch('https://www.data.jma.go.jp/developer/xml/feed/extra.xml')
  const xml = await res.text()

  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g
  let match
  let best: AlertInfo = { level: 0, type: '', area: '', issuedAt: '', message: '' }

  while ((match = entryRegex.exec(xml)) !== null) {
    const block = match[1]
    const title = (block.match(/<title>(.*?)<\/title>/))?.[1] ?? ''
    const updated = (block.match(/<updated>(.*?)<\/updated>/))?.[1] ?? ''

    if (!title.includes('大阪')) continue

    const level = levelFromType(title)
    if (level > best.level) {
      const area = title.replace(/[【】]/g, '').split('に')[0] ?? '大阪府'
      const type = Object.keys({ '緊急安全確保': 5, '避難指示': 4, '高齢者等避難': 3, '大雨注意報': 2, '注意報': 1 })
        .find((k) => title.includes(k)) ?? title
      best = { level, type, area, issuedAt: updated, message: `${area}に${type}が発令されています。` }
    }
  }

  return best
}
