var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ILogService } from "../../../../../../platform/log/common/log.js";
import { BasePromptParser } from "./basePromptParser.js";
import { FilePromptContentProvider } from "../contentProviders/filePromptContentsProvider.js";
import { IWorkspaceContextService } from "../../../../../../platform/workspace/common/workspace.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
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
let FilePromptParser = class FilePromptParser2 extends BasePromptParser {
  static {
    __name(this, "FilePromptParser");
  }
  constructor(uri, options, instantiationService, workspaceService, logService) {
    const contentsProvider = instantiationService.createInstance(FilePromptContentProvider, uri, options);
    super(contentsProvider, options, instantiationService, workspaceService, logService);
    this._register(contentsProvider);
  }
  /**
   * Returns a string representation of this object.
   */
  toString() {
    return `file-prompt:${this.uri.path}`;
  }
};
FilePromptParser = __decorate([
  __param(2, IInstantiationService),
  __param(3, IWorkspaceContextService),
  __param(4, ILogService)
], FilePromptParser);
export {
  FilePromptParser
};
//# sourceMappingURL=filePromptParser.js.map
