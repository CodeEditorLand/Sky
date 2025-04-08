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
import { Disposable } from "../../../base/common/lifecycle.js";
import { extHostNamedCustomer, IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { ExtHostContext, ExtHostSecretStateShape, MainContext, MainThreadSecretStateShape } from "../common/extHost.protocol.js";
import { ILogService } from "../../../platform/log/common/log.js";
import { SequencerByKey } from "../../../base/common/async.js";
import { ISecretStorageService } from "../../../platform/secrets/common/secrets.js";
import { IBrowserWorkbenchEnvironmentService } from "../../services/environment/browser/environmentService.js";
let MainThreadSecretState = class extends Disposable {
  constructor(extHostContext, secretStorageService, logService, environmentService) {
    super();
    this.secretStorageService = secretStorageService;
    this.logService = logService;
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostSecretState);
    this._register(this.secretStorageService.onDidChangeSecret((e) => {
      try {
        const { extensionId, key } = this.parseKey(e);
        if (extensionId && key) {
          this._proxy.$onDidChangePassword({ extensionId, key });
        }
      } catch (e2) {
      }
    }));
  }
  _proxy;
  _sequencer = new SequencerByKey();
  $getPassword(extensionId, key) {
    this.logService.trace(`[mainThreadSecretState] Getting password for ${extensionId} extension: `, key);
    return this._sequencer.queue(extensionId, () => this.doGetPassword(extensionId, key));
  }
  async doGetPassword(extensionId, key) {
    const fullKey = this.getKey(extensionId, key);
    const password = await this.secretStorageService.get(fullKey);
    this.logService.trace(`[mainThreadSecretState] ${password ? "P" : "No p"}assword found for: `, extensionId, key);
    return password;
  }
  $setPassword(extensionId, key, value) {
    this.logService.trace(`[mainThreadSecretState] Setting password for ${extensionId} extension: `, key);
    return this._sequencer.queue(extensionId, () => this.doSetPassword(extensionId, key, value));
  }
  async doSetPassword(extensionId, key, value) {
    const fullKey = this.getKey(extensionId, key);
    await this.secretStorageService.set(fullKey, value);
    this.logService.trace("[mainThreadSecretState] Password set for: ", extensionId, key);
  }
  $deletePassword(extensionId, key) {
    this.logService.trace(`[mainThreadSecretState] Deleting password for ${extensionId} extension: `, key);
    return this._sequencer.queue(extensionId, () => this.doDeletePassword(extensionId, key));
  }
  async doDeletePassword(extensionId, key) {
    const fullKey = this.getKey(extensionId, key);
    await this.secretStorageService.delete(fullKey);
    this.logService.trace("[mainThreadSecretState] Password deleted for: ", extensionId, key);
  }
  getKey(extensionId, key) {
    return JSON.stringify({ extensionId, key });
  }
  parseKey(key) {
    return JSON.parse(key);
  }
};
__name(MainThreadSecretState, "MainThreadSecretState");
MainThreadSecretState = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadSecretState),
  __decorateParam(1, ISecretStorageService),
  __decorateParam(2, ILogService),
  __decorateParam(3, IBrowserWorkbenchEnvironmentService)
], MainThreadSecretState);
export {
  MainThreadSecretState
};
//# sourceMappingURL=mainThreadSecretState.js.map
