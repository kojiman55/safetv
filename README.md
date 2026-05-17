# MiruTV

ニュース・天気・旅行・自然のYouTube動画を、テレビ画面風のUIで一覧表示する家族向けWebダッシュボード。NHKニュース・気象庁天気・避難アラートをリアルタイムで取得し、災害時は自動で警戒画面に切り替わる。

**デモ**: https://mirutv.eggsystems.jp

対象エリアは全都道府県（天気・アラートは都道府県単位）。

---

## スクリーンショット

| メイン画面 | 避難アラート |
|:---:|:---:|
| ![メイン](docs/screenshots/mirutv-main.png) | ![アラート](docs/screenshots/mirutv-alert.png) |

---

## 何ができるか

初回起動時に都道府県を選ぶだけで、以下がすべて自動で動く。

- **YouTube動画の連続再生** — ニュース・天気・旅行・自然の4カテゴリをチャンネルバーで切り替え。YouTube RSSフィードから最新10本を取得して自動連続再生。前の動画・次の動画・消音切り替えに対応。
- **NHKニュース一覧** — NHKのトピックスAPIから最新ニュースを取得。7件ずつ30秒ごとにスクロール表示。
- **天気予報** — 気象庁APIから選択中の都道府県の今日・明日・あさっての天気と気温を表示。
- **災害アラート自動割り込み** — 気象庁の防災情報APIを5分ごとにチェックし、警戒レベル3以上を検知すると警戒画面に自動遷移。避難指示・大雨警報などの種別・発令エリア・発令時刻を全画面表示。

---

## 技術スタック

| レイヤー | 技術 |
|---|---|
| フロントエンド | Next.js 16 (App Router) / TypeScript |
| バックエンド | AWS Lambda (TypeScript / esbuild) / API Gateway |
| インフラ | AWS SAM / S3 / CloudFront (OAC) / EventBridge |
| 外部API | NHK Web API / 気象庁 防災情報API / YouTube RSS |

---

## システム構成

```
ブラウザ（Next.js SPA）
  ├─ /api/content?type=youtube  → Lambda → YouTube RSS フィード
  ├─ /api/content?type=news     → Lambda → NHK Web API
  ├─ /api/content?type=weather  → Lambda → 気象庁 天気予報API
  └─ /api/content?type=alert    → Lambda → S3（最新アラートキャッシュ）

EventBridge（5分ごと）
  └─ Lambda (alert) → 気象庁 防災情報API → S3に保存
```

フロントエンドはNext.jsの静的エクスポートをS3+CloudFrontで配信。バックエンドLambdaはRSSフィードを10分間インメモリキャッシュし、YouTube RSSへのリクエスト数を抑制している。

---

## 設計上の工夫

### YouTube RSSキャッシュ

YouTube IFrame APIは埋め込み再生に使用するが、チャンネルの動画一覧は公式APIキーなしで取得できるYouTube RSSフィード（`youtube.com/feeds/videos.xml?channel_id=...`）を活用している。Lambdaのモジュールスコープに`Map`でキャッシュを持ち、10分間は再リクエストしない設計。RSSが取得できないチャンネルはレスポンスから除外するため、フロントには常に再生可能なチャンネルのみ届く。

### 災害アラートの非同期チェック

気象庁APIへのチェックはEventBridgeで5分ごとに起動するLambdaが担当し、結果をS3にJSONで保存する。フロントはこのS3キャッシュをAPI Gateway経由で読み出すだけなので、ユーザーリクエストのたびに気象庁APIを叩かない設計になっている。警戒レベルはフロントで5分ごとにポーリングし、レベル3以上を検知したタイミングでlocalStorageにアラート情報を保存してから警戒画面（`/alert`）に遷移する。

### 都道府県ベースの設定

初回セットアップはドロップダウンで都道府県を選ぶだけ。選択値から気象庁の6桁エリアコード（例: `270000` = 大阪府）を自動で引き当て、天気予報・アラートチェックの両方に使いまわす。住所入力・位置情報取得を不要にすることで、ITに不慣れなユーザーでも迷わず使える操作フローを実現している。

### アクセス制御

API GatewayのスロットリングとLambdaの予約済み同時実行数を組み合わせ、外部API（YouTube RSS・NHK・気象庁）への過剰リクエストを防いでいる。スロットリング時のレスポンスにはCORSヘッダーを付与するGateway Responseも設定済み。

---

## セットアップ

### 必要なもの

- AWS アカウント（SAM CLI・AWS CLI 設定済み）
- Node.js v20 以上

### バックエンドのデプロイ

```bash
cd backend && npm install && npm run build
cd ..
sam build && sam deploy --guided
```

デプロイ後に表示される `ApiUrl` を控える。

### 気象庁アラートの初回取得

EventBridgeが最初に起動するまでの間、手動で実行しておく。

```bash
aws lambda invoke \
  --function-name safetv-alert \
  --region ap-northeast-1 \
  /dev/null
```

### フロントエンドのローカル起動

```bash
cd frontend
cp .env.example .env.local
# NEXT_PUBLIC_API_URL に SAM デプロイ後の ApiUrl を設定
npm install && npm run dev
```

---

## コスト（デモ運用時）

| サービス | 費用 |
|---|---|
| Lambda + API Gateway | $0（無料枠内） |
| S3 × 1バケット | $0（無料枠内） |
| CloudFront | $0（無料枠内） |
| EventBridge | $0（無料枠内） |
| Route 53 | $0.50（既存ホストゾーン） |
| **合計** | **約 $0.50 / 月** |

NHK Web API・気象庁API・YouTube RSS はすべて無償。

---

## データソース

- [NHK Web API](https://api.nhk.or.jp/)（ニュース）
- [気象庁 防災情報API](https://www.jma.go.jp/bosai/)（天気予報・アラート）
- YouTube RSSフィード（各チャンネルの最新動画）
