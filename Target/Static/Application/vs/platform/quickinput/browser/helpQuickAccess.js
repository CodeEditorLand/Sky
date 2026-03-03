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
var HelpQuickAccessProvider_1;
import { localize } from "../../../nls.js";
import { Registry } from "../../registry/common/platform.js";
import { DisposableStore } from "../../../base/common/lifecycle.js";
import { IContextKeyService } from "../../contextkey/common/contextkey.js";
import { IKeybindingService } from "../../keybinding/common/keybinding.js";
import { Extensions } from "../common/quickAccess.js";
import { IQuickInputService } from "../common/quickInput.js";
let HelpQuickAccessProvider = class HelpQuickAccessProvider2 {
  static {
    __name(this, "HelpQuickAccessProvider");
  }
  static {
    HelpQuickAccessProvider_1 = this;
  }
  static {
    this.PREFIX = "?";
  }
  constructor(quickInputService, keybindingService, contextKeyService) {
    this.quickInputService = quickInputService;
    this.keybindingService = keybindingService;
    this.contextKeyService = contextKeyService;
    this.registry = Registry.as(Extensions.Quickaccess);
  }
  provide(picker) {
    const disposables = new DisposableStore();
    disposables.add(picker.onDidAccept(() => {
      const [item] = picker.selectedItems;
      if (item) {
        this.quickInputService.quickAccess.show(item.prefix, { preserveValue: true });
      }
    }));
    disposables.add(picker.onDidChangeValue((value) => {
      const providerDescriptor = this.registry.getQuickAccessProvider(value.substr(HelpQuickAccessProvider_1.PREFIX.length), this.contextKeyService);
      if (providerDescriptor?.prefix && providerDescriptor.prefix !== HelpQuickAccessProvider_1.PREFIX) {
        this.quickInputService.quickAccess.show(providerDescriptor.prefix, { preserveValue: true });
      }
    }));
    picker.items = this.getQuickAccessProviders().filter((p) => p.prefix !== HelpQuickAccessProvider_1.PREFIX);
    return disposables;
  }
  getQuickAccessProviders() {
    const providers = this.registry.getQuickAccessProviders(this.contextKeyService).sort((providerA, providerB) => providerA.prefix.localeCompare(providerB.prefix)).flatMap((provider) => this.createPicks(provider));
    return providers;
  }
  createPicks(provider) {
    return provider.helpEntries.map((helpEntry) => {
      const prefix = helpEntry.prefix || provider.prefix;
      const label = prefix || "\u2026";
      return {
        prefix,
        label,
        keybinding: helpEntry.commandId ? this.keybindingService.lookupKeybinding(helpEntry.commandId) : void 0,
        ariaLabel: localize("helpPickAriaLabel", "{0}, {1}", label, helpEntry.description),
        description: helpEntry.description
      };
    });
  }
};
HelpQuickAccessProvider = HelpQuickAccessProvider_1 = __decorate([
  __param(0, IQuickInputService),
  __param(1, IKeybindingService),
  __param(2, IContextKeyService)
], HelpQuickAccessProvider);
export {
  HelpQuickAccessProvider
};
//# sourceMappingURL=helpQuickAccess.js.map
