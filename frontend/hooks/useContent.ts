'use client'

import { fetchNews, fetchWeather, fetchYouTubeChannels } from '@/lib/api'
import type { CategoryId, NewsItem, Weather, YoutubeChannel } from '@/types'
import { useEffect, useState } from 'react'

export function useContent(areaCode = '270000') {
  const [news, setNews] = useState<NewsItem[]>([])
  const [weather, setWeather] = useState<Weather | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [n, w] = await Promise.all([fetchNews(), fetchWeather(areaCode)])
        setNews(n)
        setWeather(w)
      } catch {
        // ignore
      } finally {
        setIsLoading(false)
      }
    }
    load()
    const id = setInterval(load, 30_000)
    return () => clearInterval(id)
  }, [areaCode])

  return { news, weather, isLoading }
}

export function useYouTubeChannels(category: CategoryId) {
  const [channels, setChannels] = useState<YoutubeChannel[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setChannels([])
    setLoading(true)
    fetchYouTubeChannels(category)
      .then(setChannels)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [category])

  return { channels, loading }
}
