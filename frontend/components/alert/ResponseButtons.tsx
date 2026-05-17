'use client'

import styles from './ResponseButtons.module.css'

const BUTTONS = ['🚶 避難所に向かう', '🆘 救助を希望する', '📞 家族に連絡して']

export default function ResponseButtons() {
  return (
    <div className={styles.buttons}>
      {BUTTONS.map((label) => (
        <button
          key={label}
          className={styles.btn}
          onClick={() => window.alert('デモ版のため通信機能は省略しています')}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
