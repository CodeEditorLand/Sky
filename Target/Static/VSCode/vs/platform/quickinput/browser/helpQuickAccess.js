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
import { localize } from "../../../nls.js";
import { Registry } from "../../registry/common/platform.js";
import { DisposableStore, IDisposable } from "../../../base/common/lifecycle.js";
import { IKeybindingService } from "../../keybinding/common/keybinding.js";
import { Extensions, IQuickAccessProvider, IQuickAccessProviderDescriptor, IQuickAccessRegistry } from "../common/quickAccess.js";
import { IQuickInputService, IQuickPick, IQuickPickItem } from "../common/quickInput.js";
let HelpQuickAccessProvider = class {
  constructor(quickInputService, keybindingService) {
    this.quickInputService = quickInputService;
    this.keybindingService = keybindingService;
  }
  static {
    __name(this, "HelpQuickAccessProvider");
  }
  static PREFIX = "?";
  registry = Registry.as(Extensions.Quickaccess);
  provide(picker) {
    const disposables = new DisposableStore();
    disposables.add(picker.onDidAccept(() => {
      const [item] = picker.selectedItems;
      if (item) {
        this.quickInputService.quickAccess.show(item.prefix, { preserveValue: true });
      }
    }));
    disposables.add(picker.onDidChangeValue((value) => {
      const providerDescriptor = this.registry.getQuickAccessProvider(value.substr(HelpQuickAccessProvider.PREFIX.length));
      if (providerDescriptor && providerDescriptor.prefix && providerDescriptor.prefix !== HelpQuickAccessProvider.PREFIX) {
        this.quickInputService.quickAccess.show(providerDescriptor.prefix, { preserveValue: true });
      }
    }));
    picker.items = this.getQuickAccessProviders().filter((p) => p.prefix !== HelpQuickAccessProvider.PREFIX);
    return disposables;
  }
  getQuickAccessProviders() {
    const providers = this.registry.getQuickAccessProviders().sort((providerA, providerB) => providerA.prefix.localeCompare(providerB.prefix)).flatMap((provider) => this.createPicks(provider));
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
HelpQuickAccessProvider = __decorateClass([
  __decorateParam(0, IQuickInputService),
  __decorateParam(1, IKeybindingService)
], HelpQuickAccessProvider);
export {
  HelpQuickAccessProvider
};
//# sourceMappingURL=helpQuickAccess.js.map
