var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ColorTheme, ColorThemeKind } from "./extHostTypes.js";
import { IExtHostRpcService } from "./extHostRpcService.js";
import { Emitter } from "../../../base/common/event.js";
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
let ExtHostTheming = class ExtHostTheming2 {
  static {
    __name(this, "ExtHostTheming");
  }
  constructor(_extHostRpc) {
    this._actual = new ColorTheme(ColorThemeKind.Dark);
    this._onDidChangeActiveColorTheme = new Emitter();
  }
  get activeColorTheme() {
    return this._actual;
  }
  $onColorThemeChange(type) {
    let kind;
    switch (type) {
      case "light":
        kind = ColorThemeKind.Light;
        break;
      case "hcDark":
        kind = ColorThemeKind.HighContrast;
        break;
      case "hcLight":
        kind = ColorThemeKind.HighContrastLight;
        break;
      default:
        kind = ColorThemeKind.Dark;
    }
    this._actual = new ColorTheme(kind);
    this._onDidChangeActiveColorTheme.fire(this._actual);
  }
  get onDidChangeActiveColorTheme() {
    return this._onDidChangeActiveColorTheme.event;
  }
};
ExtHostTheming = __decorate([
  __param(0, IExtHostRpcService)
], ExtHostTheming);
export {
  ExtHostTheming
};
//# sourceMappingURL=extHostTheming.js.map
