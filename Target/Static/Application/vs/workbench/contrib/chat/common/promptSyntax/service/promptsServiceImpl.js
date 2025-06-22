var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { localize } from "../../../../../../nls.js";
import { getPromptsTypeForLanguageId, PROMPT_LANGUAGE_ID, PromptsType } from "../promptTypes.js";
import { PromptParser } from "../parsers/promptParser.js";
import { assert } from "../../../../../../base/common/assert.js";
import { basename } from "../../../../../../base/common/path.js";
import { PromptFilesLocator } from "../utils/promptFilesLocator.js";
import { Disposable } from "../../../../../../base/common/lifecycle.js";
import { ObjectCache } from "../utils/objectCache.js";
import { ILogService } from "../../../../../../platform/log/common/log.js";
import { TextModelPromptParser } from "../parsers/textModelPromptParser.js";
import { ILabelService } from "../../../../../../platform/label/common/label.js";
import { IModelService } from "../../../../../../editor/common/services/model.js";
import { CancellationToken } from "../../../../../../base/common/cancellation.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
import { IUserDataProfileService } from "../../../../../services/userDataProfile/common/userDataProfile.js";
import { getCleanPromptName, PROMPT_FILE_EXTENSION } from "../config/promptFileLocations.js";
import { ILanguageService } from "../../../../../../editor/common/languages/language.js";
import { PromptsConfig } from "../config/config.js";
import { IConfigurationService } from "../../../../../../platform/configuration/common/configuration.js";
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
let PromptsService = class PromptsService2 extends Disposable {
  static {
    __name(this, "PromptsService");
  }
  constructor(logger, labelService, modelService, instantiationService, userDataService, languageService, configurationService) {
    super();
    this.logger = logger;
    this.labelService = labelService;
    this.modelService = modelService;
    this.instantiationService = instantiationService;
    this.userDataService = userDataService;
    this.languageService = languageService;
    this.configurationService = configurationService;
    this.fileLocator = this._register(this.instantiationService.createInstance(PromptFilesLocator));
    this.cache = this._register(new ObjectCache((model) => {
      assert(model.isDisposed() === false, "Text model must not be disposed.");
      const parser = instantiationService.createInstance(TextModelPromptParser, model, { seenReferences: [] }).start();
      parser.assertNotDisposed("Created prompt parser must not be disposed.");
      return parser;
    }));
  }
  /**
   * Emitter for the custom chat modes change event.
   */
  get onDidChangeCustomChatModes() {
    if (!this.onDidChangeCustomChatModesEvent) {
      this.onDidChangeCustomChatModesEvent = this._register(this.fileLocator.createFilesUpdatedEvent(PromptsType.mode)).event;
    }
    return this.onDidChangeCustomChatModesEvent;
  }
  getPromptFileType(uri) {
    const model = this.modelService.getModel(uri);
    const languageId = model ? model.getLanguageId() : this.languageService.guessLanguageIdByFilepathOrFirstLine(uri);
    return languageId ? getPromptsTypeForLanguageId(languageId) : void 0;
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
  async listPromptFiles(type, token) {
    if (!PromptsConfig.enabled(this.configurationService)) {
      return [];
    }
    const prompts = await Promise.all([
      this.fileLocator.listFiles(type, "user", token).then(withType("user", type)),
      this.fileLocator.listFiles(type, "local", token).then(withType("local", type))
    ]);
    return prompts.flat();
  }
  getSourceFolders(type) {
    if (!PromptsConfig.enabled(this.configurationService)) {
      return [];
    }
    const result = [];
    for (const uri of this.fileLocator.getConfigBasedSourceFolders(type)) {
      result.push({ uri, storage: "local", type });
    }
    const userHome = this.userDataService.currentProfile.promptsHome;
    result.push({ uri: userHome, storage: "user", type });
    return result;
  }
  asPromptSlashCommand(command) {
    if (command.match(/^[\w_\-\.]+$/)) {
      return { command, detail: localize("prompt.file.detail", "Prompt file: {0}", command) };
    }
    return void 0;
  }
  async resolvePromptSlashCommand(data, token) {
    const promptUri = await this.getPromptPath(data);
    if (!promptUri) {
      return void 0;
    }
    return await this.parse(promptUri, token);
  }
  async getPromptPath(data) {
    if (data.promptPath) {
      return data.promptPath.uri;
    }
    const files = await this.listPromptFiles(PromptsType.prompt, CancellationToken.None);
    const command = data.command;
    const result = files.find((file) => getPromptCommandName(file.uri.path) === command);
    if (result) {
      return result.uri;
    }
    const textModel = this.modelService.getModels().find((model) => model.getLanguageId() === PROMPT_LANGUAGE_ID && getPromptCommandName(model.uri.path) === command);
    if (textModel) {
      return textModel.uri;
    }
    return void 0;
  }
  async findPromptSlashCommands() {
    const promptFiles = await this.listPromptFiles(PromptsType.prompt, CancellationToken.None);
    return promptFiles.map((promptPath) => {
      const command = getPromptCommandName(promptPath.uri.path);
      return {
        command,
        detail: localize("prompt.file.detail", "Prompt file: {0}", this.labelService.getUriLabel(promptPath.uri, { relative: true })),
        promptPath
      };
    });
  }
  async getCustomChatModes(token) {
    const modeFiles = (await this.listPromptFiles(PromptsType.mode, token)).map((modeFile) => modeFile.uri);
    const metadataList = await Promise.all(modeFiles.map(async (uri) => {
      let parser;
      try {
        parser = this.instantiationService.createInstance(PromptParser, uri, { allowNonPromptFiles: true }).start(token);
        await parser.settled();
        const { metadata } = parser;
        const tools = metadata && "tools" in metadata ? metadata.tools : void 0;
        const body = await parser.getBody();
        return {
          uri,
          name: getCleanPromptName(uri),
          description: metadata?.description,
          tools,
          body
        };
      } finally {
        parser?.dispose();
      }
    }));
    return metadataList;
  }
  async parse(uri, token) {
    let parser;
    try {
      parser = this.instantiationService.createInstance(PromptParser, uri, { allowNonPromptFiles: true }).start(token);
      await parser.settled();
      return {
        uri: parser.uri,
        metadata: parser.metadata,
        topError: parser.topError,
        allValidReferences: parser.allValidReferences.map((ref) => ref.uri)
      };
    } finally {
      parser?.dispose();
    }
  }
  async getAllMetadata(promptUris) {
    const metadata = await Promise.all(promptUris.map(async (uri) => {
      let parser;
      try {
        parser = this.instantiationService.createInstance(PromptParser, uri, { allowNonPromptFiles: true }).start();
        await parser.allSettled();
        return collectMetadata(parser);
      } finally {
        parser?.dispose();
      }
    }));
    return metadata;
  }
};
PromptsService = __decorate([
  __param(0, ILogService),
  __param(1, ILabelService),
  __param(2, IModelService),
  __param(3, IInstantiationService),
  __param(4, IUserDataProfileService),
  __param(5, ILanguageService),
  __param(6, IConfigurationService)
], PromptsService);
function collectMetadata(reference) {
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
}
__name(collectMetadata, "collectMetadata");
function getPromptCommandName(path) {
  const name = basename(path, PROMPT_FILE_EXTENSION);
  return name;
}
__name(getPromptCommandName, "getPromptCommandName");
function addType(storage, type) {
  return (uri) => {
    return { uri, storage, type };
  };
}
__name(addType, "addType");
function withType(storage, type) {
  return (uris) => {
    return uris.map(addType(storage, type));
  };
}
__name(withType, "withType");
export {
  PromptsService,
  getPromptCommandName
};
//# sourceMappingURL=promptsServiceImpl.js.map
