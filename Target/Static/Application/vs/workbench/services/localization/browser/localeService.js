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
import { localize } from "../../../../nls.js";
import { Language, LANGUAGE_DEFAULT } from "../../../../base/common/platform.js";
import { IDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import { IActiveLanguagePackService, ILocaleService } from "../common/locale.js";
import { IHostService } from "../../host/browser/host.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { IExtensionGalleryService } from "../../../../platform/extensionManagement/common/extensionManagement.js";
import { ILogService } from "../../../../platform/log/common/log.js";
const localeStorage = new class LocaleStorage {
  static {
    __name(this, "LocaleStorage");
  }
  static {
    this.LOCAL_STORAGE_LOCALE_KEY = "vscode.nls.locale";
  }
  static {
    this.LOCAL_STORAGE_EXTENSION_ID_KEY = "vscode.nls.languagePackExtensionId";
  }
  setLocale(locale) {
    localStorage.setItem(LocaleStorage.LOCAL_STORAGE_LOCALE_KEY, locale);
    this.doSetLocaleToCookie(locale);
  }
  doSetLocaleToCookie(locale) {
    document.cookie = `${LocaleStorage.LOCAL_STORAGE_LOCALE_KEY}=${locale};path=/;max-age=3153600000`;
  }
  clearLocale() {
    localStorage.removeItem(LocaleStorage.LOCAL_STORAGE_LOCALE_KEY);
    this.doClearLocaleToCookie();
  }
  doClearLocaleToCookie() {
    document.cookie = `${LocaleStorage.LOCAL_STORAGE_LOCALE_KEY}=;path=/;max-age=0`;
  }
  setExtensionId(extensionId) {
    localStorage.setItem(LocaleStorage.LOCAL_STORAGE_EXTENSION_ID_KEY, extensionId);
  }
  getExtensionId() {
    return localStorage.getItem(LocaleStorage.LOCAL_STORAGE_EXTENSION_ID_KEY);
  }
  clearExtensionId() {
    localStorage.removeItem(LocaleStorage.LOCAL_STORAGE_EXTENSION_ID_KEY);
  }
}();
let WebLocaleService = class WebLocaleService2 {
  static {
    __name(this, "WebLocaleService");
  }
  constructor(dialogService, hostService, productService) {
    this.dialogService = dialogService;
    this.hostService = hostService;
    this.productService = productService;
  }
  async setLocale(languagePackItem, _skipDialog = false) {
    const locale = languagePackItem.id;
    if (locale === Language.value() || !locale && Language.value() === navigator.language.toLowerCase()) {
      return;
    }
    if (locale) {
      localeStorage.setLocale(locale);
      if (languagePackItem.extensionId) {
        localeStorage.setExtensionId(languagePackItem.extensionId);
      }
    } else {
      localeStorage.clearLocale();
      localeStorage.clearExtensionId();
    }
    const restartDialog = await this.dialogService.confirm({
      type: "info",
      message: localize("relaunchDisplayLanguageMessage", "To change the display language, {0} needs to reload", this.productService.nameLong),
      detail: localize("relaunchDisplayLanguageDetail", "Press the reload button to refresh the page and set the display language to {0}.", languagePackItem.label),
      primaryButton: localize({ key: "reload", comment: ["&& denotes a mnemonic character"] }, "&&Reload")
    });
    if (restartDialog.confirmed) {
      this.hostService.restart();
    }
  }
  async clearLocalePreference() {
    localeStorage.clearLocale();
    localeStorage.clearExtensionId();
    if (Language.value() === navigator.language.toLowerCase()) {
      return;
    }
    const restartDialog = await this.dialogService.confirm({
      type: "info",
      message: localize("clearDisplayLanguageMessage", "To change the display language, {0} needs to reload", this.productService.nameLong),
      detail: localize("clearDisplayLanguageDetail", "Press the reload button to refresh the page and use your browser's language."),
      primaryButton: localize({ key: "reload", comment: ["&& denotes a mnemonic character"] }, "&&Reload")
    });
    if (restartDialog.confirmed) {
      this.hostService.restart();
    }
  }
};
WebLocaleService = __decorate([
  __param(0, IDialogService),
  __param(1, IHostService),
  __param(2, IProductService)
], WebLocaleService);
let WebActiveLanguagePackService = class WebActiveLanguagePackService2 {
  static {
    __name(this, "WebActiveLanguagePackService");
  }
  constructor(galleryService, logService) {
    this.galleryService = galleryService;
    this.logService = logService;
  }
  async getExtensionIdProvidingCurrentLocale() {
    const language = Language.value();
    if (language === LANGUAGE_DEFAULT) {
      return void 0;
    }
    const extensionId = localeStorage.getExtensionId();
    if (extensionId) {
      return extensionId;
    }
    if (!this.galleryService.isEnabled()) {
      return void 0;
    }
    try {
      const tagResult = await this.galleryService.query({ text: `tag:lp-${language}` }, CancellationToken.None);
      const extensionToInstall = tagResult.firstPage.find((e) => e.publisher === "MS-CEINTL" && e.name.startsWith("vscode-language-pack"));
      if (extensionToInstall) {
        localeStorage.setExtensionId(extensionToInstall.identifier.id);
        return extensionToInstall.identifier.id;
      }
    } catch (e) {
      this.logService.error(e);
    }
    return void 0;
  }
};
WebActiveLanguagePackService = __decorate([
  __param(0, IExtensionGalleryService),
  __param(1, ILogService)
], WebActiveLanguagePackService);
registerSingleton(
  ILocaleService,
  WebLocaleService,
  1
  /* InstantiationType.Delayed */
);
registerSingleton(
  IActiveLanguagePackService,
  WebActiveLanguagePackService,
  1
  /* InstantiationType.Delayed */
);
export {
  WebLocaleService
};
//# sourceMappingURL=localeService.js.map
