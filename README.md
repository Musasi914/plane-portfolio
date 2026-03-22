# やること

- introPlaying で他 window に blur した時とまる
- loading 画面
- face 画像マシなものに
- three-monorepo の例を使えないかな
- 音声再生
- シーンと見てる plane によってタイトルを変える
- sp 実装

# 工夫点

intro にて　
縦長画面、横長画面で違う配置・違う動作にした。

ページ遷移で url 叩いても自然なように
URL 遷移一番苦労している

WordPress を headless として使う。
「なぜ WordPress を API として使うのか」
① パフォーマンス
フロントを React / Next.js などにすると、コード分割や静的生成がしやすい
ビルド時に HTML を生成して CDN 配信すれば、リクエストごとの PHP 処理を減らせる
実際の体感速度と Lighthouse スコアの改善を説明できる
② 技術スタックの自由度
フロントを WordPress テーマに縛られず、好きなフレームワークを選べる
デザインや UI の制約が少なくなる
「既存の WordPress を活かしつつ、フロントだけモダンにしたい」というニーズに合う
③ マルチチャネル展開
同じコンテンツを Web、アプリ、音声アシスタントなど複数チャネルで使える
コンテンツを一元管理しつつ、各チャネルに最適な UI を提供できる
④ 編集者体験の維持
編集者は慣れた WordPress 管理画面のまま運用できる
フロントの技術変更に編集フローを合わせる必要がない
「非エンジニアが使いやすい CMS」を維持しつつ、フロントだけ刷新できる
⑤ スケーラビリティと運用
1 つの WordPress から複数のフロントに配信できる
コンテンツの重複管理を避けられる
フロントとバックエンドを別々にスケール・デプロイできる
⑥ 既存資産の活用
すでに WordPress で運用しているサイトを、大規模リニューアルせずに段階的に Headless 化できる
プラグインやカスタムフィールドなど、既存の仕組みを活かしやすい

wordpress を infinitefree でホスティング。name は aaa

# 注意点

## z-index

loading: 40
cursor: 50

## 遷移の時、下記のように

- setNextSceneId("");
- setIsTransitioning(true);
- setSceneTransitionProgress(progress);
- setActiveSceneId("");
- setNextSceneId(null);
- setIsTransitioning(false);

```
    const onTransitionClick = () => {
      if (transitionStarted.current) return;
      transitionStarted.current = true;
      setNextSceneId("gallery");
      setIsTransitioning(true);

      const start = performance.now();
      const duration = 1500;

      const tick = () => {
        const elapsed = performance.now() - start;
        const progress = Math.min(elapsed / duration, 1);
        setSceneTransitionProgress(progress);

        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          setActiveSceneId("gallery");
          setNextSceneId(null);
          setIsTransitioning(false);
        }
      };
      requestAnimationFrame(tick);
    };
```

## WordPressAPI について

API フェッチでエラーになる。
帰ってきている HTML が（InfinityFree）などの無料ホスティングでよくある「保護ページ」。
スクリプトを実行しない → 保護ページの HTML がそのまま返る → JSON としてパースできずエラーになる。

### 対応策

現状、WordPress の pages で固定ページの API を直接叩いたものを/public/wp-data/posts.json に貼り付けしている。
ひとまずここから取得する。

wp のライブラリを読み込む際、動画は mp4 でも webm でも再生されなかった。画像は webp だと表示されなかった。
仕方なく画像は png,動画は public において json を書き換えて読み込む。
↓ 置換用
https://freeportfolio.page.gd/wp-content/uploads/2026/03/anniversary.mp4
/detail/anniversary.webm
https://freeportfolio.page.gd/wp-content/uploads/2026/03/tabloids.mp4
/detail/tabloids.webm

活動時にはロリポップでレンタルサーバを借りるかどうか。考える。

# デバイスの判定

low/ medium/ high の 3 つのレベルで判定
low: タッチ判定または 768px 以下または dpr >= 3 (スマホ・iPad)
medium: dpr >= 2 (MacBook)
high: それ以外 (dpr1 の PC モニター)

# 最終チェック

- Canvas 全体 の destroy を過不足ないか確認
- Resource.ts の余計な記述を削除
- Canvas 全体から import していないか確認
- Environment.ts 必要か
- gui, stats を消す
