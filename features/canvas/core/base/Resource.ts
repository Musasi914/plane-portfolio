import { Texture, TextureLoader } from "three";
import type { Source } from "../source";
import EventEmitter from "../utils/EventEmitter";

export class Resource extends EventEmitter {
  loaders: {
    textureLoader: TextureLoader;
  };
  items: Record<string, Texture>;
  sources: Source[];
  loaded: number;
  allSources: number;

  constructor(sources: Source[]) {
    super();

    this.loaders = this.setLoaders();
    this.items = {};
    this.sources = sources;
    this.loaded = 0;
    this.allSources = this.sources.length;

    this.startLoading();
  }

  private setLoaders() {
    return {
      textureLoader: new TextureLoader(),
    };
  }

  private startLoading() {
    for (const source of this.sources) {
      switch (source.type) {
        case "texture":
          if (typeof source.path === "string") {
            this.loaders.textureLoader.load(source.path, (file) => {
              this.sourceLoaded(source, file);
            });
          } else {
            console.error(
              `Invalid path for texture source "${source.name}": expected string, got`,
              source.path
            );
          }
          break;

        default:
          break;
      }
    }
  }

  private sourceLoaded(source: Source, item: Texture) {
    this.items[source.name] = item;
    this.loaded++;
    if (this.loaded === this.allSources) {
      this.trigger("ready");
    }
  }

  destroy() {
    this.off("ready");
    for(const item of Object.values(this.items)) {
      item.dispose();
    }
    this.items = {};
  }
}
