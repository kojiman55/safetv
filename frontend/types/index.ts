export type YoutubeVideo = {
  id: string
  title: string
  description: string
  channelName: string
}

export type YoutubeChannel = {
  id: string
  name: string
  videos: YoutubeVideo[]
}

export type CategoryId = 'news' | 'travel' | 'nature' | 'weather'

export type NewsItem = {
  title: string
  url: string
  publishedAt: string
}

export type WeatherDay = {
  weather: string
  temp: number
  high: number
  low: number
  icon: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'unknown'
}

export type Weather = {
  areaName: string
  today: WeatherDay
  tomorrow: WeatherDay
  weekly: WeatherDay[]
}

export type AlertLevel = 0 | 1 | 2 | 3 | 4 | 5

export type AlertInfo = {
  level: AlertLevel
  type: string
  area: string
  issuedAt: string
  message: string
}

export type Shelter = {
  name: string
  address: string
  lat: number
  lng: number
  distance: number
  walkMinutes: number
  types: string[]
}

export type UserProfile = {
  prefecture: string
  areaCode: string
}
