import './globals.css'

export const metadata = {
  title: 'MiruTV',
  description: '家族で楽しむ、テレビ型情報ステーション',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
