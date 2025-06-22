var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { URI } from "../../../../base/common/uri.js";
import { ExtensionIdentifier } from "../../../../platform/extensions/common/extensions.js";
import { WebviewInput } from "./webviewEditorInput.js";
import { IWebviewWorkbenchService } from "./webviewWorkbenchService.js";
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
let WebviewEditorInputSerializer = class WebviewEditorInputSerializer2 {
  static {
    __name(this, "WebviewEditorInputSerializer");
  }
  static {
    this.ID = WebviewInput.typeId;
  }
  constructor(_webviewWorkbenchService) {
    this._webviewWorkbenchService = _webviewWorkbenchService;
  }
  canSerialize(input) {
    return this._webviewWorkbenchService.shouldPersist(input);
  }
  serialize(input) {
    if (!this.canSerialize(input)) {
      return void 0;
    }
    const data = this.toJson(input);
    try {
      return JSON.stringify(data);
    } catch {
      return void 0;
    }
  }
  deserialize(_instantiationService, serializedEditorInput) {
    const data = this.fromJson(JSON.parse(serializedEditorInput));
    return this._webviewWorkbenchService.openRevivedWebview({
      webviewInitInfo: {
        providedViewType: data.providedId,
        origin: data.origin,
        title: data.title,
        options: data.webviewOptions,
        contentOptions: data.contentOptions,
        extension: data.extension
      },
      viewType: data.viewType,
      title: data.title,
      iconPath: data.iconPath,
      state: data.state,
      group: data.group
    });
  }
  fromJson(data) {
    return {
      ...data,
      extension: reviveWebviewExtensionDescription(data.extensionId, data.extensionLocation),
      iconPath: reviveIconPath(data.iconPath),
      state: reviveState(data.state),
      webviewOptions: restoreWebviewOptions(data.options),
      contentOptions: restoreWebviewContentOptions(data.options)
    };
  }
  toJson(input) {
    return {
      origin: input.webview.origin,
      viewType: input.viewType,
      providedId: input.providedId,
      title: input.getName(),
      options: { ...input.webview.options, ...input.webview.contentOptions },
      extensionLocation: input.extension?.location,
      extensionId: input.extension?.id.value,
      state: input.webview.state,
      iconPath: input.iconPath ? { light: input.iconPath.light, dark: input.iconPath.dark } : void 0,
      group: input.group
    };
  }
};
WebviewEditorInputSerializer = __decorate([
  __param(0, IWebviewWorkbenchService)
], WebviewEditorInputSerializer);
function reviveWebviewExtensionDescription(extensionId, extensionLocation) {
  if (!extensionId) {
    return void 0;
  }
  const location = reviveUri(extensionLocation);
  if (!location) {
    return void 0;
  }
  return {
    id: new ExtensionIdentifier(extensionId),
    location
  };
}
__name(reviveWebviewExtensionDescription, "reviveWebviewExtensionDescription");
function reviveIconPath(data) {
  if (!data) {
    return void 0;
  }
  const light = reviveUri(data.light);
  const dark = reviveUri(data.dark);
  return light && dark ? { light, dark } : void 0;
}
__name(reviveIconPath, "reviveIconPath");
function reviveUri(data) {
  if (!data) {
    return void 0;
  }
  try {
    if (typeof data === "string") {
      return URI.parse(data);
    }
    return URI.from(data);
  } catch {
    return void 0;
  }
}
__name(reviveUri, "reviveUri");
function reviveState(state) {
  return typeof state === "string" ? state : void 0;
}
__name(reviveState, "reviveState");
function restoreWebviewOptions(options) {
  return options;
}
__name(restoreWebviewOptions, "restoreWebviewOptions");
function restoreWebviewContentOptions(options) {
  return {
    ...options,
    localResourceRoots: options.localResourceRoots?.map((uri) => reviveUri(uri))
  };
}
__name(restoreWebviewContentOptions, "restoreWebviewContentOptions");
export {
  WebviewEditorInputSerializer,
  restoreWebviewContentOptions,
  restoreWebviewOptions,
  reviveWebviewExtensionDescription
};
//# sourceMappingURL=webviewEditorInputSerializer.js.map
