'use client'

import { fetchAlert } from '@/lib/api'
import type { AlertInfo } from '@/types'
import { useEffect, useState } from 'react'

const DEFAULT_ALERT: AlertInfo = {
  level: 0,
  type: '',
  area: '',
  issuedAt: '',
  message: '',
}

export function useAlert(areaCode = '270000') {
  const [alert, setAlert] = useState<AlertInfo>(DEFAULT_ALERT)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const check = async () => {
      try {
        const data = await fetchAlert(areaCode)
        setAlert(data)
      } catch {
        // エラー時は前回のデータを保持
      } finally {
        setIsLoading(false)
      }
    }
    check()
    const id = setInterval(check, 5 * 60_000)
    return () => clearInterval(id)
  }, [areaCode])

  return { alert, isLoading }
}
