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
import { assertDefined } from "../../../../../../base/common/types.js";
import { ILogService } from "../../../../../../platform/log/common/log.js";
import { BasePromptParser } from "./basePromptParser.js";
import { IModelService } from "../../../../../../editor/common/services/model.js";
import { isUntitled } from "../../../../../../platform/prompts/common/constants.js";
import { TextModelContentsProvider } from "../contentProviders/textModelContentsProvider.js";
import { FilePromptContentProvider } from "../contentProviders/filePromptContentsProvider.js";
import { IWorkspaceContextService } from "../../../../../../platform/workspace/common/workspace.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
const getContentsProvider = /* @__PURE__ */ __name((uri, options, modelService, instaService) => {
  if (isUntitled(uri)) {
    const model = modelService.getModel(uri);
    assertDefined(model, `Cannot find model of untitled document '${uri.path}'.`);
    return instaService.createInstance(TextModelContentsProvider, model, options);
  }
  return instaService.createInstance(FilePromptContentProvider, uri, options);
}, "getContentsProvider");
let PromptParser = class PromptParser2 extends BasePromptParser {
  static {
    __name(this, "PromptParser");
  }
  constructor(uri, options = {}, logService, modelService, instaService, workspaceService) {
    const contentsProvider = getContentsProvider(uri, options, modelService, instaService);
    super(contentsProvider, options, instaService, workspaceService, logService);
    this.contentsProvider = this._register(contentsProvider);
  }
  /**
   * Returns a string representation of this object.
   */
  toString() {
    const { sourceName } = this.contentsProvider;
    return `prompt-parser:${sourceName}:${this.uri.path}`;
  }
};
PromptParser = __decorate([
  __param(2, ILogService),
  __param(3, IModelService),
  __param(4, IInstantiationService),
  __param(5, IWorkspaceContextService)
], PromptParser);
export {
  PromptParser
};
//# sourceMappingURL=promptParser.js.map
