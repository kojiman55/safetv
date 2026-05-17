'use client'

import type { YoutubeChannel } from '@/types'
import { Volume2, VolumeOff } from 'lucide-react'
import styles from './ChannelBar.module.css'

type Props = {
  channels: YoutubeChannel[]
  currentIndex: number
  onChannelChange: (index: number) => void
  onPrev: () => void
  onNext: () => void
  onToggleMute: () => void
  isMuted: boolean
}

export default function ChannelBar({ channels, currentIndex, onChannelChange, onPrev, onNext, onToggleMute, isMuted }: Props) {
  if (!channels.length) return null

  return (
    <div className={styles.bar}>
      <div className={styles.channels}>
        {channels.map((ch, i) => (
          <button
            key={ch.id}
            className={`${styles.btn} ${i === currentIndex ? styles.active : ''}`}
            onClick={() => onChannelChange(i)}
          >
            {ch.name}
          </button>
        ))}
      </div>
      <div className={styles.controls}>
        <button className={styles.navBtn} onClick={onPrev}>◀ 前</button>
        <button className={styles.navBtn} onClick={onNext}>次 ▶</button>
        <button className={`${styles.muteBtn} ${isMuted ? '' : styles.muteBtnOn}`} onClick={onToggleMute}>
          {isMuted ? <VolumeOff size={20} /> : <Volume2 size={20} />}
        </button>
      </div>
    </div>
  )
}
