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
import { Disposable, DisposableStore } from "../../../../base/common/lifecycle.js";
import { autorun } from "../../../../base/common/observable.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { observableConfigValue } from "../../../../platform/observable/common/platformObservableUtils.js";
import { IWorkbenchContribution } from "../../../common/contributions.js";
import { mcpDiscoveryRegistry } from "../common/discovery/mcpDiscovery.js";
import { mcpEnabledSection } from "../common/mcpConfiguration.js";
let McpDiscovery = class extends Disposable {
  static {
    __name(this, "McpDiscovery");
  }
  static ID = "workbench.contrib.mcp.discovery";
  constructor(instantiationService, configurationService) {
    super();
    const enabled = observableConfigValue(mcpEnabledSection, true, configurationService);
    const store = this._register(new DisposableStore());
    this._register(autorun((reader) => {
      if (enabled.read(reader)) {
        for (const discovery of mcpDiscoveryRegistry.getAll()) {
          const inst = store.add(instantiationService.createInstance(discovery));
          inst.start();
        }
      } else {
        store.clear();
      }
    }));
  }
};
McpDiscovery = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IConfigurationService)
], McpDiscovery);
export {
  McpDiscovery
};
//# sourceMappingURL=mcpDiscovery.js.map
