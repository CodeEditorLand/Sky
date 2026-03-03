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
import { Delayer } from "../../../../base/common/async.js";
import { Schemas } from "../../../../base/common/network.js";
import { consumeStream } from "../../../../base/common/stream.js";
import { ProxyChannel } from "../../../../base/parts/ipc/common/ipc.js";
import { IAccessibilityService } from "../../../../platform/accessibility/common/accessibility.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IMainProcessService } from "../../../../platform/ipc/common/mainProcessService.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { INativeHostService } from "../../../../platform/native/common/native.js";
import { INotificationService } from "../../../../platform/notification/common/notification.js";
import { IRemoteAuthorityResolverService } from "../../../../platform/remote/common/remoteAuthorityResolver.js";
import { ITunnelService } from "../../../../platform/tunnel/common/tunnel.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.js";
import { IWorkbenchEnvironmentService } from "../../../services/environment/common/environmentService.js";
import { WebviewElement } from "../browser/webviewElement.js";
import { WindowIgnoreMenuShortcutsManager } from "./windowIgnoreMenuShortcutsManager.js";
let ElectronWebviewElement = class ElectronWebviewElement2 extends WebviewElement {
  static {
    __name(this, "ElectronWebviewElement");
  }
  get platform() {
    return "electron";
  }
  constructor(initInfo, webviewThemeDataProvider, contextMenuService, tunnelService, fileService, environmentService, remoteAuthorityResolverService, logService, configurationService, mainProcessService, notificationService, _nativeHostService, instantiationService, accessibilityService, uriIdentityService) {
    super(initInfo, webviewThemeDataProvider, configurationService, contextMenuService, notificationService, environmentService, fileService, logService, remoteAuthorityResolverService, tunnelService, instantiationService, accessibilityService, uriIdentityService);
    this._nativeHostService = _nativeHostService;
    this._findStarted = false;
    this._iframeDelayer = this._register(new Delayer(200));
    this._webviewKeyboardHandler = new WindowIgnoreMenuShortcutsManager(configurationService, mainProcessService, _nativeHostService);
    this._webviewMainService = ProxyChannel.toService(mainProcessService.getChannel("webview"));
    if (initInfo.options.enableFindWidget) {
      this._register(this.onDidHtmlChange((newContent) => {
        if (this._findStarted && this._cachedHtmlContent !== newContent) {
          this.stopFind(false);
          this._cachedHtmlContent = newContent;
        }
      }));
      this._register(this._webviewMainService.onFoundInFrame((result) => {
        this._hasFindResult.fire(result.matches > 0);
      }));
    }
  }
  dispose() {
    this._webviewKeyboardHandler.didBlur();
    super.dispose();
  }
  webviewContentEndpoint(iframeId) {
    return `${Schemas.vscodeWebview}://${iframeId}`;
  }
  streamToBuffer(stream) {
    return consumeStream(stream, (buffers) => {
      const totalLength = buffers.reduce((prev, curr) => prev + curr.byteLength, 0);
      const ret = new ArrayBuffer(totalLength);
      const view = new Uint8Array(ret);
      let offset = 0;
      for (const element of buffers) {
        view.set(element.buffer, offset);
        offset += element.byteLength;
      }
      return ret;
    });
  }
  /**
   * Webviews expose a stateful find API.
   * Successive calls to find will move forward or backward through onFindResults
   * depending on the supplied options.
   *
   * @param value The string to search for. Empty strings are ignored.
   */
  find(value, previous) {
    if (!this.element) {
      return;
    }
    if (!this._findStarted) {
      this.updateFind(value);
    } else {
      const options = { forward: !previous, findNext: false, matchCase: false };
      this._webviewMainService.findInFrame({ windowId: this._nativeHostService.windowId }, this.id, value, options);
    }
  }
  updateFind(value) {
    if (!value || !this.element) {
      return;
    }
    const options = {
      forward: true,
      findNext: true,
      matchCase: false
    };
    this._iframeDelayer.trigger(() => {
      this._findStarted = true;
      this._webviewMainService.findInFrame({ windowId: this._nativeHostService.windowId }, this.id, value, options);
    });
  }
  stopFind(keepSelection) {
    if (!this.element) {
      return;
    }
    this._iframeDelayer.cancel();
    this._findStarted = false;
    this._webviewMainService.stopFindInFrame({ windowId: this._nativeHostService.windowId }, this.id, {
      keepSelection
    });
    this._onDidStopFind.fire();
  }
  handleFocusChange(isFocused) {
    super.handleFocusChange(isFocused);
    if (isFocused) {
      this._webviewKeyboardHandler.didFocus();
    } else {
      this._webviewKeyboardHandler.didBlur();
    }
  }
};
ElectronWebviewElement = __decorate([
  __param(2, IContextMenuService),
  __param(3, ITunnelService),
  __param(4, IFileService),
  __param(5, IWorkbenchEnvironmentService),
  __param(6, IRemoteAuthorityResolverService),
  __param(7, ILogService),
  __param(8, IConfigurationService),
  __param(9, IMainProcessService),
  __param(10, INotificationService),
  __param(11, INativeHostService),
  __param(12, IInstantiationService),
  __param(13, IAccessibilityService),
  __param(14, IUriIdentityService)
], ElectronWebviewElement);
export {
  ElectronWebviewElement
};
//# sourceMappingURL=webviewElement.js.map
