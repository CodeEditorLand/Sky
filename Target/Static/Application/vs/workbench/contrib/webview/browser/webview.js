var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { equals } from "../../../../base/common/arrays.js";
import { isEqual } from "../../../../base/common/resources.js";
import { generateUuid } from "../../../../base/common/uuid.js";
import { RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { Memento } from "../../../common/memento.js";
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
const KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_VISIBLE = new RawContextKey("webviewFindWidgetVisible", false);
const KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_FOCUSED = new RawContextKey("webviewFindWidgetFocused", false);
const KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_ENABLED = new RawContextKey("webviewFindWidgetEnabled", false);
const IWebviewService = createDecorator("webviewService");
var WebviewContentPurpose;
(function(WebviewContentPurpose2) {
  WebviewContentPurpose2["NotebookRenderer"] = "notebookRenderer";
  WebviewContentPurpose2["CustomEditor"] = "customEditor";
  WebviewContentPurpose2["WebviewView"] = "webviewView";
})(WebviewContentPurpose || (WebviewContentPurpose = {}));
function areWebviewContentOptionsEqual(a, b) {
  return a.allowMultipleAPIAcquire === b.allowMultipleAPIAcquire && a.allowScripts === b.allowScripts && a.allowForms === b.allowForms && equals(a.localResourceRoots, b.localResourceRoots, isEqual) && equals(a.portMapping, b.portMapping, (a2, b2) => a2.extensionHostPort === b2.extensionHostPort && a2.webviewPort === b2.webviewPort) && areEnableCommandUrisEqual(a, b);
}
__name(areWebviewContentOptionsEqual, "areWebviewContentOptionsEqual");
function areEnableCommandUrisEqual(a, b) {
  if (a.enableCommandUris === b.enableCommandUris) {
    return true;
  }
  if (Array.isArray(a.enableCommandUris) && Array.isArray(b.enableCommandUris)) {
    return equals(a.enableCommandUris, b.enableCommandUris);
  }
  return false;
}
__name(areEnableCommandUrisEqual, "areEnableCommandUrisEqual");
let WebviewOriginStore = class WebviewOriginStore2 {
  static {
    __name(this, "WebviewOriginStore");
  }
  constructor(rootStorageKey, storageService) {
    this._memento = new Memento(rootStorageKey, storageService);
    this._state = this._memento.getMemento(
      -1,
      1
      /* StorageTarget.MACHINE */
    );
  }
  getOrigin(viewType, additionalKey) {
    const key = this._getKey(viewType, additionalKey);
    const existing = this._state[key];
    if (existing && typeof existing === "string") {
      return existing;
    }
    const newOrigin = generateUuid();
    this._state[key] = newOrigin;
    this._memento.saveMemento();
    return newOrigin;
  }
  _getKey(viewType, additionalKey) {
    return JSON.stringify({ viewType, key: additionalKey });
  }
};
WebviewOriginStore = __decorate([
  __param(1, IStorageService)
], WebviewOriginStore);
let ExtensionKeyedWebviewOriginStore = class ExtensionKeyedWebviewOriginStore2 {
  static {
    __name(this, "ExtensionKeyedWebviewOriginStore");
  }
  constructor(rootStorageKey, storageService) {
    this._store = new WebviewOriginStore(rootStorageKey, storageService);
  }
  getOrigin(viewType, extId) {
    return this._store.getOrigin(viewType, extId.value);
  }
};
ExtensionKeyedWebviewOriginStore = __decorate([
  __param(1, IStorageService)
], ExtensionKeyedWebviewOriginStore);
export {
  ExtensionKeyedWebviewOriginStore,
  IWebviewService,
  KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_ENABLED,
  KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_FOCUSED,
  KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_VISIBLE,
  WebviewContentPurpose,
  WebviewOriginStore,
  areWebviewContentOptionsEqual
};
//# sourceMappingURL=webview.js.map
