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
import { ChatMode } from "../../constants.js";
import { localize } from "../../../../../../nls.js";
import { PROMPT_LANGUAGE_ID } from "../constants.js";
import { flatten, forEach } from "../utils/treeUtils.js";
import { PromptParser } from "../parsers/promptParser.js";
import { match } from "../../../../../../base/common/glob.js";
import { pick } from "../../../../../../base/common/arrays.js";
import { assert } from "../../../../../../base/common/assert.js";
import { basename } from "../../../../../../base/common/path.js";
import { PromptFilesLocator } from "../utils/promptFilesLocator.js";
import { Disposable } from "../../../../../../base/common/lifecycle.js";
import { ObjectCache } from "../../../../../../base/common/objectCache.js";
import { TextModelPromptParser } from "../parsers/textModelPromptParser.js";
import { ILabelService } from "../../../../../../platform/label/common/label.js";
import { IModelService } from "../../../../../../editor/common/services/model.js";
import { PROMPT_FILE_EXTENSION } from "../../../../../../platform/prompts/common/constants.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
import { IUserDataProfileService } from "../../../../../services/userDataProfile/common/userDataProfile.js";
let PromptsService = class PromptsService2 extends Disposable {
  static {
    __name(this, "PromptsService");
  }
  constructor(labelService, modelService, initService, userDataService) {
    super();
    this.labelService = labelService;
    this.modelService = modelService;
    this.initService = initService;
    this.userDataService = userDataService;
    this.fileLocator = this.initService.createInstance(PromptFilesLocator);
    this.cache = this._register(new ObjectCache((model) => {
      assert(model.isDisposed() === false, "Text model must not be disposed.");
      const parser = initService.createInstance(TextModelPromptParser, model, { seenReferences: [] }).start();
      parser.assertNotDisposed("Created prompt parser must not be disposed.");
      return parser;
    }));
  }
  /**
   * @throws {Error} if:
   * 	- the provided model is disposed
   * 	- newly created parser is disposed immediately on initialization.
   * 	  See factory function in the {@link constructor} for more info.
   */
  getSyntaxParserFor(model) {
    assert(model.isDisposed() === false, "Cannot create a prompt syntax parser for a disposed model.");
    return this.cache.get(model);
  }
  async listPromptFiles(type) {
    const userLocations = [this.userDataService.currentProfile.promptsHome];
    const prompts = await Promise.all([
      this.fileLocator.listFilesIn(userLocations, type).then(withType("user", type)),
      this.fileLocator.listFiles(type).then(withType("local", type))
    ]);
    return prompts.flat();
  }
  getSourceFolders(type) {
    assert(type === "prompt" || type === "instructions", `Unknown prompt type '${type}'.`);
    const result = [];
    for (const uri of this.fileLocator.getConfigBasedSourceFolders(type)) {
      result.push({ uri, storage: "local", type });
    }
    const userHome = this.userDataService.currentProfile.promptsHome;
    result.push({ uri: userHome, storage: "user", type });
    return result;
  }
  asPromptSlashCommand(command) {
    if (command.match(/^[\w_\-\.]+/)) {
      return { command, detail: localize("prompt.file.detail", "Prompt file: {0}", command) };
    }
    return void 0;
  }
  async resolvePromptSlashCommand(data) {
    if (data.promptPath) {
      return data.promptPath;
    }
    const files = await this.listPromptFiles("prompt");
    const command = data.command;
    const result = files.find((file) => getPromptCommandName(file.uri.path) === command);
    if (result) {
      return result;
    }
    const model = this.modelService.getModels().find((model2) => model2.getLanguageId() === PROMPT_LANGUAGE_ID && getPromptCommandName(model2.uri.path) === command);
    if (model) {
      return { uri: model.uri, storage: "local", type: "prompt" };
    }
    return void 0;
  }
  async findPromptSlashCommands() {
    const promptFiles = await this.listPromptFiles("prompt");
    return promptFiles.map((promptPath) => {
      const command = getPromptCommandName(promptPath.uri.path);
      return {
        command,
        detail: localize("prompt.file.detail", "Prompt file: {0}", this.labelService.getUriLabel(promptPath.uri, { relative: true })),
        promptPath
      };
    });
  }
  async findInstructionFilesFor(files) {
    const result = [];
    const instructionFiles = await this.listPromptFiles("instructions");
    if (instructionFiles.length === 0) {
      return result;
    }
    const instructions = await this.getAllMetadata(instructionFiles.map(pick("uri")));
    for (const instruction of instructions.flatMap(flatten)) {
      const { metadata, uri } = instruction;
      const { applyTo } = metadata;
      if (applyTo === void 0) {
        continue;
      }
      if (applyTo === "**" || applyTo === "**/*") {
        result.push(uri);
        continue;
      }
      for (const file of files) {
        if (match(applyTo, file.fsPath)) {
          result.push(uri);
          continue;
        }
      }
    }
    return [...new Set(result)];
  }
  async getAllMetadata(promptUris) {
    const metadata = await Promise.all(promptUris.map(async (uri) => {
      let parser;
      try {
        parser = this.initService.createInstance(PromptParser, uri, { allowNonPromptFiles: true }).start();
        await parser.allSettled();
        return collectMetadata(parser);
      } finally {
        parser?.dispose();
      }
    }));
    return metadata;
  }
  async getCombinedToolsMetadata(promptUris) {
    if (promptUris.length === 0) {
      return null;
    }
    const filesMetadata = await this.getAllMetadata(promptUris);
    const allTools = filesMetadata.map((fileMetadata) => {
      const result2 = [];
      let isFirst = true;
      let isRootInAgentMode = false;
      let hasTools = false;
      let chatMode;
      forEach((node) => {
        const { metadata } = node;
        const { mode, tools } = metadata;
        if (isFirst === true) {
          isFirst = false;
          if (mode === ChatMode.Agent || tools !== void 0) {
            isRootInAgentMode = true;
            chatMode = ChatMode.Agent;
          }
        }
        chatMode ??= mode;
        if (chatMode && mode) {
          chatMode = morePrivilegedChatMode(chatMode, mode);
        }
        if (isRootInAgentMode && tools !== void 0) {
          result2.push(...tools);
          hasTools = true;
        }
        return false;
      }, fileMetadata);
      if (chatMode === ChatMode.Agent) {
        return {
          tools: hasTools ? [...new Set(result2)] : void 0,
          mode: ChatMode.Agent
        };
      }
      return {
        mode: chatMode
      };
    });
    let hasAnyTools = false;
    let resultingChatMode;
    const result = [];
    for (const { tools, mode } of allTools) {
      resultingChatMode ??= mode;
      if (resultingChatMode && mode) {
        resultingChatMode = morePrivilegedChatMode(resultingChatMode, mode);
      }
      if (tools) {
        result.push(...tools);
        hasAnyTools = true;
      }
    }
    if (resultingChatMode === ChatMode.Agent) {
      return {
        tools: hasAnyTools ? [...new Set(result)] : void 0,
        mode: resultingChatMode
      };
    }
    return {
      tools: void 0,
      mode: resultingChatMode
    };
  }
};
PromptsService = __decorate([
  __param(0, ILabelService),
  __param(1, IModelService),
  __param(2, IInstantiationService),
  __param(3, IUserDataProfileService)
], PromptsService);
const morePrivilegedChatMode = /* @__PURE__ */ __name((chatMode1, chatMode2) => {
  if (chatMode1 === chatMode2) {
    return chatMode1;
  }
  if (chatMode1 === ChatMode.Agent || chatMode2 === ChatMode.Agent) {
    return ChatMode.Agent;
  }
  if (chatMode1 === ChatMode.Edit || chatMode2 === ChatMode.Edit) {
    return ChatMode.Edit;
  }
  throw new Error([
    "Invalid logic encountered: ",
    `at this point modes '${chatMode1}' and '${chatMode2}' are different, but`,
    `both must have be equal to '${ChatMode.Ask}' at the same time.`
  ].join(" "));
}, "morePrivilegedChatMode");
const collectMetadata = /* @__PURE__ */ __name((reference) => {
  const childMetadata = [];
  for (const child of reference.references) {
    if (child.errorCondition !== void 0) {
      continue;
    }
    childMetadata.push(collectMetadata(child));
  }
  const children = childMetadata.length > 0 ? childMetadata : void 0;
  return {
    uri: reference.uri,
    metadata: reference.metadata,
    children
  };
}, "collectMetadata");
function getPromptCommandName(path) {
  const name = basename(path, PROMPT_FILE_EXTENSION);
  return name;
}
__name(getPromptCommandName, "getPromptCommandName");
const addType = /* @__PURE__ */ __name((storage, type) => {
  return (uri) => {
    return { uri, storage, type };
  };
}, "addType");
const withType = /* @__PURE__ */ __name((storage, type) => {
  return (uris) => {
    return uris.map(addType(storage, type));
  };
}, "withType");
export {
  PromptsService,
  getPromptCommandName
};
//# sourceMappingURL=promptsService.js.map
