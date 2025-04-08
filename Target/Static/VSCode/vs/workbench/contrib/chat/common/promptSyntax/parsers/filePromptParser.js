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
import { BasePromptParser } from "./basePromptParser.js";
import { URI } from "../../../../../../base/common/uri.js";
import { ILogService } from "../../../../../../platform/log/common/log.js";
import { FilePromptContentProvider } from "../contentProviders/filePromptContentsProvider.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
let FilePromptParser = class extends BasePromptParser {
  static {
    __name(this, "FilePromptParser");
  }
  constructor(uri, seenReferences = [], initService, logService) {
    const contentsProvider = initService.createInstance(FilePromptContentProvider, uri);
    super(contentsProvider, seenReferences, initService, logService);
    this._register(contentsProvider);
  }
  /**
   * Returns a string representation of this object.
   */
  toString() {
    return `file-prompt:${this.uri.path}`;
  }
};
FilePromptParser = __decorateClass([
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, ILogService)
], FilePromptParser);
export {
  FilePromptParser
};
//# sourceMappingURL=filePromptParser.js.map
