var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { isMacintosh } from "../../../../base/common/platform.js";
import { ProxyChannel } from "../../../../base/parts/ipc/common/ipc.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IMainProcessService } from "../../../../platform/ipc/common/mainProcessService.js";
import { INativeHostService } from "../../../../platform/native/common/native.js";
import { IWebviewManagerService } from "../../../../platform/webview/common/webviewManagerService.js";
import { hasNativeTitlebar } from "../../../../platform/window/common/window.js";
class WindowIgnoreMenuShortcutsManager {
  constructor(configurationService, mainProcessService, _nativeHostService) {
    this._nativeHostService = _nativeHostService;
    this._isUsingNativeTitleBars = hasNativeTitlebar(configurationService);
    this._webviewMainService = ProxyChannel.toService(mainProcessService.getChannel("webview"));
  }
  static {
    __name(this, "WindowIgnoreMenuShortcutsManager");
  }
  _isUsingNativeTitleBars;
  _webviewMainService;
  didFocus() {
    this.setIgnoreMenuShortcuts(true);
  }
  didBlur() {
    this.setIgnoreMenuShortcuts(false);
  }
  get _shouldToggleMenuShortcutsEnablement() {
    return isMacintosh || this._isUsingNativeTitleBars;
  }
  setIgnoreMenuShortcuts(value) {
    if (this._shouldToggleMenuShortcutsEnablement) {
      this._webviewMainService.setIgnoreMenuShortcuts({ windowId: this._nativeHostService.windowId }, value);
    }
  }
}
export {
  WindowIgnoreMenuShortcutsManager
};
//# sourceMappingURL=windowIgnoreMenuShortcutsManager.js.map
