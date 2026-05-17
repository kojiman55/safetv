'use client'

export default function TvScreen({ children }: { children: React.ReactNode }) {
  return (
    <div className="tv-container">
      <div className="tv-screen">{children}</div>
    </div>
  )
}
