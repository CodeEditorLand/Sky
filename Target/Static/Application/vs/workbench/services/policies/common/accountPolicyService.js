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
import { ILogService } from "../../../../platform/log/common/log.js";
import { AbstractPolicyService } from "../../../../platform/policy/common/policy.js";
import { IDefaultAccountService } from "../../accounts/common/defaultAccount.js";
let AccountPolicyService = class AccountPolicyService2 extends AbstractPolicyService {
  static {
    __name(this, "AccountPolicyService");
  }
  constructor(logService, defaultAccountService) {
    super();
    this.logService = logService;
    this.defaultAccountService = defaultAccountService;
    this.chatPreviewFeaturesEnabled = true;
    this.defaultAccountService.getDefaultAccount().then((account) => {
      this._update(account?.chat_preview_features_enabled ?? true);
      this._register(this.defaultAccountService.onDidChangeDefaultAccount((account2) => this._update(account2?.chat_preview_features_enabled ?? true)));
    });
  }
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
AccountPolicyService = __decorate([
  __param(0, ILogService),
  __param(1, IDefaultAccountService)
], AccountPolicyService);
export {
  AccountPolicyService
};
//# sourceMappingURL=accountPolicyService.js.map
