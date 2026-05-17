---
title: "テレビ型UIをWebで作ったら、設計の答えが画面から出てきた"
emoji: "📺"
type: "tech"
topics: ["nextjs", "lambda", "typescript", "aws", "youtube"]
published: true
---

テレビは「何もしなくていい」UIだ。

リモコンのチャンネルを変えれば次の映像が流れる。音量ボタンを押せば音が変わる。それ以外はただ眺めていればいい。操作を覚える必要も、アプリを探す必要も、ログインする必要もない。

この「何もしなくていい」を、Webアプリで再現しようとした。

デモ: https://mirutv.eggsystems.jp

---

## 画面が先、コードが後

普段は要件定義→設計→実装の順で進めることが多いが、今回は最初にFigmaで画面を描いた。理由は単純で、「テレビっぽさ」は言葉で定義できないからだ。

16:9の画面比率。左60%に動画プレイヤー。右40%に天気とニュース。下部にチャンネルバー。ヘッダーに時計。

この配置を紙に書いたとき、コンポーネント構成がほぼ確定した。画面が設計書を兼ねていた。

```
┌─────────────────────────────────────────┐
│  15:30  2026年5月17日（日）      MiruTV  │  ← Header
├──────────────────────┬──────────────────┤
│                      │  ☀️ 大阪府 今日  │
│   YouTube Player     │  天気予報        │  ← WeatherPanel
│                      ├──────────────────┤
│                      │  📰 最新ニュース  │
│                      │  ・〇〇で〜〜    │  ← NewsPanel
├──────────────────────┴──────────────────┤
│  [ANNnewsCH] [TBS]  ◀ 前  次 ▶  🔊    │  ← ChannelBar
└─────────────────────────────────────────┘
```

---

## YouTube APIを使わなかった理由

YouTubeの動画一覧を取得するには公式のData API v3が筋道だが、使わなかった。

理由はAPIキーの管理コストと、無料枠のクォータだ。Data API v3は1日10,000ユニットの制限があり、チャンネルあたり数十ユニット消費する。デモ用途でチャンネルを追加するたびにクォータを気にするのは面倒だった。

代わりに使ったのがYouTube RSSフィード。

```
https://www.youtube.com/feeds/videos.xml?channel_id=UCxxxxxxx
```

APIキー不要、認証不要、レート制限も実質ない。XMLをパースして最新10本の動画IDを取得するだけ。

ただし落とし穴があって、このRSSフィードは2018年以前に作られた「レガシーチャンネル」しか対応していない。フジテレビ、テレ東、NHKといった主要局のチャンネルは軒並み404を返した。

```
RSS_FAIL 404: NHK (UCip8ve30-AoX2y2OtAAmqFA)
RSS_FAIL 404: フジテレビ公式 (UC7_mFzmj89tqAqgpl5695QQ)
```

結果として使えるチャンネルは限られるが、デモとしては十分機能する。「使えるものだけ表示する」設計にしたので、RSSが取れないチャンネルは静かに除外される。

---

## Lambdaのキャッシュ戦略

RSSフィードへのリクエストはLambdaのモジュールスコープに`Map`を置いてキャッシュしている。

```typescript
type CacheEntry = {
  videos: { id: string; title: string; description: string; channelName: string }[]
  expires: number
}
const rssCache = new Map<string, CacheEntry>()
const RSS_TTL = 10 * 60 * 1000 // 10分

async function fetchChannelVideos(id: string, name: string) {
  const now = Date.now()
  const cached = rssCache.get(id)
  if (cached && cached.expires > now) return { id, name, videos: cached.videos }
  // ...fetch and cache
}
```

Lambdaのコンテナは一定時間ウォームアップ状態を保つので、10分以内のリクエストはキャッシュから返る。YouTubeへのリクエストを大幅に削減できる。

ただしコンテナが再起動するとキャッシュは消える。許容範囲として割り切った。永続化したいならElastiCacheやDynamoDBに出すが、デモ用途でそこまでやる必要はない。

---

## 災害アラートは「画面を乗っ取る」設計にした

気象庁の防災情報APIは5分ごとにEventBridgeで叩き、結果をS3に保存する。フロントはS3キャッシュを読むだけなので、ユーザーアクセスのたびに気象庁を叩かない。

```
EventBridge（5分ごと）
  └─ Lambda → 気象庁API → S3 (alerts/latest-osaka.json)

ブラウザ（5分ごとにポーリング）
  └─ API Gateway → Lambda → S3を読む
```

警戒レベル3以上を検知すると、フロントはlocalStorageにアラート情報を保存してから`/alert`ページに遷移する。通常画面に戻るボタンはない。これは意図的な設計で、アラート中はニュースも天気も動画も見せない。

```typescript
useEffect(() => {
  if (alert.level >= 3) {
    localStorage.setItem('current_alert', JSON.stringify(alert))
    router.push('/alert')
  }
}, [alert, router])
```

アラート画面には避難行動を促す3つのボタンだけが並ぶ。「避難所に向かう」「救助を希望する」「家族に連絡して」。デモ版なのでボタンを押すとダイアログが出るだけだが、実運用なら通報機能につなげる想定。

---

## 都道府県選択だけで全部動く

セットアップ画面は都道府県のドロップダウン一つ。

選択すると気象庁の6桁エリアコードが自動で決まり、天気予報とアラートの両方に使いまわす。

```typescript
const PREFECTURES = [
  { name: '北海道', areaCode: '016000' },
  // ...
  { name: '大阪府', areaCode: '270000' },
  // ...
]
```

住所入力も位置情報取得も不要にした。精度よりも「迷わず設定できる」を優先した結果だ。

---

## 技術スタック

| レイヤー | 技術 |
|---|---|
| フロントエンド | Next.js 16 / TypeScript |
| バックエンド | AWS Lambda / API Gateway / esbuild |
| インフラ | AWS SAM / S3 / CloudFront / EventBridge |
| 外部API | NHK Web API / 気象庁API / YouTube RSS |

インフラはSAMで管理。LambdaはTypeScriptをesbuildでバンドルしてデプロイする。ビルドが速い（16ms）のでイテレーションが早い。

---

## 作ってみて気づいたこと

テレビというフォームファクターは制約が多い。マウスは使えない（前提）、キーボードも使えない（前提）、ログインもさせない（前提）。この制約を全部受け入れると、UIの選択肢が勝手に絞られた。

制約があると設計が楽になる、というのは本当だと思う。

リポジトリ: https://github.com/kojiman55/mirutv
