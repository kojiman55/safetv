import './globals.css'

export const metadata = {
  title: 'SafeTV',
  description: '高齢者家庭向け、テレビで動く防災・生活情報ダッシュボード',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
