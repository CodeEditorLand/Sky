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
import { mcpAccessConfig } from "../../../../platform/mcp/common/mcpManagement.js";
import { observableConfigValue } from "../../../../platform/observable/common/platformObservableUtils.js";
import { mcpDiscoveryRegistry } from "../common/discovery/mcpDiscovery.js";
let McpDiscovery = class McpDiscovery2 extends Disposable {
  static {
    __name(this, "McpDiscovery");
  }
  static {
    this.ID = "workbench.contrib.mcp.discovery";
  }
  constructor(instantiationService, configurationService) {
    super();
    const mcpAccessValue = observableConfigValue(mcpAccessConfig, "all", configurationService);
    const store = this._register(new DisposableStore());
    this._register(autorun((reader) => {
      store.clear();
      const value = mcpAccessValue.read(reader);
      if (value === "none") {
        return;
      }
      for (const descriptor of mcpDiscoveryRegistry.getAll()) {
        const mcpDiscovery = instantiationService.createInstance(descriptor);
        if (value === "registry" && !mcpDiscovery.fromGallery) {
          mcpDiscovery.dispose();
          continue;
        }
        store.add(mcpDiscovery);
        mcpDiscovery.start();
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
