import EventEmitter from "./EventEmitter";

export class Time extends EventEmitter {
  start: number;
  current: number;
  elapsed: number;
  delta: number;
  isActive: boolean;
  private rafId: number | null;
  private isDestroyed: boolean;

  constructor() {
    super();

    this.start = Date.now();
    this.current = this.start;
    this.elapsed = 0;
    this.delta = 16 / 1000;
    this.isActive = true;
    this.rafId = null;
    this.isDestroyed = false;

    this.setupVisibilityListeners();
    this.tick = this.tick.bind(this);
    this.tick();
  }

  private setupVisibilityListeners() {
    // Page Visibility APIを使用してウィンドウの表示状態を監視
    document.addEventListener("visibilitychange", this.handleVisibilityChange);

    // フォールバック: windowのblur/focusイベントも監視
    window.addEventListener("blur", this.handleBlur);
    window.addEventListener("focus", this.handleFocus);
  }

  private handleVisibilityChange = () => {
    if (document.hidden) {
      this.isActive = false;
    } else {
      this.isActive = true;
      // 再開時に現在時刻を更新して、大きなdeltaを防ぐ
      this.current = Date.now();
    }
  };

  private handleBlur = () => {
    this.isActive = false;
  };

  private handleFocus = () => {
    this.isActive = true;
    // 再開時に現在時刻を更新して、大きなdeltaを防ぐ
    this.current = Date.now();
  };

  private tick() {
    if (this.isDestroyed) {
      return;
    }

    this.rafId = window.requestAnimationFrame(this.tick);

    // ウィンドウが非アクティブな場合はtickイベントを発火しない
    if (!this.isActive) {
      return;
    }

    const currentTime = Date.now();
    this.delta = (currentTime - this.current) / 1000;
    this.delta = Math.min(this.delta, 0.1);
    this.current = currentTime;
    this.elapsed = (this.current - this.start) / 1000;

    this.trigger("tick");
  }

  destroy() {
    this.isDestroyed = true;

    if (this.rafId !== null) {
      window.cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    document.removeEventListener(
      "visibilitychange",
      this.handleVisibilityChange
    );
    window.removeEventListener("blur", this.handleBlur);
    window.removeEventListener("focus", this.handleFocus);
  }
}
