var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IStringDictionary } from "../../../base/common/collections.js";
import { Event } from "../../../base/common/event.js";
import { DisposableStore } from "../../../base/common/lifecycle.js";
import { PolicyName } from "../../../base/common/policy.js";
import { IChannel, IServerChannel } from "../../../base/parts/ipc/common/ipc.js";
import { AbstractPolicyService, IPolicyService, PolicyDefinition, PolicyValue } from "./policy.js";
class PolicyChannel {
  constructor(service) {
    this.service = service;
  }
  static {
    __name(this, "PolicyChannel");
  }
  disposables = new DisposableStore();
  listen(_, event) {
    switch (event) {
      case "onDidChange":
        return Event.map(
          this.service.onDidChange,
          (names) => names.reduce((r, name) => ({ ...r, [name]: this.service.getPolicyValue(name) ?? null }), {}),
          this.disposables
        );
    }
    throw new Error(`Event not found: ${event}`);
  }
  call(_, command, arg) {
    switch (command) {
      case "updatePolicyDefinitions":
        return this.service.updatePolicyDefinitions(arg);
    }
    throw new Error(`Call not found: ${command}`);
  }
  dispose() {
    this.disposables.dispose();
  }
}
class PolicyChannelClient extends AbstractPolicyService {
  constructor(policiesData, channel) {
    super();
    this.channel = channel;
    for (const name in policiesData) {
      const { definition, value } = policiesData[name];
      this.policyDefinitions[name] = definition;
      if (value !== void 0) {
        this.policies.set(name, value);
      }
    }
    this.channel.listen("onDidChange")((policies) => {
      for (const name in policies) {
        const value = policies[name];
        if (value === null) {
          this.policies.delete(name);
        } else {
          this.policies.set(name, value);
        }
      }
      this._onDidChange.fire(Object.keys(policies));
    });
  }
  static {
    __name(this, "PolicyChannelClient");
  }
  async _updatePolicyDefinitions(policyDefinitions) {
    const result = await this.channel.call("updatePolicyDefinitions", policyDefinitions);
    for (const name in result) {
      this.policies.set(name, result[name]);
    }
  }
}
export {
  PolicyChannel,
  PolicyChannelClient
};
//# sourceMappingURL=policyIpc.js.map
