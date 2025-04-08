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
import { Disposable } from "../../../../base/common/lifecycle.js";
import { ILanguagePackService } from "../../../../platform/languagePacks/common/languagePacks.js";
import { NativeLanguagePackService } from "../../../../platform/languagePacks/node/languagePacks.js";
let LocalizationsUpdater = class extends Disposable {
  constructor(localizationsService) {
    super();
    this.localizationsService = localizationsService;
    this.updateLocalizations();
  }
  static {
    __name(this, "LocalizationsUpdater");
  }
  updateLocalizations() {
    this.localizationsService.update();
  }
};
LocalizationsUpdater = __decorateClass([
  __decorateParam(0, ILanguagePackService)
], LocalizationsUpdater);
export {
  LocalizationsUpdater
};
//# sourceMappingURL=localizationsUpdater.js.map
