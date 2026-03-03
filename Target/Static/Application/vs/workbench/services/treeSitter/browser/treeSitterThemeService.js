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
import { derived, observableFromEvent } from "../../../../base/common/observable.js";
import { findMetadata } from "../../themes/common/colorThemeData.js";
import { IWorkbenchThemeService } from "../../themes/common/workbenchThemeService.js";
let TreeSitterThemeService = class TreeSitterThemeService2 {
  static {
    __name(this, "TreeSitterThemeService");
  }
  constructor(_themeService) {
    this._themeService = _themeService;
    this._colorTheme = observableFromEvent(this._themeService.onDidColorThemeChange, () => this._themeService.getColorTheme());
    this.onChange = derived(this, (reader) => {
      this._colorTheme.read(reader);
      reader.reportChange(void 0);
    });
  }
  findMetadata(captureNames, languageId, bracket, reader) {
    return findMetadata(this._colorTheme.read(reader), captureNames, languageId, bracket);
  }
};
TreeSitterThemeService = __decorate([
  __param(0, IWorkbenchThemeService)
], TreeSitterThemeService);
export {
  TreeSitterThemeService
};
//# sourceMappingURL=treeSitterThemeService.js.map
