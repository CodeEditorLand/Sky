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
import { MainContext } from "../common/extHost.protocol.js";
import { extHostNamedCustomer } from "../../services/extensions/common/extHostCustomers.js";
import { URI } from "../../../base/common/uri.js";
import { IFileService } from "../../../platform/files/common/files.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import { ILanguagePackService } from "../../../platform/languagePacks/common/languagePacks.js";
let MainThreadLocalization = class MainThreadLocalization2 extends Disposable {
  static {
    __name(this, "MainThreadLocalization");
  }
  constructor(extHostContext, fileService, languagePackService) {
    super();
    this.fileService = fileService;
    this.languagePackService = languagePackService;
  }
  async $fetchBuiltInBundleUri(id, language) {
    try {
      const uri = await this.languagePackService.getBuiltInExtensionTranslationsUri(id, language);
      return uri;
    } catch (e) {
      return void 0;
    }
  }
  async $fetchBundleContents(uriComponents) {
    const contents = await this.fileService.readFile(URI.revive(uriComponents));
    return contents.value.toString();
  }
};
MainThreadLocalization = __decorate([
  extHostNamedCustomer(MainContext.MainThreadLocalization),
  __param(1, IFileService),
  __param(2, ILanguagePackService)
], MainThreadLocalization);
export {
  MainThreadLocalization
};
//# sourceMappingURL=mainThreadLocalization.js.map
