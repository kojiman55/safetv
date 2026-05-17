export type WeatherDay = {
  weather: string
  temp: number
  high: number
  low: number
  icon: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'unknown'
}

export type WeatherResult = {
  areaName: string
  today: WeatherDay
  tomorrow: WeatherDay
  weekly: WeatherDay[]
}

function toIcon(code: string): WeatherDay['icon'] {
  if (code.startsWith('100') || code.startsWith('101')) return 'sunny'
  if (code.startsWith('200') || code.startsWith('201') || code.startsWith('202')) return 'cloudy'
  if (code.startsWith('300') || code.startsWith('301') || code.startsWith('302') || code.startsWith('303')) return 'rainy'
  if (code.startsWith('400') || code.startsWith('401') || code.startsWith('402')) return 'snowy'
  return 'unknown'
}

export async function fetchWeather(areaCode = '270000'): Promise<WeatherResult> {
  const res = await fetch(`https://www.jma.go.jp/bosai/forecast/data/forecast/${areaCode}.json`)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const json: any[] = await res.json()

  const area = json[0]
  const timeSeries = area.timeSeries
  const weatherSeries = timeSeries[0]
  const tempSeries = timeSeries[2]

  const areaName = weatherSeries.areas[0]?.area?.name ?? '大阪市'
  const weatherCodes: string[] = weatherSeries.areas[0]?.weatherCodes ?? []
  const weathers: string[] = weatherSeries.areas[0]?.weathers ?? []

  const temps: string[] = tempSeries?.areas?.[0]?.temps ?? []

  // JMA temps配列: [今日最低, 今日最高, 明日最低, 明日最高, ...]
  // 今日最低は午前中に過ぎると空文字になる場合がある
  const makeDay = (idx: number): WeatherDay => {
    const low = temps[idx * 2]
    const high = temps[idx * 2 + 1]
    return {
      weather: weathers[idx] ?? '不明',
      temp: Number(high || low || 0),
      high: Number(high || 0),
      low: Number(low || 0),
      icon: toIcon(weatherCodes[idx] ?? ''),
    }
  }

  return {
    areaName,
    today: makeDay(0),
    tomorrow: makeDay(1),
    weekly: [makeDay(0), makeDay(1), makeDay(2)].filter((_, i) => i < (weatherCodes.length)),
  }
}
