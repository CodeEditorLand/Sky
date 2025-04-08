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
import { MainContext, ExtHostThemingShape, ExtHostContext, MainThreadThemingShape } from "../common/extHost.protocol.js";
import { extHostNamedCustomer, IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { IDisposable } from "../../../base/common/lifecycle.js";
import { IThemeService } from "../../../platform/theme/common/themeService.js";
let MainThreadTheming = class {
  _themeService;
  _proxy;
  _themeChangeListener;
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
__name(MainThreadTheming, "MainThreadTheming");
MainThreadTheming = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadTheming),
  __decorateParam(1, IThemeService)
], MainThreadTheming);
export {
  MainThreadTheming
};
//# sourceMappingURL=mainThreadTheming.js.map
