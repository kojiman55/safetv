import type { AlertInfo } from '@/types'
import ResponseButtons from './ResponseButtons'
import styles from './AlertScreen.module.css'

type Props = {
  alert: AlertInfo
}

export default function AlertScreen({ alert }: Props) {
  const bg = alert.level >= 4 ? '#c0392b' : '#e65c00'
  const titleClass = alert.level >= 4 ? `${styles.title} blink` : styles.title

  return (
    <div className={styles.screen} style={{ background: bg }}>
      <div className={titleClass}>⚠️　{alert.type}　⚠️</div>

      <div className={styles.message}>
        {alert.area}に{alert.type}が発令されました
        <br />
        {alert.message}
      </div>

      <div className={styles.shelter}>
        速やかに最寄りの避難場所へ移動してください
      </div>

      <hr className={styles.divider} />
      <div className={styles.instruction}>あなたの状況をリモコンで教えてください</div>
      <ResponseButtons />

      <div className={styles.source}>出典：気象庁</div>
    </div>
  )
}
