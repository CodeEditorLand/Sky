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
import { IUriIdentityService } from "./uriIdentity.js";
import { URI } from "../../../base/common/uri.js";
import { registerSingleton } from "../../instantiation/common/extensions.js";
import { IFileService } from "../../files/common/files.js";
import { ExtUri, normalizePath } from "../../../base/common/resources.js";
import { Event } from "../../../base/common/event.js";
import { DisposableStore } from "../../../base/common/lifecycle.js";
import { quickSelect } from "../../../base/common/arrays.js";
class Entry {
  static {
    __name(this, "Entry");
  }
  static {
    this._clock = 0;
  }
  constructor(uri) {
    this.uri = uri;
    this.time = Entry._clock++;
  }
  touch() {
    this.time = Entry._clock++;
    return this;
  }
}
let UriIdentityService = class UriIdentityService2 {
  static {
    __name(this, "UriIdentityService");
  }
  constructor(_fileService) {
    this._fileService = _fileService;
    this._dispooables = new DisposableStore();
    this._limit = 2 ** 16;
    const schemeIgnoresPathCasingCache = /* @__PURE__ */ new Map();
    const ignorePathCasing = /* @__PURE__ */ __name((uri) => {
      let ignorePathCasing2 = schemeIgnoresPathCasingCache.get(uri.scheme);
      if (ignorePathCasing2 === void 0) {
        ignorePathCasing2 = _fileService.hasProvider(uri) && !this._fileService.hasCapability(
          uri,
          1024
          /* FileSystemProviderCapabilities.PathCaseSensitive */
        );
        schemeIgnoresPathCasingCache.set(uri.scheme, ignorePathCasing2);
      }
      return ignorePathCasing2;
    }, "ignorePathCasing");
    this._dispooables.add(Event.any(_fileService.onDidChangeFileSystemProviderRegistrations, _fileService.onDidChangeFileSystemProviderCapabilities)((e) => {
      const oldIgnorePathCasingValue = schemeIgnoresPathCasingCache.get(e.scheme);
      if (oldIgnorePathCasingValue === void 0) {
        return;
      }
      schemeIgnoresPathCasingCache.delete(e.scheme);
      const newIgnorePathCasingValue = ignorePathCasing(URI.from({ scheme: e.scheme }));
      if (newIgnorePathCasingValue === newIgnorePathCasingValue) {
        return;
      }
      for (const [key, entry] of this._canonicalUris.entries()) {
        if (entry.uri.scheme !== e.scheme) {
          continue;
        }
        this._canonicalUris.delete(key);
      }
    }));
    this.extUri = new ExtUri(ignorePathCasing);
    this._canonicalUris = /* @__PURE__ */ new Map();
  }
  dispose() {
    this._dispooables.dispose();
    this._canonicalUris.clear();
  }
  asCanonicalUri(uri) {
    if (this._fileService.hasProvider(uri)) {
      uri = normalizePath(uri);
    }
    const uriKey = this.extUri.getComparisonKey(uri, true);
    const item = this._canonicalUris.get(uriKey);
    if (item) {
      return item.touch().uri.with({ fragment: uri.fragment });
    }
    this._canonicalUris.set(uriKey, new Entry(uri));
    this._checkTrim();
    return uri;
  }
  _checkTrim() {
    if (this._canonicalUris.size < this._limit) {
      return;
    }
    Entry._clock = 1;
    const times = [...this._canonicalUris.values()].map((e) => e.time);
    const median = quickSelect(Math.floor(times.length / 2), times, (a, b) => a - b);
    for (const [key, entry] of this._canonicalUris.entries()) {
      if (entry.time <= median) {
        this._canonicalUris.delete(key);
      } else {
        entry.time = 0;
      }
    }
  }
};
UriIdentityService = __decorate([
  __param(0, IFileService)
], UriIdentityService);
registerSingleton(
  IUriIdentityService,
  UriIdentityService,
  1
  /* InstantiationType.Delayed */
);
export {
  UriIdentityService
};
//# sourceMappingURL=uriIdentityService.js.map
