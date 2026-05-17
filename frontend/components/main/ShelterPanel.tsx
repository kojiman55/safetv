import type { Shelter } from '@/types'
import styles from './ShelterPanel.module.css'

function distanceLabel(m: number) {
  return m >= 1000 ? `${(m / 1000).toFixed(1)}km` : `${m}m`
}

export default function ShelterPanel({ shelters }: { shelters: Shelter[] }) {
  return (
    <div className={styles.panel}>
      <div className={styles.title}>🏫 最寄りの避難場所</div>
      <div className={styles.list}>
        {shelters.map((s, i) => (
          <div key={i} className={styles.item}>
            <span className={styles.name}>
              {i + 1}. {s.name}
            </span>
            <span className={styles.detail}>
              徒歩{s.walkMinutes}分・{distanceLabel(s.distance)}
            </span>
          </div>
        ))}
        {shelters.length === 0 && (
          <div className={styles.name} style={{ color: '#d4e1f7' }}>
            設定後に表示されます
          </div>
        )}
      </div>
    </div>
  )
}
