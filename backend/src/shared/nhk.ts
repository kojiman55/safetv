export type NewsItem = {
  title: string
  url: string
  publishedAt: string
}

export async function fetchNhkNews(): Promise<NewsItem[]> {
  const res = await fetch('https://news.web.nhk/n-data/conf/na/rss/cat0.xml')
  const xml = await res.text()

  const items: NewsItem[] = []
  const itemRegex = /<item>([\s\S]*?)<\/item>/g
  let match

  while ((match = itemRegex.exec(xml)) !== null && items.length < 10) {
    const block = match[1]
    const title = (block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) ?? block.match(/<title>(.*?)<\/title>/))?.[1] ?? ''
    const link = (block.match(/<link>(.*?)<\/link>/))?.[1] ?? ''
    const pubDate = (block.match(/<pubDate>(.*?)<\/pubDate>/))?.[1] ?? ''
    if (title) items.push({ title, url: link, publishedAt: pubDate })
  }

  return items
}
