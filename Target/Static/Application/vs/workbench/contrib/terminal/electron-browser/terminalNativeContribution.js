var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ipcRenderer } from "../../../../base/parts/sandbox/electron-browser/globals.js";
import { URI } from "../../../../base/common/uri.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { registerRemoteContributions } from "./terminalRemote.js";
import { IRemoteAgentService } from "../../../services/remote/common/remoteAgentService.js";
import { INativeHostService } from "../../../../platform/native/common/native.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { ITerminalService } from "../browser/terminal.js";
import { disposableWindowInterval, getActiveWindow } from "../../../../base/browser/dom.js";
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
let TerminalNativeContribution = class TerminalNativeContribution2 extends Disposable {
  static {
    __name(this, "TerminalNativeContribution");
  }
  constructor(_fileService, _terminalService, remoteAgentService, nativeHostService) {
    super();
    this._fileService = _fileService;
    this._terminalService = _terminalService;
    ipcRenderer.on("vscode:openFiles", (_, request) => {
      this._onOpenFileRequest(request);
    });
    this._register(nativeHostService.onDidResumeOS(() => this._onOsResume()));
    this._terminalService.setNativeDelegate({
      getWindowCount: /* @__PURE__ */ __name(() => nativeHostService.getWindowCount(), "getWindowCount")
    });
    const connection = remoteAgentService.getConnection();
    if (connection && connection.remoteAuthority) {
      registerRemoteContributions();
    }
  }
  _onOsResume() {
    for (const instance of this._terminalService.instances) {
      instance.xterm?.forceRedraw();
    }
  }
  async _onOpenFileRequest(request) {
    if (request.termProgram === "vscode" && request.filesToWait) {
      const waitMarkerFileUri = URI.revive(request.filesToWait.waitMarkerFileUri);
      await this._whenFileDeleted(waitMarkerFileUri);
      this._terminalService.activeInstance?.focus();
    }
  }
  _whenFileDeleted(path) {
    return new Promise((resolve) => {
      let running = false;
      const interval = disposableWindowInterval(getActiveWindow(), async () => {
        if (!running) {
          running = true;
          const exists = await this._fileService.exists(path);
          running = false;
          if (!exists) {
            interval.dispose();
            resolve(void 0);
          }
        }
      }, 1e3);
    });
  }
};
TerminalNativeContribution = __decorate([
  __param(0, IFileService),
  __param(1, ITerminalService),
  __param(2, IRemoteAgentService),
  __param(3, INativeHostService)
], TerminalNativeContribution);
export {
  TerminalNativeContribution
};
//# sourceMappingURL=terminalNativeContribution.js.map
