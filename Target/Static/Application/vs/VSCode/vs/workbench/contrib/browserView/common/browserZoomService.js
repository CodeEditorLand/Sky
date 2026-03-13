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
import { Emitter } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { browserZoomDefaultIndex, browserZoomFactors } from "../../../../platform/browserView/common/browserView.js";
import { zoomLevelToZoomFactor } from "../../../../platform/window/common/window.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
const IBrowserZoomService = createDecorator("browserZoomService");
const BROWSER_ZOOM_PER_HOST_STORAGE_KEY = "browserView.zoomPerHost";
const MATCH_WINDOW_ZOOM_LABEL = "Match Window";
const ZOOM_LABEL_TO_INDEX = new Map(browserZoomFactors.map((f, i) => [`${Math.round(f * 100)}%`, i]));
let BrowserZoomService = class BrowserZoomService2 extends Disposable {
  static {
    __name(this, "BrowserZoomService");
  }
  constructor(configurationService, storageService) {
    super();
    this.configurationService = configurationService;
    this.storageService = storageService;
    this._onDidChangeZoom = this._register(new Emitter());
    this.onDidChangeZoom = this._onDidChangeZoom.event;
    this._ephemeralZoomMap = /* @__PURE__ */ new Map();
    this._windowZoomFactor = zoomLevelToZoomFactor(0);
    this._persistentZoomMap = this._readPersistentZoomMap();
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("workbench.browser.pageZoom")) {
        this._onDidChangeZoom.fire({ host: void 0, isEphemeralChange: false });
      }
    }));
  }
  getEffectiveZoomIndex(host, isEphemeral) {
    if (host !== void 0) {
      if (isEphemeral) {
        const ephemeralIndex = this._ephemeralZoomMap.get(host);
        if (ephemeralIndex !== void 0) {
          return this._clamp(ephemeralIndex);
        }
      } else {
        const persistentIndex = this._persistentZoomMap[host];
        if (persistentIndex !== void 0) {
          return this._clamp(persistentIndex);
        }
      }
    }
    return this._getDefaultZoomIndex();
  }
  setHostZoomIndex(host, zoomIndex, isEphemeral) {
    const clamped = this._clamp(zoomIndex);
    const defaultIndex = this._getDefaultZoomIndex();
    const matchesDefault = clamped === defaultIndex;
    if (isEphemeral) {
      if (matchesDefault) {
        if (!this._ephemeralZoomMap.has(host)) {
          return;
        }
        this._ephemeralZoomMap.delete(host);
      } else {
        if (this._ephemeralZoomMap.get(host) === clamped) {
          return;
        }
        this._ephemeralZoomMap.set(host, clamped);
      }
      this._onDidChangeZoom.fire({ host, isEphemeralChange: true });
    } else {
      let persistentChanged = false;
      if (matchesDefault) {
        if (Object.prototype.hasOwnProperty.call(this._persistentZoomMap, host)) {
          delete this._persistentZoomMap[host];
          persistentChanged = true;
        }
      } else if (this._persistentZoomMap[host] !== clamped) {
        this._persistentZoomMap[host] = clamped;
        persistentChanged = true;
      }
      let ephemeralChanged = false;
      if (matchesDefault) {
        ephemeralChanged = this._ephemeralZoomMap.delete(host);
      } else if (this._ephemeralZoomMap.get(host) !== clamped) {
        this._ephemeralZoomMap.set(host, clamped);
        ephemeralChanged = true;
      }
      if (!persistentChanged && !ephemeralChanged) {
        return;
      }
      if (persistentChanged) {
        this._writePersistentZoomMap();
      }
      this._onDidChangeZoom.fire({ host, isEphemeralChange: false });
    }
  }
  notifyWindowZoomChanged(windowZoomFactor) {
    this._windowZoomFactor = windowZoomFactor;
    const label = this.configurationService.getValue("workbench.browser.pageZoom");
    if (label === MATCH_WINDOW_ZOOM_LABEL) {
      this._onDidChangeZoom.fire({ host: void 0, isEphemeralChange: false });
    }
  }
  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------
  _getDefaultZoomIndex() {
    const label = this.configurationService.getValue("workbench.browser.pageZoom");
    if (label === MATCH_WINDOW_ZOOM_LABEL) {
      return this._getMatchWindowZoomIndex();
    }
    return ZOOM_LABEL_TO_INDEX.get(label) ?? browserZoomDefaultIndex;
  }
  /**
   * Finds the browser zoom index whose factor is closest to the application's current UI zoom
   * factor, measuring distance on a log scale (since window zoom levels are powers of 1.2).
   */
  _getMatchWindowZoomIndex() {
    const windowFactor = this._windowZoomFactor;
    let bestIndex = browserZoomDefaultIndex;
    let bestDist = Infinity;
    for (let i = 0; i < browserZoomFactors.length; i++) {
      const dist = Math.abs(Math.log(browserZoomFactors[i]) - Math.log(windowFactor));
      if (dist < bestDist) {
        bestDist = dist;
        bestIndex = i;
      }
    }
    return bestIndex;
  }
  /**
   * Reads the persistent per-host zoom map from storage.
   * The stored format is a JSON object mapping host strings to zoom indices.
   */
  _readPersistentZoomMap() {
    const raw = this.storageService.get(
      BROWSER_ZOOM_PER_HOST_STORAGE_KEY,
      0
      /* StorageScope.PROFILE */
    );
    if (!raw) {
      return {};
    }
    try {
      const parsed = JSON.parse(raw);
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
        return {};
      }
      const result = {};
      for (const [host, index] of Object.entries(parsed)) {
        if (typeof index === "number" && index >= 0 && index < browserZoomFactors.length) {
          result[host] = index;
        }
      }
      return result;
    } catch {
      return {};
    }
  }
  _writePersistentZoomMap() {
    const hasEntries = Object.keys(this._persistentZoomMap).length > 0;
    if (hasEntries) {
      this.storageService.store(
        BROWSER_ZOOM_PER_HOST_STORAGE_KEY,
        JSON.stringify(this._persistentZoomMap),
        0,
        1
        /* StorageTarget.MACHINE */
      );
    } else {
      this.storageService.remove(
        BROWSER_ZOOM_PER_HOST_STORAGE_KEY,
        0
        /* StorageScope.PROFILE */
      );
    }
  }
  _clamp(index) {
    return Math.max(0, Math.min(Math.trunc(index), browserZoomFactors.length - 1));
  }
};
BrowserZoomService = __decorate([
  __param(0, IConfigurationService),
  __param(1, IStorageService)
], BrowserZoomService);
export {
  BrowserZoomService,
  IBrowserZoomService,
  MATCH_WINDOW_ZOOM_LABEL
};
//# sourceMappingURL=browserZoomService.js.map
