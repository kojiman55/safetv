import type { Weather } from '@/types'
import styles from './WeatherPanel.module.css'

const ICON: Record<string, string> = {
  sunny: '☀️',
  cloudy: '☁️',
  rainy: '🌧️',
  snowy: '🌨️',
  unknown: '🌤️',
}

export default function WeatherPanel({ weather }: { weather: Weather | null }) {
  if (!weather) {
    return (
      <div className={styles.panel}>
        <div className={styles.title}>☀️ 今日の天気</div>
        <div className={styles.main}>取得中…</div>
      </div>
    )
  }

  const { today, tomorrow, weekly } = weather
  const icon = ICON[today.icon] ?? '🌤️'
  const tomorrowIcon = ICON[tomorrow.icon] ?? '🌤️'
  const dayAfter = weekly[1]
  const dayAfterIcon = dayAfter ? (ICON[dayAfter.icon] ?? '🌤️') : ''

  return (
    <div className={styles.panel}>
      <div className={styles.title}>☀️ {weather.areaName} 今日の天気</div>
      <div className={styles.main}>
        {icon} {today.weather}
      </div>
      <div className={styles.temp}>
        {today.temp}℃　最高{today.high}℃　最低{today.low}℃
      </div>
      <div className={styles.sub}>
        <span>
          明日 {tomorrowIcon} {tomorrow.temp}℃
        </span>
        {dayAfter && (
          <span>
            あさって {dayAfterIcon} {dayAfter.temp}℃
          </span>
        )}
      </div>
    </div>
  )
}
