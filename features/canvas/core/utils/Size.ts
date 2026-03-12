import EventEmitter from "./EventEmitter";

export class Size extends EventEmitter {
  private onResize = () => {
    this.trigger("resize");
  };

  constructor() {
    super();

    window.addEventListener("resize", this.onResize);
  }

  destroy() {
    window.removeEventListener("resize", this.onResize);
  }
}
