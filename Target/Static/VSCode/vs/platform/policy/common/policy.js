var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IStringDictionary } from "../../../base/common/collections.js";
import { Emitter, Event } from "../../../base/common/event.js";
import { Iterable } from "../../../base/common/iterator.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import { PolicyName } from "../../../base/common/policy.js";
import { createDecorator } from "../../instantiation/common/instantiation.js";
const IPolicyService = createDecorator("policy");
class AbstractPolicyService extends Disposable {
  static {
    __name(this, "AbstractPolicyService");
  }
  _serviceBrand;
  policyDefinitions = {};
  policies = /* @__PURE__ */ new Map();
  _onDidChange = this._register(new Emitter());
  onDidChange = this._onDidChange.event;
  async updatePolicyDefinitions(policyDefinitions) {
    const size = Object.keys(this.policyDefinitions).length;
    this.policyDefinitions = { ...policyDefinitions, ...this.policyDefinitions };
    if (size !== Object.keys(this.policyDefinitions).length) {
      await this._updatePolicyDefinitions(this.policyDefinitions);
    }
    return Iterable.reduce(this.policies.entries(), (r, [name, value]) => ({ ...r, [name]: value }), {});
  }
  getPolicyValue(name) {
    return this.policies.get(name);
  }
  serialize() {
    return Iterable.reduce(Object.entries(this.policyDefinitions), (r, [name, definition]) => ({ ...r, [name]: { definition, value: this.policies.get(name) } }), {});
  }
}
class NullPolicyService {
  static {
    __name(this, "NullPolicyService");
  }
  _serviceBrand;
  onDidChange = Event.None;
  async updatePolicyDefinitions() {
    return {};
  }
  getPolicyValue() {
    return void 0;
  }
  serialize() {
    return void 0;
  }
  policyDefinitions = {};
}
export {
  AbstractPolicyService,
  IPolicyService,
  NullPolicyService
};
//# sourceMappingURL=policy.js.map
