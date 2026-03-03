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
import { Disposable, DisposableMap } from "../../../base/common/lifecycle.js";
import { extHostNamedCustomer } from "../../services/extensions/common/extHostCustomers.js";
import { IAiSettingsSearchService } from "../../services/aiSettingsSearch/common/aiSettingsSearch.js";
import { ExtHostContext, MainContext } from "../common/extHost.protocol.js";
let MainThreadAiSettingsSearch = class MainThreadAiSettingsSearch2 extends Disposable {
  static {
    __name(this, "MainThreadAiSettingsSearch");
  }
  constructor(context, _settingsSearchService) {
    super();
    this._settingsSearchService = _settingsSearchService;
    this._registrations = this._register(new DisposableMap());
    this._proxy = context.getProxy(ExtHostContext.ExtHostAiSettingsSearch);
  }
  $registerAiSettingsSearchProvider(handle) {
    const provider = {
      searchSettings: /* @__PURE__ */ __name((query, option, token) => {
        return this._proxy.$startSearch(handle, query, option, token);
      }, "searchSettings")
    };
    this._registrations.set(handle, this._settingsSearchService.registerSettingsSearchProvider(provider));
  }
  $unregisterAiSettingsSearchProvider(handle) {
    this._registrations.deleteAndDispose(handle);
  }
  $handleSearchResult(handle, result) {
    if (!this._registrations.has(handle)) {
      throw new Error(`No AI settings search provider found`);
    }
    this._settingsSearchService.handleSearchResult(result);
  }
};
MainThreadAiSettingsSearch = __decorate([
  extHostNamedCustomer(MainContext.MainThreadAiSettingsSearch),
  __param(1, IAiSettingsSearchService)
], MainThreadAiSettingsSearch);
export {
  MainThreadAiSettingsSearch
};
//# sourceMappingURL=mainThreadAiSettingsSearch.js.map
