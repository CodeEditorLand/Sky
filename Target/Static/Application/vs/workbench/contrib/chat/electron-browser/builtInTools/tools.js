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
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { dirname, extUriBiasedIgnorePathCase } from "../../../../../base/common/resources.js";
import { URI } from "../../../../../base/common/uri.js";
import { IFileService } from "../../../../../platform/files/common/files.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { ChatExternalPathConfirmationContribution } from "../../common/tools/builtinTools/chatExternalPathConfirmation.js";
import { ChatUrlFetchingConfirmationContribution } from "../../common/tools/builtinTools/chatUrlFetchingConfirmation.js";
import { ILanguageModelToolsConfirmationService } from "../../common/tools/languageModelToolsConfirmationService.js";
import { ILanguageModelToolsService } from "../../common/tools/languageModelToolsService.js";
import { InternalFetchWebPageToolId } from "../../common/tools/builtinTools/tools.js";
import { FetchWebPageTool, FetchWebPageToolData } from "./fetchPageTool.js";
let NativeBuiltinToolsContribution = class NativeBuiltinToolsContribution2 extends Disposable {
  static {
    __name(this, "NativeBuiltinToolsContribution");
  }
  static {
    this.ID = "chat.nativeBuiltinTools";
  }
  constructor(toolsService, instantiationService, confirmationService, fileService) {
    super();
    const editTool = instantiationService.createInstance(FetchWebPageTool);
    this._register(toolsService.registerTool(FetchWebPageToolData, editTool));
    this._register(confirmationService.registerConfirmationContribution(InternalFetchWebPageToolId, instantiationService.createInstance(ChatUrlFetchingConfirmationContribution, (params) => params.urls)));
    const externalPathConfirmation = new ChatExternalPathConfirmationContribution((ref) => {
      const params = ref.parameters;
      if (params?.filePath) {
        return { path: params.filePath, isDirectory: false };
      }
      if (params?.path) {
        return { path: params.path, isDirectory: true };
      }
      return void 0;
    }, async (pathUri) => {
      let dir = dirname(pathUri);
      for (let i = 0; i < 100; i++) {
        try {
          if (await fileService.exists(URI.joinPath(dir, ".git"))) {
            return dir;
          }
        } catch {
        }
        const parent = dirname(dir);
        if (extUriBiasedIgnorePathCase.isEqual(parent, dir)) {
          return void 0;
        }
        dir = parent;
      }
      return void 0;
    });
    this._register(confirmationService.registerConfirmationContribution("copilot_readFile", externalPathConfirmation));
    this._register(confirmationService.registerConfirmationContribution("copilot_listDirectory", externalPathConfirmation));
  }
};
NativeBuiltinToolsContribution = __decorate([
  __param(0, ILanguageModelToolsService),
  __param(1, IInstantiationService),
  __param(2, ILanguageModelToolsConfirmationService),
  __param(3, IFileService)
], NativeBuiltinToolsContribution);
export {
  NativeBuiltinToolsContribution
};
//# sourceMappingURL=tools.js.map
