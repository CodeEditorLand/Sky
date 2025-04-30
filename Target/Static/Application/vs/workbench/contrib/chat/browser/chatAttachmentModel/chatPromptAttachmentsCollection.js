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
import { Emitter } from "../../../../../base/common/event.js";
import { basename } from "../../../../../base/common/resources.js";
import { ChatPromptAttachmentModel } from "./chatPromptAttachmentModel.js";
import { PromptsConfig } from "../../../../../platform/prompts/common/config.js";
import { Disposable, DisposableMap } from "../../../../../base/common/lifecycle.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { isChatRequestFileEntry } from "../../common/chatModel.js";
const PROMPT_VARIABLE_ID_PREFIX = "vscode.prompt.instructions";
const createPromptVariableId = /* @__PURE__ */ __name((uri, isRoot) => {
  let prefix = PROMPT_VARIABLE_ID_PREFIX;
  if (isRoot) {
    prefix += ".root";
  }
  return `${prefix}__${uri}`;
}, "createPromptVariableId");
const toChatVariable = /* @__PURE__ */ __name((reference, isRoot) => {
  const { uri, isPromptFile } = reference;
  let id = `${uri}`;
  if (isPromptFile) {
    id = createPromptVariableId(uri, isRoot);
  }
  const name = isPromptFile ? `prompt:${basename(uri)}` : `file:${basename(uri)}`;
  const modelDescription = isPromptFile ? "Prompt instructions file" : "File attachment";
  return {
    id,
    name,
    value: uri,
    kind: "file",
    modelDescription,
    isRoot
  };
}, "toChatVariable");
function isPromptFileChatVariable(variable) {
  return isChatRequestFileEntry(variable) && variable.id.startsWith(PROMPT_VARIABLE_ID_PREFIX);
}
__name(isPromptFileChatVariable, "isPromptFileChatVariable");
let ChatPromptAttachmentsCollection = class ChatPromptAttachmentsCollection2 extends Disposable {
  static {
    __name(this, "ChatPromptAttachmentsCollection");
  }
  /**
   * Get all `URI`s of all valid references, including all
   * the possible references nested inside the children.
   */
  get references() {
    const result = [];
    for (const child of this.attachments.values()) {
      result.push(...child.references);
    }
    return result;
  }
  /**
   * Get list of tools associated with all attached prompt files.
   */
  get toolsMetadata() {
    const result = [];
    for (const child of this.attachments.values()) {
      const { toolsMetadata } = child;
      if (toolsMetadata === null) {
        continue;
      }
      result.push(...toolsMetadata);
    }
    return [...new Set(result)];
  }
  /**
   * Get the list of all prompt instruction attachment variables, including all
   * nested child references of each attachment explicitly attached by user.
   */
  get chatAttachments() {
    const result = [];
    const attachments = [...this.attachments.values()];
    for (const attachment of attachments) {
      const { reference } = attachment;
      result.push(...reference.allValidReferences.map((link) => {
        return toChatVariable(link, false);
      }));
      result.push(toChatVariable({
        uri: reference.uri,
        // the attached file must have been a prompt file therefore
        // we force that assumption here; this makes sure that prompts
        // in untitled documents can be also attached to the chat input
        isPromptFile: true
      }, true));
    }
    return result;
  }
  /**
   * Promise that resolves when parsing of all attached prompt instruction
   * files completes, including parsing of all its possible child references.
   */
  async allSettled() {
    const attachments = [...this.attachments.values()];
    await Promise.allSettled(attachments.map((attachment) => {
      return attachment.allSettled;
    }));
    return this;
  }
  constructor(initService, configService) {
    super();
    this.initService = initService;
    this.configService = configService;
    this._onUpdate = this._register(new Emitter());
    this.onUpdate = this._onUpdate.event;
    this._onAdd = this._register(new Emitter());
    this.onAdd = this._onAdd.event;
    this._onRemove = this._register(new Emitter());
    this.onRemove = this._onRemove.event;
    this.attachments = this._register(new DisposableMap());
    this._onUpdate.fire = this._onUpdate.fire.bind(this._onUpdate);
  }
  /**
   * Add a prompt instruction attachment instance with the provided `URI`.
   * @param uri URI of the prompt instruction attachment to add.
   */
  add(uris) {
    const uriList = Array.isArray(uris) ? uris : [uris];
    if (uriList.length === 0) {
      return;
    }
    for (const uri of uriList) {
      if (this.attachments.has(uri.path)) {
        continue;
      }
      const instruction = this.initService.createInstance(ChatPromptAttachmentModel, uri).onUpdate(this._onUpdate.fire).onDispose(() => {
        this.attachments.deleteAndLeak(uri.path);
        this._onUpdate.fire();
        this._onRemove.fire(instruction);
      }).resolve();
      this.attachments.set(uri.path, instruction);
      this._onAdd.fire(instruction);
      this._onUpdate.fire();
    }
  }
  /**
   * Remove a prompt instruction attachment instance by provided `URI`.
   * @param uri URI of the prompt instruction attachment to remove.
   */
  remove(uri) {
    if (!this.attachments.has(uri.path)) {
      return this;
    }
    this.attachments.deleteAndDispose(uri.path);
    return this;
  }
  /**
   * Checks if the prompt instructions feature is enabled in the user settings.
   */
  get featureEnabled() {
    return PromptsConfig.enabled(this.configService);
  }
  /**
   * Clear all prompt instruction attachments.
   */
  clear() {
    for (const attachment of this.attachments.values()) {
      this.remove(attachment.uri);
    }
    this._onUpdate.fire();
    return this;
  }
};
ChatPromptAttachmentsCollection = __decorate([
  __param(0, IInstantiationService),
  __param(1, IConfigurationService)
], ChatPromptAttachmentsCollection);
export {
  ChatPromptAttachmentsCollection,
  createPromptVariableId,
  isPromptFileChatVariable,
  toChatVariable
};
//# sourceMappingURL=chatPromptAttachmentsCollection.js.map
