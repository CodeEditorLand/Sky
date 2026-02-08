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
import { IDefaultAccountService } from "../../../../platform/defaultAccount/common/defaultAccount.js";
let AccountPolicyService = class AccountPolicyService2 extends AbstractPolicyService {
  static {
    __name(this, "AccountPolicyService");
  }
  constructor(logService, defaultAccountService) {
    super();
    this.logService = logService;
    this.defaultAccountService = defaultAccountService;
    this._updatePolicyDefinitions(this.policyDefinitions);
    this._register(this.defaultAccountService.onDidChangePolicyData(() => {
      this._updatePolicyDefinitions(this.policyDefinitions);
    }));
  }
  async _updatePolicyDefinitions(policyDefinitions) {
    this.logService.trace(`AccountPolicyService#_updatePolicyDefinitions: Got ${Object.keys(policyDefinitions).length} policy definitions`);
    const updated = [];
    const policyData = this.defaultAccountService.policyData;
    for (const key in policyDefinitions) {
      const policy = policyDefinitions[key];
      const policyValue = policyData && policy.value ? policy.value(policyData) : void 0;
      if (policyValue !== void 0) {
        if (this.policies.get(key) !== policyValue) {
          this.policies.set(key, policyValue);
          updated.push(key);
        }
      } else {
        if (this.policies.delete(key)) {
          updated.push(key);
        }
      }
    }
    if (updated.length) {
      this._onDidChange.fire(updated);
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
