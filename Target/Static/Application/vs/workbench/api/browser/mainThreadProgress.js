var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IProgressService } from "../../../platform/progress/common/progress.js";
import { MainContext, ExtHostContext } from "../common/extHost.protocol.js";
import { extHostNamedCustomer } from "../../services/extensions/common/extHostCustomers.js";
import { ICommandService } from "../../../platform/commands/common/commands.js";
import { localize } from "../../../nls.js";
import { onUnexpectedExternalError } from "../../../base/common/errors.js";
import { toAction } from "../../../base/common/actions.js";
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
let MainThreadProgress = class MainThreadProgress2 {
  static {
    __name(this, "MainThreadProgress");
  }
  constructor(extHostContext, progressService, _commandService) {
    this._commandService = _commandService;
    this._progress = /* @__PURE__ */ new Map();
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostProgress);
    this._progressService = progressService;
  }
  dispose() {
    this._progress.forEach((handle) => handle.resolve());
    this._progress.clear();
  }
  async $startProgress(handle, options, extensionId) {
    const task = this._createTask(handle);
    if (options.location === 15 && extensionId) {
      const notificationOptions = {
        ...options,
        location: 15,
        secondaryActions: [toAction({
          id: extensionId,
          label: localize("manageExtension", "Manage Extension"),
          run: /* @__PURE__ */ __name(() => this._commandService.executeCommand("_extensions.manage", extensionId), "run")
        })]
      };
      options = notificationOptions;
    }
    try {
      this._progressService.withProgress(options, task, () => this._proxy.$acceptProgressCanceled(handle));
    } catch (err) {
      onUnexpectedExternalError(err);
    }
  }
  $progressReport(handle, message) {
    const entry = this._progress.get(handle);
    entry?.progress.report(message);
  }
  $progressEnd(handle) {
    const entry = this._progress.get(handle);
    if (entry) {
      entry.resolve();
      this._progress.delete(handle);
    }
  }
  _createTask(handle) {
    return (progress) => {
      return new Promise((resolve) => {
        this._progress.set(handle, { resolve, progress });
      });
    };
  }
};
MainThreadProgress = __decorate([
  extHostNamedCustomer(MainContext.MainThreadProgress),
  __param(1, IProgressService),
  __param(2, ICommandService)
], MainThreadProgress);
export {
  MainThreadProgress
};
//# sourceMappingURL=mainThreadProgress.js.map
