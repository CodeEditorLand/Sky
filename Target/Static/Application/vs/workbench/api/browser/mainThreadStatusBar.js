var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { MainContext, ExtHostContext } from "../common/extHost.protocol.js";
import { extHostNamedCustomer } from "../../services/extensions/common/extHostCustomers.js";
import { DisposableStore, toDisposable } from "../../../base/common/lifecycle.js";
import { IExtensionStatusBarItemService } from "./statusBarExtensionPoint.js";
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
let MainThreadStatusBar = class MainThreadStatusBar2 {
  static {
    __name(this, "MainThreadStatusBar");
  }
  constructor(extHostContext, statusbarService) {
    this.statusbarService = statusbarService;
    this._store = new DisposableStore();
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostStatusBar);
    const entries = [];
    for (const [entryId, item] of statusbarService.getEntries()) {
      entries.push(asDto(entryId, item));
    }
    this._proxy.$acceptStaticEntries(entries);
    this._store.add(statusbarService.onDidChange((e) => {
      if (e.added) {
        this._proxy.$acceptStaticEntries([asDto(e.added[0], e.added[1])]);
      }
    }));
    function asDto(entryId, item) {
      return {
        entryId,
        name: item.entry.name,
        text: item.entry.text,
        tooltip: item.entry.tooltip,
        command: typeof item.entry.command === "string" ? item.entry.command : typeof item.entry.command === "object" ? item.entry.command.id : void 0,
        priority: item.priority,
        alignLeft: item.alignment === 0,
        accessibilityInformation: item.entry.ariaLabel ? { label: item.entry.ariaLabel, role: item.entry.role } : void 0
      };
    }
    __name(asDto, "asDto");
  }
  dispose() {
    this._store.dispose();
  }
  $setEntry(entryId, id, extensionId, name, text, tooltip, hasTooltipProvider, command, color, backgroundColor, alignLeft, priority, accessibilityInformation) {
    const tooltipOrTooltipProvider = hasTooltipProvider ? {
      markdown: /* @__PURE__ */ __name((cancellation) => {
        return this._proxy.$provideTooltip(entryId, cancellation);
      }, "markdown"),
      markdownNotSupportedFallback: void 0
    } : tooltip;
    const kind = this.statusbarService.setOrUpdateEntry(entryId, id, extensionId, name, text, tooltipOrTooltipProvider, command, color, backgroundColor, alignLeft, priority, accessibilityInformation);
    if (kind === 0) {
      this._store.add(toDisposable(() => this.statusbarService.unsetEntry(entryId)));
    }
  }
  $disposeEntry(entryId) {
    this.statusbarService.unsetEntry(entryId);
  }
};
MainThreadStatusBar = __decorate([
  extHostNamedCustomer(MainContext.MainThreadStatusBar),
  __param(1, IExtensionStatusBarItemService)
], MainThreadStatusBar);
export {
  MainThreadStatusBar
};
//# sourceMappingURL=mainThreadStatusBar.js.map
