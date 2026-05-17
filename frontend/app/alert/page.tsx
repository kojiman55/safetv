'use client'

import TvScreen from '@/components/TvScreen'
import AlertScreen from '@/components/alert/AlertScreen'
import type { AlertInfo } from '@/types'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

const TEST_ALERT: AlertInfo = {
  level: 4,
  type: '避難指示',
  area: '大阪市北区',
  issuedAt: new Date().toISOString(),
  message: '今すぐ避難してください',
}

function AlertContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isTest = searchParams.get('test') === '1'

  const [alert, setAlert] = useState<AlertInfo | null>(null)

  useEffect(() => {
    if (isTest) {
      setAlert(TEST_ALERT)
      return
    }

    const storedAlert = localStorage.getItem('current_alert')
    if (!storedAlert) {
      router.replace('/')
      return
    }
    setAlert(JSON.parse(storedAlert))
  }, [isTest, router])

  if (!alert) return null

  return (
    <TvScreen>
      <AlertScreen alert={alert} />
    </TvScreen>
  )
}

export default function AlertPage() {
  return (
    <Suspense>
      <AlertContent />
    </Suspense>
  )
}
