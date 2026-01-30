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
import { MainContext, ExtHostContext } from "../common/extHost.protocol.js";
import { extHostNamedCustomer } from "../../services/extensions/common/extHostCustomers.js";
import { IThemeService } from "../../../platform/theme/common/themeService.js";
let MainThreadTheming = class MainThreadTheming2 {
  static {
    __name(this, "MainThreadTheming");
  }
  constructor(extHostContext, themeService) {
    this._themeService = themeService;
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostTheming);
    this._themeChangeListener = this._themeService.onDidColorThemeChange((e) => {
      this._proxy.$onColorThemeChange(this._themeService.getColorTheme().type);
    });
    this._proxy.$onColorThemeChange(this._themeService.getColorTheme().type);
  }
  dispose() {
    this._themeChangeListener.dispose();
  }
};
MainThreadTheming = __decorate([
  extHostNamedCustomer(MainContext.MainThreadTheming),
  __param(1, IThemeService)
], MainThreadTheming);
export {
  MainThreadTheming
};
//# sourceMappingURL=mainThreadTheming.js.map
