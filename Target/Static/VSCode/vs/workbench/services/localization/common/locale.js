import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { ILanguagePackItem } from "../../../../platform/languagePacks/common/languagePacks.js";
const ILocaleService = createDecorator("localizationService");
const IActiveLanguagePackService = createDecorator("activeLanguageService");
export {
  IActiveLanguagePackService,
  ILocaleService
};
//# sourceMappingURL=locale.js.map
