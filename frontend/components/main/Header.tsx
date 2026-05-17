import { useClock } from '@/hooks/useClock'
import styles from './Header.module.css'

export default function Header({ prefecture = '' }: { prefecture?: string }) {
  const { time, date } = useClock()
  return (
    <div className={styles.header}>
      <div className={styles.left}>
        <span className={styles.time}>{time}</span>
        <span className={styles.date}>{date}</span>
      </div>
      <div className={styles.right}>
        {prefecture && <span className={styles.area}>{prefecture}</span>}
        <span className={styles.appTitle}>SafeTV</span>
      </div>
    </div>
  )
}
