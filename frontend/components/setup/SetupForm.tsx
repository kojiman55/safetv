'use client'

import { PREFECTURE_DATA } from '@/data/municipalities'
import type { UserProfile } from '@/types'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import styles from './SetupForm.module.css'

export default function SetupForm() {
  const router = useRouter()
  const [selectedPrefIndex, setSelectedPrefIndex] = useState(26) // 大阪府
  const pref = PREFECTURE_DATA[selectedPrefIndex]
  const [selectedCity, setSelectedCity] = useState(pref.municipalities[0])

  const handlePrefChange = (index: number) => {
    setSelectedPrefIndex(index)
    setSelectedCity(PREFECTURE_DATA[index].municipalities[0])
  }

  const handleSubmit = () => {
    const profile: UserProfile = {
      prefecture: pref.name,
      areaCode: pref.areaCode,
      city: selectedCity.name,
      cityCode: selectedCity.code,
    }
    localStorage.setItem('user_profile', JSON.stringify(profile))
    router.push('/')
  }

  return (
    <div className={styles.container}>
      <div className={styles.form}>
        <div className={styles.title}>SafeTV へようこそ</div>

        <div className={styles.field}>
          <div className={styles.label}>都道府県</div>
          <select
            className={styles.select}
            value={selectedPrefIndex}
            onChange={(e) => handlePrefChange(Number(e.target.value))}
          >
            {PREFECTURE_DATA.map((p, i) => (
              <option key={p.areaCode} value={i}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <div className={styles.label}>市区町村</div>
          <select
            className={styles.select}
            value={selectedCity.code}
            onChange={(e) => {
              const city = pref.municipalities.find((c) => c.code === e.target.value)
              if (city) setSelectedCity(city)
            }}
          >
            {pref.municipalities.map((c) => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select>
        </div>

        <button className={styles.submit} onClick={handleSubmit}>
          はじめる
        </button>
      </div>
    </div>
  )
}
