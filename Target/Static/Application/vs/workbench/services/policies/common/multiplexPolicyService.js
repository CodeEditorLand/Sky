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
import { Iterable } from "../../../../base/common/iterator.js";
import { Event } from "../../../../base/common/event.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { AbstractPolicyService } from "../../../../platform/policy/common/policy.js";
let MultiplexPolicyService = class MultiplexPolicyService2 extends AbstractPolicyService {
  static {
    __name(this, "MultiplexPolicyService");
  }
  constructor(policyServices, logService) {
    super();
    this.policyServices = policyServices;
    this.logService = logService;
    this.updatePolicies();
    this._register(Event.any(...this.policyServices.map((service) => service.onDidChange))((names) => {
      this.updatePolicies();
      this._onDidChange.fire(names);
    }));
  }
  async updatePolicyDefinitions(policyDefinitions) {
    await this._updatePolicyDefinitions(policyDefinitions);
    return Iterable.reduce(this.policies.entries(), (r, [name, value]) => ({ ...r, [name]: value }), {});
  }
  async _updatePolicyDefinitions(policyDefinitions) {
    await Promise.all(this.policyServices.map((service) => service.updatePolicyDefinitions(policyDefinitions)));
    this.updatePolicies();
  }
  updatePolicies() {
    this.policies.clear();
    const updated = [];
    for (const service of this.policyServices) {
      const definitions = service.policyDefinitions;
      for (const name in definitions) {
        const value = service.getPolicyValue(name);
        this.policyDefinitions[name] = definitions[name];
        if (value !== void 0) {
          updated.push(name);
          this.policies.set(name, value);
        }
      }
    }
    const changed = /* @__PURE__ */ new Set();
    for (const key of updated) {
      if (changed.has(key)) {
        this.logService.warn(`MultiplexPolicyService#_updatePolicyDefinitions - Found overlapping keys in policy services: ${key}`);
      }
      changed.add(key);
    }
  }
};
MultiplexPolicyService = __decorate([
  __param(1, ILogService)
], MultiplexPolicyService);
export {
  MultiplexPolicyService
};
//# sourceMappingURL=multiplexPolicyService.js.map
