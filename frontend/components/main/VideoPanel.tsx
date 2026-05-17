'use client'

import type { YoutubeVideo } from '@/types'
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import styles from './VideoPanel.module.css'

declare global {
  interface Window {
    YT: {
      Player: new (el: HTMLElement, opts: object) => YTPlayer
      PlayerState: { ENDED: number }
    }
    onYouTubeIframeAPIReady: () => void
  }
}

type YTPlayer = {
  loadVideoById: (id: string) => void
  destroy: () => void
  mute: () => void
  unMute: () => void
  isMuted: () => boolean
}

export type VideoPanelRef = {
  next: () => void
  prev: () => void
  toggleMute: () => void
}

type Props = {
  videos: YoutubeVideo[]
  onVideoChange: (index: number) => void
}

const VideoPanel = forwardRef<VideoPanelRef, Props>(function VideoPanel({ videos, onVideoChange }, ref) {
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<YTPlayer | null>(null)
  const stateRef = useRef({ videos, onVideoChange, index: 0 })

  useEffect(() => {
    stateRef.current.videos = videos
    stateRef.current.onVideoChange = onVideoChange
  })

  useImperativeHandle(ref, () => ({
    next: () => {
      const { videos: vs, index: ci } = stateRef.current
      const next = (ci + 1) % vs.length
      stateRef.current.index = next
      playerRef.current?.loadVideoById(vs[next].id)
      stateRef.current.onVideoChange(next)
    },
    prev: () => {
      const { videos: vs, index: ci } = stateRef.current
      const prev = (ci - 1 + vs.length) % vs.length
      stateRef.current.index = prev
      playerRef.current?.loadVideoById(vs[prev].id)
      stateRef.current.onVideoChange(prev)
    },
    toggleMute: () => {
      if (!playerRef.current) return
      if (playerRef.current.isMuted()) {
        playerRef.current.unMute()
      } else {
        playerRef.current.mute()
      }
    },
  }))

  useEffect(() => {
    if (!videos.length) return

    stateRef.current.index = 0

    const create = () => {
      if (!containerRef.current) return
      playerRef.current?.destroy()
      const el = document.createElement('div')
      el.style.cssText = 'width:100%;height:100%;display:block;'
      containerRef.current.innerHTML = ''
      containerRef.current.appendChild(el)
      playerRef.current = new window.YT.Player(el, {
        videoId: videos[0].id,
        playerVars: { autoplay: 1, mute: 1, rel: 0, controls: 1 },
        events: {
          onStateChange: (e: { data: number }) => {
            if (e.data === 0) {
              const { videos: vs, index: ci, onVideoChange: vc } = stateRef.current
              const next = (ci + 1) % vs.length
              stateRef.current.index = next
              playerRef.current?.loadVideoById(vs[next].id)
              vc(next)
            }
          },
          onError: () => {
            const { videos: vs, index: ci, onVideoChange: vc } = stateRef.current
            const next = (ci + 1) % vs.length
            stateRef.current.index = next
            playerRef.current?.loadVideoById(vs[next].id)
            vc(next)
          },
        },
      })
    }

    if (window.YT?.Player) {
      create()
    } else {
      window.onYouTubeIframeAPIReady = create
      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const tag = document.createElement('script')
        tag.src = 'https://www.youtube.com/iframe_api'
        document.head.appendChild(tag)
      }
    }

    return () => {
      playerRef.current?.destroy()
      playerRef.current = null
    }
  }, [videos])

  if (!videos.length) {
    return (
      <div className={styles.panel}>
        <div className={styles.loading}>動画を読み込み中…</div>
      </div>
    )
  }

  return (
    <div className={styles.panel}>
      <div ref={containerRef} className={styles.player} />
    </div>
  )
})

export default VideoPanel
