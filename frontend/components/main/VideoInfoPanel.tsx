import type { YoutubeVideo } from '@/types'
import styles from './VideoInfoPanel.module.css'

export default function VideoInfoPanel({ video }: { video: YoutubeVideo | null }) {
  if (!video) return <div className={styles.panel} />

  return (
    <div className={styles.panel}>
      <div className={styles.channel}>{video.channelName}</div>
      <div className={styles.title}>{video.title}</div>
      {video.description && (
        <div className={styles.description}>{video.description}</div>
      )}
    </div>
  )
}
