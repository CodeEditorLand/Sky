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
import { CancellationTokenSource } from "../../../base/common/cancellation.js";
import { URI } from "../../../base/common/uri.js";
import { IExtensionGalleryService } from "../../extensionManagement/common/extensionManagement.js";
import { IExtensionResourceLoaderService } from "../../extensionResourceLoader/common/extensionResourceLoader.js";
import { LanguagePackBaseService } from "../common/languagePacks.js";
import { ILogService } from "../../log/common/log.js";
let WebLanguagePacksService = class WebLanguagePacksService2 extends LanguagePackBaseService {
  static {
    __name(this, "WebLanguagePacksService");
  }
  constructor(extensionResourceLoaderService, extensionGalleryService, logService) {
    super(extensionGalleryService);
    this.extensionResourceLoaderService = extensionResourceLoaderService;
    this.logService = logService;
  }
  async getBuiltInExtensionTranslationsUri(id, language) {
    const queryTimeout = new CancellationTokenSource();
    setTimeout(() => queryTimeout.cancel(), 1e3);
    let result;
    try {
      result = await this.extensionGalleryService.query({
        text: `tag:"lp-${language}"`,
        pageSize: 5
      }, queryTimeout.token);
    } catch (err) {
      this.logService.error(err);
      return void 0;
    }
    const languagePackExtensions = result.firstPage.find((e) => e.properties.localizedLanguages?.length);
    if (!languagePackExtensions) {
      this.logService.trace(`No language pack found for language ${language}`);
      return void 0;
    }
    const manifestTimeout = new CancellationTokenSource();
    setTimeout(() => queryTimeout.cancel(), 1e3);
    const manifest = await this.extensionGalleryService.getManifest(languagePackExtensions, manifestTimeout.token);
    const localization = manifest?.contributes?.localizations?.find((l) => l.languageId === language);
    const translation = localization?.translations.find((t) => t.id === id);
    if (!translation) {
      this.logService.trace(`No translation found for id '${id}, in ${manifest?.name}`);
      return void 0;
    }
    const uri = await this.extensionResourceLoaderService.getExtensionGalleryResourceURL({
      // If translation is defined then manifest should have been defined.
      name: manifest.name,
      publisher: manifest.publisher,
      version: manifest.version
    });
    if (!uri) {
      this.logService.trace("Gallery does not provide extension resources.");
      return void 0;
    }
    return URI.joinPath(uri, translation.path);
  }
  // Web doesn't have a concept of language packs, so we just return an empty array
  getInstalledLanguages() {
    return Promise.resolve([]);
  }
};
WebLanguagePacksService = __decorate([
  __param(0, IExtensionResourceLoaderService),
  __param(1, IExtensionGalleryService),
  __param(2, ILogService)
], WebLanguagePacksService);
export {
  WebLanguagePacksService
};
//# sourceMappingURL=languagePacks.js.map
