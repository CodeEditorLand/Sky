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
import { Disposable, DisposableStore } from "../../../../base/common/lifecycle.js";
import { autorun } from "../../../../base/common/observable.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { observableConfigValue } from "../../../../platform/observable/common/platformObservableUtils.js";
import { mcpDiscoveryRegistry } from "../common/discovery/mcpDiscovery.js";
import { mcpEnabledSection } from "../common/mcpConfiguration.js";
let McpDiscovery = class McpDiscovery2 extends Disposable {
  static {
    __name(this, "McpDiscovery");
  }
  static {
    this.ID = "workbench.contrib.mcp.discovery";
  }
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
McpDiscovery = __decorate([
  __param(0, IInstantiationService),
  __param(1, IConfigurationService)
], McpDiscovery);
export {
  McpDiscovery
};
//# sourceMappingURL=mcpDiscovery.js.map
