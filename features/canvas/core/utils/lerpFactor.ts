/**
 * フレームレート非依存の lerp 係数を返す
 * @param rate - 60fps 時の 1 フレームあたりの補間率（0.1 = 10%）
 * @param delta - 前フレームからの経過秒数
 * @returns lerp の第3引数に渡す係数
 */
export default function lerpFactor(rate: number, delta: number): number {
  if (rate <= 0) return 0;
  if (rate >= 1) return 1;
  const decay = -60 * Math.log(1 - rate);
  return 1 - Math.exp(-decay * delta);
}
