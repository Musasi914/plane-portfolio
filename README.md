# やること

- ホバー中にカーソルの下にポップアップ
- 直接 /gallery/[slug] でアクセスしたときの未対応
- [slug]で wordpressApi からとる
- カーソル通常時とうめいでいいかも
- pointer 位置でカメラ移動（gallery）
- plane クリックで遷移
- 背景真っ白どうしよう
- loading 画面
- introPlaying 挙動
- introPlaying plane を追加
- 音声再生
- 動画の画質問題
- シーンと見てる plane によってタイトルを変える
- face 画像マシなものに
- sp 実装

# 工夫点

intro にて　
縦長画面、横長画面で違う配置・違う動作にした。

ページ遷移で url 叩いても自然なように

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
