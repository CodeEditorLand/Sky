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
import { URI } from "../../../../../base/common/uri.js";
import { Emitter } from "../../../../../base/common/event.js";
import { IChatRequestVariableEntry } from "../../common/chatModel.js";
import { ChatPromptAttachmentModel } from "./chatPromptAttachmentModel.js";
import { PromptsConfig } from "../../../../../platform/prompts/common/config.js";
import { Disposable, DisposableMap } from "../../../../../base/common/lifecycle.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
const toChatVariable = /* @__PURE__ */ __name((reference, isRoot) => {
  const { uri, isPromptFile } = reference;
  let id = `${uri}`;
  if (isPromptFile) {
    let prefix = "vscode.prompt.instructions";
    if (isRoot) {
      prefix += ".root";
    }
    id = `${prefix}__${id}`;
  }
  return {
    id,
    name: uri.fsPath,
    value: uri,
    isSelection: false,
    enabled: true,
    isFile: true
  };
}, "toChatVariable");
let ChatPromptAttachmentsCollection = class extends Disposable {
  constructor(initService, configService) {
    super();
    this.initService = initService;
    this.configService = configService;
    this._onUpdate.fire = this._onUpdate.fire.bind(this._onUpdate);
  }
  static {
    __name(this, "ChatPromptAttachmentsCollection");
  }
  /**
   * List of all prompt instruction attachments.
   */
  attachments = this._register(new DisposableMap());
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
   * Get the list of all prompt instruction attachment variables, including all
   * nested child references of each attachment explicitly attached by user.
   */
  get chatAttachments() {
    const result = [];
    const attachments = [...this.attachments.values()];
    for (const attachment of attachments) {
      const { reference } = attachment;
      result.push(
        ...reference.allValidReferences.map((link) => {
          return toChatVariable(link, false);
        })
      );
      result.push(
        toChatVariable(reference, true)
      );
    }
    return result;
  }
  /**
   * Promise that resolves when parsing of all attached prompt instruction
   * files completes, including parsing of all its possible child references.
   */
  async allSettled() {
    const attachments = [...this.attachments.values()];
    await Promise.allSettled(
      attachments.map((attachment) => {
        return attachment.allSettled;
      })
    );
  }
  /**
   * Event that fires then this model is updated.
   *
   * See {@linkcode onUpdate}.
   */
  _onUpdate = this._register(new Emitter());
  /**
   * Subscribe to the `onUpdate` event.
   * @param callback Function to invoke on update.
   */
  onUpdate(callback) {
    this._register(this._onUpdate.event(callback));
    return this;
  }
  /**
   * Event that fires when a new prompt instruction attachment is added.
   * See {@linkcode onAdd}.
   */
  _onAdd = this._register(new Emitter());
  /**
   * The `onAdd` event fires when a new prompt instruction attachment is added.
   *
   * @param callback Function to invoke on add.
   */
  onAdd(callback) {
    this._register(this._onAdd.event(callback));
    return this;
  }
  /**
   * Add a prompt instruction attachment instance with the provided `URI`.
   * @param uri URI of the prompt instruction attachment to add.
   */
  add(uri) {
    if (this.attachments.has(uri.path)) {
      return this;
    }
    const instruction = this.initService.createInstance(ChatPromptAttachmentModel, uri).onUpdate(this._onUpdate.fire).onDispose(() => {
      this.attachments.deleteAndLeak(uri.path);
      this._onUpdate.fire();
    });
    this.attachments.set(uri.path, instruction);
    instruction.resolve();
    this._onAdd.fire(instruction);
    this._onUpdate.fire();
    return this;
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
};
ChatPromptAttachmentsCollection = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IConfigurationService)
], ChatPromptAttachmentsCollection);
export {
  ChatPromptAttachmentsCollection,
  toChatVariable
};
//# sourceMappingURL=chatPromptAttachmentsCollection.js.map
