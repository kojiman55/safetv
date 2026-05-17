import type { AlertInfo } from '@/types'
import styles from './AlertFooter.module.css'

export default function AlertFooter({ alert }: { alert: AlertInfo }) {
  const hasAlert = alert.level >= 2
  const text = hasAlert
    ? `⚠️ ${alert.area}に${alert.type}が発令されました`
    : '⚠️ 現在の警報・注意報：なし'

  return (
    <div className={`${styles.footer} ${hasAlert ? styles.warning : ''}`}>
      <span className={`${styles.text} ${hasAlert ? 'blink' : ''}`}>{text}</span>
    </div>
  )
}
