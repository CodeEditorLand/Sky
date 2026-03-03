var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter, Event } from "../../../base/common/event.js";
import { Iterable } from "../../../base/common/iterator.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import { createDecorator } from "../../instantiation/common/instantiation.js";
const IPolicyService = createDecorator("policy");
class AbstractPolicyService extends Disposable {
  static {
    __name(this, "AbstractPolicyService");
  }
  constructor() {
    super(...arguments);
    this.policyDefinitions = {};
    this.policies = /* @__PURE__ */ new Map();
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
  }
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
  constructor() {
    this.onDidChange = Event.None;
    this.policyDefinitions = {};
  }
  async updatePolicyDefinitions() {
    return {};
  }
  getPolicyValue() {
    return void 0;
  }
  serialize() {
    return void 0;
  }
}
export {
  AbstractPolicyService,
  IPolicyService,
  NullPolicyService
};
//# sourceMappingURL=policy.js.map
