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
import { IStringDictionary } from "../../../../base/common/collections.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { AbstractPolicyService, IPolicyService, PolicyDefinition } from "../../../../platform/policy/common/policy.js";
import { IDefaultAccountService } from "../../accounts/common/defaultAccount.js";
let AccountPolicyService = class extends AbstractPolicyService {
  constructor(logService, defaultAccountService) {
    super();
    this.logService = logService;
    this.defaultAccountService = defaultAccountService;
    this.defaultAccountService.getDefaultAccount().then((account) => {
      this._update(account?.chat_preview_features_enabled ?? true);
      this._register(this.defaultAccountService.onDidChangeDefaultAccount((account2) => this._update(account2?.chat_preview_features_enabled ?? true)));
    });
  }
  static {
    __name(this, "AccountPolicyService");
  }
  chatPreviewFeaturesEnabled = true;
  _update(chatPreviewFeaturesEnabled) {
    const newValue = chatPreviewFeaturesEnabled === void 0 || chatPreviewFeaturesEnabled;
    if (this.chatPreviewFeaturesEnabled !== newValue) {
      this.chatPreviewFeaturesEnabled = newValue;
      this._updatePolicyDefinitions(this.policyDefinitions);
    }
  }
  async _updatePolicyDefinitions(policyDefinitions) {
    this.logService.trace(`AccountPolicyService#_updatePolicyDefinitions: Got ${Object.keys(policyDefinitions).length} policy definitions`);
    const update = [];
    for (const key in policyDefinitions) {
      const policy = policyDefinitions[key];
      if (policy.previewFeature) {
        if (this.chatPreviewFeaturesEnabled) {
          this.policies.delete(key);
          update.push(key);
          continue;
        }
        const defaultValue = policy.defaultValue;
        const updatedValue = defaultValue === void 0 ? false : defaultValue;
        if (this.policies.get(key) === updatedValue) {
          continue;
        }
        this.policies.set(key, updatedValue);
        update.push(key);
      }
    }
    if (update.length) {
      this._onDidChange.fire(update);
    }
  }
};
AccountPolicyService = __decorateClass([
  __decorateParam(0, ILogService),
  __decorateParam(1, IDefaultAccountService)
], AccountPolicyService);
export {
  AccountPolicyService
};
//# sourceMappingURL=accountPolicyService.js.map
