'use client'

import type { UserProfile } from '@/types'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import styles from './SetupForm.module.css'

const PREFECTURES: { name: string; areaCode: string }[] = [
  { name: '北海道', areaCode: '016000' },
  { name: '青森県', areaCode: '020000' },
  { name: '岩手県', areaCode: '030000' },
  { name: '宮城県', areaCode: '040000' },
  { name: '秋田県', areaCode: '050000' },
  { name: '山形県', areaCode: '060000' },
  { name: '福島県', areaCode: '070000' },
  { name: '茨城県', areaCode: '080000' },
  { name: '栃木県', areaCode: '090000' },
  { name: '群馬県', areaCode: '100000' },
  { name: '埼玉県', areaCode: '110000' },
  { name: '千葉県', areaCode: '120000' },
  { name: '東京都', areaCode: '130000' },
  { name: '神奈川県', areaCode: '140000' },
  { name: '新潟県', areaCode: '150000' },
  { name: '富山県', areaCode: '160000' },
  { name: '石川県', areaCode: '170000' },
  { name: '福井県', areaCode: '180000' },
  { name: '山梨県', areaCode: '190000' },
  { name: '長野県', areaCode: '200000' },
  { name: '岐阜県', areaCode: '210000' },
  { name: '静岡県', areaCode: '220000' },
  { name: '愛知県', areaCode: '230000' },
  { name: '三重県', areaCode: '240000' },
  { name: '滋賀県', areaCode: '250000' },
  { name: '京都府', areaCode: '260000' },
  { name: '大阪府', areaCode: '270000' },
  { name: '兵庫県', areaCode: '280000' },
  { name: '奈良県', areaCode: '290000' },
  { name: '和歌山県', areaCode: '300000' },
  { name: '鳥取県', areaCode: '310000' },
  { name: '島根県', areaCode: '320000' },
  { name: '岡山県', areaCode: '330000' },
  { name: '広島県', areaCode: '340000' },
  { name: '山口県', areaCode: '350000' },
  { name: '徳島県', areaCode: '360000' },
  { name: '香川県', areaCode: '370000' },
  { name: '愛媛県', areaCode: '380000' },
  { name: '高知県', areaCode: '390000' },
  { name: '福岡県', areaCode: '400000' },
  { name: '佐賀県', areaCode: '410000' },
  { name: '長崎県', areaCode: '420000' },
  { name: '熊本県', areaCode: '430000' },
  { name: '大分県', areaCode: '440000' },
  { name: '宮崎県', areaCode: '450000' },
  { name: '鹿児島県', areaCode: '460100' },
  { name: '沖縄県', areaCode: '471000' },
]

export default function SetupForm() {
  const router = useRouter()
  const [selected, setSelected] = useState(PREFECTURES[26]) // 大阪府

  const handleSubmit = () => {
    const profile: UserProfile = {
      prefecture: selected.name,
      areaCode: selected.areaCode,
    }
    localStorage.setItem('user_profile', JSON.stringify(profile))
    router.push('/')
  }

  return (
    <div className={styles.container}>
      <div className={styles.form}>
        <div className={styles.title}>MiruTV へようこそ</div>

        <div className={styles.field}>
          <div className={styles.label}>お住まいの都道府県</div>
          <select
            className={styles.select}
            value={selected.areaCode}
            onChange={(e) => {
              const pref = PREFECTURES.find((p) => p.areaCode === e.target.value)
              if (pref) setSelected(pref)
            }}
          >
            {PREFECTURES.map((p) => (
              <option key={p.areaCode} value={p.areaCode}>{p.name}</option>
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
