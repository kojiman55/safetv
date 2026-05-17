'use client'

import { useEffect, useState } from 'react'

const DAYS = ['日', '月', '火', '水', '木', '金', '土']

function format(now: Date) {
  const h = String(now.getHours()).padStart(2, '0')
  const m = String(now.getMinutes()).padStart(2, '0')
  const y = now.getFullYear()
  const mo = now.getMonth() + 1
  const d = now.getDate()
  const w = DAYS[now.getDay()]
  return {
    time: `${h}:${m}`,
    date: `${y}年${mo}月${d}日（${w}）`,
  }
}

export function useClock() {
  const [clock, setClock] = useState(format(new Date()))

  useEffect(() => {
    const id = setInterval(() => setClock(format(new Date())), 1000)
    return () => clearInterval(id)
  }, [])

  return clock
}
