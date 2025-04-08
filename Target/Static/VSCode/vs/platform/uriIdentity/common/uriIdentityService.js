var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { IUriIdentityService } from "./uriIdentity.js";
import { URI } from "../../../base/common/uri.js";
import { InstantiationType, registerSingleton } from "../../instantiation/common/extensions.js";
import { IFileService, FileSystemProviderCapabilities, IFileSystemProviderCapabilitiesChangeEvent, IFileSystemProviderRegistrationEvent } from "../../files/common/files.js";
import { ExtUri, IExtUri, normalizePath } from "../../../base/common/resources.js";
import { SkipList } from "../../../base/common/skipList.js";
import { Event } from "../../../base/common/event.js";
import { DisposableStore } from "../../../base/common/lifecycle.js";
class Entry {
  constructor(uri) {
    this.uri = uri;
  }
  static {
    __name(this, "Entry");
  }
  static _clock = 0;
  time = Entry._clock++;
  touch() {
    this.time = Entry._clock++;
    return this;
  }
}
let UriIdentityService = class {
  constructor(_fileService) {
    this._fileService = _fileService;
    const schemeIgnoresPathCasingCache = /* @__PURE__ */ new Map();
    const ignorePathCasing = /* @__PURE__ */ __name((uri) => {
      let ignorePathCasing2 = schemeIgnoresPathCasingCache.get(uri.scheme);
      if (ignorePathCasing2 === void 0) {
        ignorePathCasing2 = _fileService.hasProvider(uri) && !this._fileService.hasCapability(uri, FileSystemProviderCapabilities.PathCaseSensitive);
        schemeIgnoresPathCasingCache.set(uri.scheme, ignorePathCasing2);
      }
      return ignorePathCasing2;
    }, "ignorePathCasing");
    this._dispooables.add(Event.any(
      _fileService.onDidChangeFileSystemProviderRegistrations,
      _fileService.onDidChangeFileSystemProviderCapabilities
    )((e) => {
      schemeIgnoresPathCasingCache.delete(e.scheme);
    }));
    this.extUri = new ExtUri(ignorePathCasing);
    this._canonicalUris = new SkipList((a, b) => this.extUri.compare(a, b, true), this._limit);
  }
  static {
    __name(this, "UriIdentityService");
  }
  extUri;
  _dispooables = new DisposableStore();
  _canonicalUris;
  _limit = 2 ** 16;
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
UriIdentityService = __decorateClass([
  __decorateParam(0, IFileService)
], UriIdentityService);
registerSingleton(IUriIdentityService, UriIdentityService, InstantiationType.Delayed);
export {
  UriIdentityService
};
//# sourceMappingURL=uriIdentityService.js.map
