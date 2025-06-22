var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IUriIdentityService } from "./uriIdentity.js";
import { registerSingleton } from "../../instantiation/common/extensions.js";
import { IFileService } from "../../files/common/files.js";
import { ExtUri, normalizePath } from "../../../base/common/resources.js";
import { SkipList } from "../../../base/common/skipList.js";
import { Event } from "../../../base/common/event.js";
import { DisposableStore } from "../../../base/common/lifecycle.js";
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
      schemeIgnoresPathCasingCache.delete(e.scheme);
    }));
    this.extUri = new ExtUri(ignorePathCasing);
    this._canonicalUris = new SkipList((a, b) => this.extUri.compare(a, b, true), this._limit);
  }
  dispose() {
    this._dispooables.dispose();
    this._canonicalUris.clear();
  }
  asCanonicalUri(uri) {
    if (this._fileService.hasProvider(uri)) {
      uri = normalizePath(uri);
    }
    const item = this._canonicalUris.get(uri);
    if (item) {
      return item.touch().uri.with({ fragment: uri.fragment });
    }
    this._canonicalUris.set(uri, new Entry(uri));
    this._checkTrim();
    return uri;
  }
  _checkTrim() {
    if (this._canonicalUris.size < this._limit) {
      return;
    }
    const entries = [...this._canonicalUris.entries()].sort((a, b) => {
      if (a[1].time < b[1].time) {
        return 1;
      } else if (a[1].time > b[1].time) {
        return -1;
      } else {
        return 0;
      }
    });
    Entry._clock = 0;
    this._canonicalUris.clear();
    const newSize = this._limit * 0.5;
    for (let i = 0; i < newSize; i++) {
      this._canonicalUris.set(entries[i][0], entries[i][1].touch());
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
