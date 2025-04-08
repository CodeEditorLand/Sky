var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { coalesce } from "../../../base/common/arrays.js";
import { CancellationToken } from "../../../base/common/cancellation.js";
import { IDisposable, toDisposable } from "../../../base/common/lifecycle.js";
import { ItemActivation, IQuickNavigateConfiguration, IQuickPick, IQuickPickItem, QuickPickItem, IQuickPickSeparator } from "./quickInput.js";
import { Registry } from "../../registry/common/platform.js";
var DefaultQuickAccessFilterValue = /* @__PURE__ */ ((DefaultQuickAccessFilterValue2) => {
  DefaultQuickAccessFilterValue2[DefaultQuickAccessFilterValue2["PRESERVE"] = 0] = "PRESERVE";
  DefaultQuickAccessFilterValue2[DefaultQuickAccessFilterValue2["LAST"] = 1] = "LAST";
  return DefaultQuickAccessFilterValue2;
})(DefaultQuickAccessFilterValue || {});
const Extensions = {
  Quickaccess: "workbench.contributions.quickaccess"
};
class QuickAccessRegistry {
  static {
    __name(this, "QuickAccessRegistry");
  }
  providers = [];
  defaultProvider = void 0;
  registerQuickAccessProvider(provider) {
    if (provider.prefix.length === 0) {
      this.defaultProvider = provider;
    } else {
      this.providers.push(provider);
    }
    this.providers.sort((providerA, providerB) => providerB.prefix.length - providerA.prefix.length);
    return toDisposable(() => {
      this.providers.splice(this.providers.indexOf(provider), 1);
      if (this.defaultProvider === provider) {
        this.defaultProvider = void 0;
      }
    });
  }
  getQuickAccessProviders() {
    return coalesce([this.defaultProvider, ...this.providers]);
  }
  getQuickAccessProvider(prefix) {
    const result = prefix ? this.providers.find((provider) => prefix.startsWith(provider.prefix)) || void 0 : void 0;
    return result || this.defaultProvider;
  }
  clear() {
    const providers = [...this.providers];
    const defaultProvider = this.defaultProvider;
    this.providers = [];
    this.defaultProvider = void 0;
    return () => {
      this.providers = providers;
      this.defaultProvider = defaultProvider;
    };
  }
}
Registry.add(Extensions.Quickaccess, new QuickAccessRegistry());
export {
  DefaultQuickAccessFilterValue,
  Extensions,
  QuickAccessRegistry
};
//# sourceMappingURL=quickAccess.js.map
