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
import { Disposable } from "../../../base/common/lifecycle.js";
import { ILanguageService } from "../languages/language.js";
import { IThemeService } from "../../../platform/theme/common/themeService.js";
import { ILogService } from "../../../platform/log/common/log.js";
import { SemanticTokensProviderStyling } from "./semanticTokensProviderStyling.js";
import { ISemanticTokensStylingService } from "./semanticTokensStyling.js";
import { registerSingleton } from "../../../platform/instantiation/common/extensions.js";
let SemanticTokensStylingService = class SemanticTokensStylingService2 extends Disposable {
  static {
    __name(this, "SemanticTokensStylingService");
  }
  constructor(_themeService, _logService, _languageService) {
    super();
    this._themeService = _themeService;
    this._logService = _logService;
    this._languageService = _languageService;
    this._caches = /* @__PURE__ */ new WeakMap();
    this._register(this._themeService.onDidColorThemeChange(() => {
      this._caches = /* @__PURE__ */ new WeakMap();
    }));
  }
  getStyling(provider) {
    if (!this._caches.has(provider)) {
      this._caches.set(provider, new SemanticTokensProviderStyling(provider.getLegend(), this._themeService, this._languageService, this._logService));
    }
    return this._caches.get(provider);
  }
};
SemanticTokensStylingService = __decorate([
  __param(0, IThemeService),
  __param(1, ILogService),
  __param(2, ILanguageService)
], SemanticTokensStylingService);
registerSingleton(
  ISemanticTokensStylingService,
  SemanticTokensStylingService,
  1
  /* InstantiationType.Delayed */
);
export {
  SemanticTokensStylingService
};
//# sourceMappingURL=semanticTokensStylingService.js.map
