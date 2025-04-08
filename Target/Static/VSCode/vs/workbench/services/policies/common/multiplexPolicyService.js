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
import { Iterable } from "../../../../base/common/iterator.js";
import { Event } from "../../../../base/common/event.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { AbstractPolicyService, IPolicyService, PolicyDefinition, PolicyValue } from "../../../../platform/policy/common/policy.js";
let MultiplexPolicyService = class extends AbstractPolicyService {
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
  static {
    __name(this, "MultiplexPolicyService");
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
MultiplexPolicyService = __decorateClass([
  __decorateParam(1, ILogService)
], MultiplexPolicyService);
export {
  MultiplexPolicyService
};
//# sourceMappingURL=multiplexPolicyService.js.map
