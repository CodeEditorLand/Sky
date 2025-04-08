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
import { IPromptPath, IPromptsService } from "./types.js";
import { URI } from "../../../../../../base/common/uri.js";
import { assert } from "../../../../../../base/common/assert.js";
import { PromptFilesLocator } from "../utils/promptFilesLocator.js";
import { ITextModel } from "../../../../../../editor/common/model.js";
import { Disposable } from "../../../../../../base/common/lifecycle.js";
import { ObjectCache } from "../../../../../../base/common/objectCache.js";
import { TextModelPromptParser } from "../parsers/textModelPromptParser.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
import { IUserDataProfileService } from "../../../../../services/userDataProfile/common/userDataProfile.js";
let PromptsService = class extends Disposable {
  constructor(initService, userDataService) {
    super();
    this.initService = initService;
    this.userDataService = userDataService;
    this.fileLocator = this.initService.createInstance(PromptFilesLocator);
    this.cache = this._register(
      new ObjectCache((model) => {
        const parser = initService.createInstance(
          TextModelPromptParser,
          model,
          []
        );
        parser.start();
        parser.assertNotDisposed(
          "Created prompt parser must not be disposed."
        );
        return parser;
      })
    );
  }
  static {
    __name(this, "PromptsService");
  }
  /**
   * Cache of text model content prompt parsers.
   */
  cache;
  /**
   * Prompt files locator utility.
   */
  fileLocator;
  /**
   * @throws {Error} if:
   * 	- the provided model is disposed
   * 	- newly created parser is disposed immediately on initialization.
   * 	  See factory function in the {@link constructor} for more info.
   */
  getSyntaxParserFor(model) {
    assert(
      !model.isDisposed(),
      "Cannot create a prompt syntax parser for a disposed model."
    );
    return this.cache.get(model);
  }
  async listPromptFiles() {
    const userLocations = [this.userDataService.currentProfile.promptsHome];
    const prompts = await Promise.all([
      this.fileLocator.listFilesIn(userLocations).then(withType("user")),
      this.fileLocator.listFiles().then(withType("local"))
    ]);
    return prompts.flat();
  }
  getSourceFolders(type) {
    assert(
      type === "local" || type === "user",
      `Unknown prompt type '${type}'.`
    );
    const prompts = type === "user" ? [this.userDataService.currentProfile.promptsHome] : this.fileLocator.getConfigBasedSourceFolders();
    return prompts.map(addType(type));
  }
};
PromptsService = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IUserDataProfileService)
], PromptsService);
const addType = /* @__PURE__ */ __name((type) => {
  return (uri) => {
    return { uri, type };
  };
}, "addType");
const withType = /* @__PURE__ */ __name((type) => {
  return (uris) => {
    return uris.map(addType(type));
  };
}, "withType");
export {
  PromptsService
};
//# sourceMappingURL=promptsService.js.map
