'use client'

import type { CategoryId, NewsItem } from '@/types'
import { useEffect, useState } from 'react'
import styles from './NewsPanel.module.css'

const CATEGORIES: { id: CategoryId; label: string; icon: string }[] = [
  { id: 'news', label: 'ニュース', icon: '📰' },
  { id: 'weather', label: '天気', icon: '🌤️' },
  { id: 'travel', label: '旅行', icon: '✈️' },
  { id: 'nature', label: '自然', icon: '🌿' },
]

type Props = {
  news: NewsItem[]
  category: CategoryId
  onCategoryChange: (cat: CategoryId) => void
}

export default function NewsPanel({ news, category, onCategoryChange }: Props) {
  const [offset, setOffset] = useState(0)
  const pageSize = 7

  useEffect(() => {
    if (news.length <= pageSize) return
    const id = setInterval(() => {
      setOffset((prev) => (prev + pageSize >= news.length ? 0 : prev + pageSize))
    }, 30_000)
    return () => clearInterval(id)
  }, [news.length])

  const visible = news.slice(offset, offset + pageSize)

  return (
    <div className={styles.panel}>
      <div className={styles.title}>📰 ニュース</div>
      <div className={styles.list}>
        {visible.map((item, i) => (
          <div key={i} className={styles.item}>
            {item.title}
          </div>
        ))}
      </div>
      <div className={styles.categoryBar}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            className={`${styles.catBtn} ${cat.id === category ? styles.catActive : ''}`}
            onClick={() => onCategoryChange(cat.id)}
          >
            <span className={styles.catIcon}>{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  )
}
