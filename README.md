### 注意点

遷移の時、下記のように

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

### デバイスの判定

low/ medium/ high の 3 つのレベルで判定
low: タッチ判定または 768px 以下または dpr >= 3 (スマホ・iPad)
medium: dpr >= 2 (MacBook)
high: それ以外 (dpr1 の PC モニター)

### 最終チェック

- Canvas 全体 の destroy を過不足ないか確認
- Resource.ts の余計な記述を削除
- Canvas 全体から import していないか確認
- Environment.ts 必要か
- gui, stats を消す
