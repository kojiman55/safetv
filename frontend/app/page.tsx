'use client'

import TvScreen from '@/components/TvScreen'
import AlertFooter from '@/components/main/AlertFooter'
import ChannelBar from '@/components/main/ChannelBar'
import Header from '@/components/main/Header'
import NewsPanel from '@/components/main/NewsPanel'
import VideoInfoPanel from '@/components/main/VideoInfoPanel'
import VideoPanel, { type VideoPanelRef } from '@/components/main/VideoPanel'
import WeatherPanel from '@/components/main/WeatherPanel'
import { useAlert } from '@/hooks/useAlert'
import { useContent, useYouTubeChannels } from '@/hooks/useContent'
import type { CategoryId } from '@/types'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function MainPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<import('@/types').UserProfile | null>(null)
  const [ready, setReady] = useState(false)
  const [category, setCategory] = useState<CategoryId>('news')
  const [currentChannelIndex, setCurrentChannelIndex] = useState(0)
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [isMuted, setIsMuted] = useState(true)
  const videoPanelRef = useRef<VideoPanelRef>(null)

  const areaCode = profile?.areaCode ?? '270000'
  const { news, weather } = useContent(areaCode)
  const { channels } = useYouTubeChannels(category)
  const { alert } = useAlert(areaCode)

  useEffect(() => {
    const stored = localStorage.getItem('user_profile')
    if (!stored) { router.replace('/setup'); return }
    setProfile(JSON.parse(stored))
    setReady(true)
  }, [router])

  useEffect(() => {
    if (alert.level >= 3) {
      localStorage.setItem('current_alert', JSON.stringify(alert))
      router.push('/alert')
    }
  }, [alert, router])

  const handleCategoryChange = useCallback((cat: CategoryId) => {
    setCategory(cat)
    setCurrentChannelIndex(0)
    setCurrentVideoIndex(0)
    setIsMuted(true)
  }, [])

  const handleChannelChange = useCallback((index: number) => {
    setCurrentChannelIndex(index)
    setCurrentVideoIndex(0)
    setIsMuted(true)
  }, [])

  const handleNext = useCallback(() => {
    videoPanelRef.current?.next()
  }, [])

  const handlePrev = useCallback(() => {
    videoPanelRef.current?.prev()
  }, [])

  const handleToggleMute = useCallback(() => {
    videoPanelRef.current?.toggleMute()
    setIsMuted((prev) => !prev)
  }, [])

  const handleVideoChange = useCallback((index: number) => {
    setCurrentVideoIndex(index)
  }, [])

  if (!ready || !profile) return null

  const currentChannelVideos = channels[currentChannelIndex]?.videos ?? []
  const currentVideo = currentChannelVideos[currentVideoIndex] ?? null

  return (
    <TvScreen>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Header prefecture={profile.prefecture} />
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <div style={{ width: '60%', display: 'flex', flexDirection: 'column', borderRight: '2px solid #EDD5C0' }}>
            <VideoPanel
              ref={videoPanelRef}
              key={`${category}-${currentChannelIndex}`}
              videos={currentChannelVideos}
              onVideoChange={handleVideoChange}
            />
            <ChannelBar
              channels={channels}
              currentIndex={currentChannelIndex}
              onChannelChange={handleChannelChange}
              onPrev={handlePrev}
              onNext={handleNext}
              onToggleMute={handleToggleMute}
              isMuted={isMuted}
            />
            <VideoInfoPanel video={currentVideo} />
          </div>
          <div style={{ width: '40%', display: 'flex', flexDirection: 'column' }}>
            <WeatherPanel weather={weather} />
            <NewsPanel
              news={news}
              category={category}
              onCategoryChange={handleCategoryChange}
            />
          </div>
        </div>
        <AlertFooter alert={alert} />
      </div>
    </TvScreen>
  )
}
