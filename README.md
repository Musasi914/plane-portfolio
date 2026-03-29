# Plane Portfolio

Three.js ベースの WebGL 体験と Next.js App Router を組み合わせた、インタラクティブなポートフォリオサイトです。イントロシーン・ギャラリーシーンの切り替え、作品詳細への遷移を、URL（`next/navigation`）と Zustand の状態と同期させています。

---

## 技術構成

| 領域           | 採用技術                                                           |
| -------------- | ------------------------------------------------------------------ |
| フレームワーク | **Next.js 16**（App Router） / **React 19**                        |
| 言語           | **TypeScript**                                                     |
| 3D / WebGL     | **Three.js**、`three-custom-shader-material`（カスタムシェーダー） |
| アニメーション | **GSAP**（`@gsap/react` と連携したトランジション等）               |
| 状態管理       | **Zustand**（アプリ全体用・ルータ連携用の 2 ストア）               |
| スタイル       | **Tailwind CSS 4**、`@tailwindcss/typography`                      |
| フォント       | `next/font`（Sora / Noto Sans JP）                                 |
| ビルド         | Turbopack（`next.config.ts` で **GLSL を raw-loader で読み込み**） |

### ディレクトリの考え方（概要）

- `app/` … ページ（トップ、ギャラリー、作品詳細 `[slug]`）
- `features/canvas/` … WebGL エントリ（`Canvas` → `Experience` → `World`、シーンごとの分割）
- `routing/RouterSync.tsx` … `pathname` と 3D シーン・フェーズの同期、ブラウザ戻る/進むとアプリ内遷移の扱い分け
- `store/` … シーン ID、遷移進捗、品質ティア、カーソル、サウンド有効など
- `lib/wp.ts` … 作品データ取得（後述の Headless WordPress / JSON 戦略）
- `public/wp-data/posts.json` … WordPress REST API 相当のスナップショット

---

## 工夫した点

### 1. URL と 3D 体験の同期

直リンク・リロード・戻る/進むでも破綻しないよう、`usePathname` と `initialPathname` / `prevPathname` を意識して、**ブラウザの履歴遷移**と**アプリ内 `router.push` による遷移**を分けています（`RouterSync` 内の `isAppNavigation` など）。URL を操うアプリでは、この区別がトランジションの二重実行やシーンの食い違いを防ぐうえで重要です。

### 2. デバイスに応じた品質ティア

`ClientDeviceSync` で **タッチ有無・ビューポート幅・DPR** から `low` / `medium` / `high` を決定し、負荷の高い表現とバランスを取っています。

### 3. レイアウトのレスポンシブ

イントロでは **縦長画面と横長画面で配置・挙動を変え**、単なる縮小ではなく端末に合わせた見せ方にしています。

### 4. アクセシビリティ・ユーザー設定

`prefers-reduced-motion` を検知してストアに反映（OS の「視覚効果を減らす」）。**フル対応（流体・パーティクル・Canvas 停止など）は改善予定**に記載しています。

### 5. 効果音（SFX）

Web Audio ベースの軽い SFX に挑戦し、操作のフィードバックを補っています。

### 6. Headless CMS としての WordPress

コンテンツは **WordPress 管理画面で編集**し、フロントは React / Next.js に寄せる構成を想定しています。

- **パフォーマンス**: フロントを静的生成・CDN 配信しやすく、体感速度や計測指標の説明につながる
- **フロントの自由度**: テーマに縛られず表現を選べる
- **編集体験**: 非エンジニア向けの運用フローを維持しつつ UI だけモダン化できる

---

## Headless WordPress とデータ取得の現状

本番の WordPress は別ホストを想定しています。開発・検証では **無料ホスティング環境の制約**により、REST API が「保護ページ」の HTML を返し JSON として扱えないことがあります。

そのため **固定ページ API のレスポンスを `public/wp-data/posts.json` に保存**し、サーバー側では `react` の `cache` 付きで読み込む方式にしています（`lib/wp.ts`）。メディアについては、環境によって mp4/webm/webp が期待どおり扱えない場合があり、**画像は PNG・動画は `public` 配下などに置き JSON を合わせる**運用で回避しています。

---

## 開発者向けメモ

### ローカル実行

```bash
pnpm install
pnpm dev
```

### z-index の目安（レイアウト調整時）

- Loading: `40` 付近
- Cursor: `50` 付近

### シーン遷移の状態更新

イントロ → ギャラリーなどでは、`nextSceneId` / `isTransitioning` / `sceneTransitionProgress` / `activeSceneId` の順序とリセットに注意してください（二重遷移防止のため `transitionStarted` 等と併用）。

---

## 改善予定・振り返り

| 項目                 | 内容                                                                                                               |
| -------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **アクセシビリティ** | `prefers-reduced-motion: reduce` 時に、流体・パーティクル・遷移アニメ・ギャラリ 3D Canvas を適切に停止・簡略化する |
| **状態設計**         | URL 連動の遷移アニメーションを、**ストアでパターンを一元管理**する設計への整理                                     |
| **ストア分割**       | 現状は Zustand を 2 系統にしているが、責務ごとに分割して可読性を上げる余地                                         |
| **CMS / 配信**       | 本番ではレンタルサーバ等に WordPress を置き、**API を直接利用**できる環境に移行し、`posts.json` 手運用を減らす     |
| **リソース最適化**   | 未使用ジオメトリの整理、`Resource` / `Environment` の整理、Canvas の `destroy` 漏れチェック                        |

---

## ライセンス

Private（就職活動・個人ポートフォリオ用途を想定）。
