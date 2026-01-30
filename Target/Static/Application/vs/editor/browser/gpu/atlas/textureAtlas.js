var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = function(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
};
var TextureAtlas_1;
import { getActiveWindow } from "../../../../base/browser/dom.js";
import { BugIndicatingError } from "../../../../base/common/errors.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { Disposable, dispose, MutableDisposable, toDisposable } from "../../../../base/common/lifecycle.js";
import { NKeyMap } from "../../../../base/common/map.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { GlyphRasterizer } from "../raster/glyphRasterizer.js";
import { IdleTaskQueue } from "../taskQueue.js";
import { TextureAtlasPage } from "./textureAtlasPage.js";
let TextureAtlas = class TextureAtlas2 extends Disposable {
  static {
    __name(this, "TextureAtlas");
  }
  static {
    TextureAtlas_1 = this;
  }
  static {
    this.maximumPageCount = 16;
  }
  get pages() {
    return this._pages;
  }
  constructor(_maxTextureSize, options, _decorationStyleCache, _themeService, _instantiationService) {
    super();
    this._maxTextureSize = _maxTextureSize;
    this._decorationStyleCache = _decorationStyleCache;
    this._themeService = _themeService;
    this._instantiationService = _instantiationService;
    this._warmUpTask = this._register(new MutableDisposable());
    this._warmedUpRasterizers = /* @__PURE__ */ new Set();
    this._pages = [];
    this._glyphPageIndex = new NKeyMap();
    this._onDidDeleteGlyphs = this._register(new Emitter());
    this.onDidDeleteGlyphs = this._onDidDeleteGlyphs.event;
    this._allocatorType = options?.allocatorType ?? "slab";
    this._register(Event.runAndSubscribe(this._themeService.onDidColorThemeChange, () => {
      if (this._colorMap) {
        this.clear();
      }
      this._colorMap = this._themeService.getColorTheme().tokenColorMap;
    }));
    const dprFactor = Math.max(1, Math.floor(getActiveWindow().devicePixelRatio));
    this.pageSize = Math.min(1024 * dprFactor, this._maxTextureSize);
    this._initFirstPage();
    this._register(toDisposable(() => dispose(this._pages)));
  }
  _initFirstPage() {
    const firstPage = this._instantiationService.createInstance(TextureAtlasPage, 0, this.pageSize, this._allocatorType);
    this._pages.push(firstPage);
    const nullRasterizer = new GlyphRasterizer(1, "", 1, this._decorationStyleCache);
    firstPage.getGlyph(nullRasterizer, "", 0, 0);
    nullRasterizer.dispose();
  }
  clear() {
    for (const page of this._pages) {
      page.dispose();
    }
    this._pages.length = 0;
    this._glyphPageIndex.clear();
    this._warmedUpRasterizers.clear();
    this._warmUpTask.clear();
    this._initFirstPage();
    this._onDidDeleteGlyphs.fire();
  }
  getGlyph(rasterizer, chars, tokenMetadata, decorationStyleSetId, x) {
    tokenMetadata &= ~(255 | 768 | 1024);
    tokenMetadata |= Math.floor(x % 1 * 10);
    if (!this._warmedUpRasterizers.has(rasterizer.id)) {
      this._warmUpAtlas(rasterizer);
      this._warmedUpRasterizers.add(rasterizer.id);
    }
    return this._tryGetGlyph(this._glyphPageIndex.get(chars, tokenMetadata, decorationStyleSetId, rasterizer.cacheKey) ?? 0, rasterizer, chars, tokenMetadata, decorationStyleSetId);
  }
  _tryGetGlyph(pageIndex, rasterizer, chars, tokenMetadata, decorationStyleSetId) {
    this._glyphPageIndex.set(pageIndex, chars, tokenMetadata, decorationStyleSetId, rasterizer.cacheKey);
    return this._pages[pageIndex].getGlyph(rasterizer, chars, tokenMetadata, decorationStyleSetId) ?? (pageIndex + 1 < this._pages.length ? this._tryGetGlyph(pageIndex + 1, rasterizer, chars, tokenMetadata, decorationStyleSetId) : void 0) ?? this._getGlyphFromNewPage(rasterizer, chars, tokenMetadata, decorationStyleSetId);
  }
  _getGlyphFromNewPage(rasterizer, chars, tokenMetadata, decorationStyleSetId) {
    if (this._pages.length >= TextureAtlas_1.maximumPageCount) {
      throw new Error(`Attempt to create a texture atlas page past the limit ${TextureAtlas_1.maximumPageCount}`);
    }
    this._pages.push(this._instantiationService.createInstance(TextureAtlasPage, this._pages.length, this.pageSize, this._allocatorType));
    this._glyphPageIndex.set(this._pages.length - 1, chars, tokenMetadata, decorationStyleSetId, rasterizer.cacheKey);
    return this._pages[this._pages.length - 1].getGlyph(rasterizer, chars, tokenMetadata, decorationStyleSetId);
  }
  getUsagePreview() {
    return Promise.all(this._pages.map((e) => e.getUsagePreview()));
  }
  getStats() {
    return this._pages.map((e) => e.getStats());
  }
  /**
   * Warms up the atlas by rasterizing all printable ASCII characters for each token color. This
   * is distrubuted over multiple idle callbacks to avoid blocking the main thread.
   */
  _warmUpAtlas(rasterizer) {
    const colorMap = this._colorMap;
    if (!colorMap) {
      throw new BugIndicatingError("Cannot warm atlas without color map");
    }
    this._warmUpTask.value?.clear();
    const taskQueue = this._warmUpTask.value = this._instantiationService.createInstance(IdleTaskQueue);
    for (let code = 65; code <= 90; code++) {
      for (const fgColor of colorMap.keys()) {
        taskQueue.enqueue(() => {
          for (let x = 0; x < 1; x += 0.1) {
            this.getGlyph(rasterizer, String.fromCharCode(code), fgColor << 15 & 16744448, 0, x);
          }
        });
      }
    }
    for (let code = 97; code <= 122; code++) {
      for (const fgColor of colorMap.keys()) {
        taskQueue.enqueue(() => {
          for (let x = 0; x < 1; x += 0.1) {
            this.getGlyph(rasterizer, String.fromCharCode(code), fgColor << 15 & 16744448, 0, x);
          }
        });
      }
    }
    for (let code = 33; code <= 126; code++) {
      for (const fgColor of colorMap.keys()) {
        taskQueue.enqueue(() => {
          for (let x = 0; x < 1; x += 0.1) {
            this.getGlyph(rasterizer, String.fromCharCode(code), fgColor << 15 & 16744448, 0, x);
          }
        });
      }
    }
  }
};
TextureAtlas = TextureAtlas_1 = __decorate([
  __param(3, IThemeService),
  __param(4, IInstantiationService)
], TextureAtlas);
export {
  TextureAtlas
};
//# sourceMappingURL=textureAtlas.js.map
