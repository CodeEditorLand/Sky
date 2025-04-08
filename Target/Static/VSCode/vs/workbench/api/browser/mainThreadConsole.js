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
import { extHostNamedCustomer, IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { MainContext, MainThreadConsoleShape } from "../common/extHost.protocol.js";
import { IEnvironmentService } from "../../../platform/environment/common/environment.js";
import { IRemoteConsoleLog, log } from "../../../base/common/console.js";
import { logRemoteEntry, logRemoteEntryIfError } from "../../services/extensions/common/remoteConsoleUtil.js";
import { parseExtensionDevOptions } from "../../services/extensions/common/extensionDevOptions.js";
import { ILogService } from "../../../platform/log/common/log.js";
let MainThreadConsole = class {
  constructor(_extHostContext, _environmentService, _logService) {
    this._environmentService = _environmentService;
    this._logService = _logService;
    const devOpts = parseExtensionDevOptions(this._environmentService);
    this._isExtensionDevTestFromCli = devOpts.isExtensionDevTestFromCli;
  }
  _isExtensionDevTestFromCli;
  dispose() {
  }
  $logExtensionHostMessage(entry) {
    if (this._isExtensionDevTestFromCli) {
      logRemoteEntry(this._logService, entry);
    } else {
      logRemoteEntryIfError(this._logService, entry, "Extension Host");
      log(entry, "Extension Host");
    }
  }
};
__name(MainThreadConsole, "MainThreadConsole");
MainThreadConsole = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadConsole),
  __decorateParam(1, IEnvironmentService),
  __decorateParam(2, ILogService)
], MainThreadConsole);
export {
  MainThreadConsole
};
//# sourceMappingURL=mainThreadConsole.js.map
