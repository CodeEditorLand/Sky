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
import { URI } from "../../../../base/common/uri.js";
import { Emitter } from "../../../../base/common/event.js";
import { basename } from "../../../../base/common/resources.js";
import { IRange } from "../../../../editor/common/core/range.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { IChatRequestVariableEntry } from "../common/chatModel.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ChatPromptAttachmentsCollection } from "./chatAttachmentModel/chatPromptAttachmentsCollection.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { resizeImage } from "./imageUtils.js";
import { IDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import { localize } from "../../../../nls.js";
let ChatAttachmentModel = class extends Disposable {
  constructor(initService, fileService, dialogService) {
    super();
    this.initService = initService;
    this.fileService = fileService;
    this.dialogService = dialogService;
    this.promptInstructions = this._register(
      this.initService.createInstance(ChatPromptAttachmentsCollection)
    ).onUpdate(() => {
      this._onDidChangeContext.fire();
    });
  }
  static {
    __name(this, "ChatAttachmentModel");
  }
  /**
   * Collection on prompt instruction attachments.
   */
  promptInstructions;
  _attachments = /* @__PURE__ */ new Map();
  get attachments() {
    return Array.from(this._attachments.values());
  }
  _onDidChangeContext = this._register(new Emitter());
  onDidChangeContext = this._onDidChangeContext.event;
  get size() {
    return this._attachments.size;
  }
  get fileAttachments() {
    return this.attachments.reduce((acc, file) => {
      if (file.isFile && URI.isUri(file.value)) {
        acc.push(file.value);
      }
      return acc;
    }, []);
  }
  getAttachmentIDs() {
    return new Set(this._attachments.keys());
  }
  clear() {
    this._attachments.clear();
    this._onDidChangeContext.fire();
  }
  delete(...variableEntryIds) {
    for (const variableEntryId of variableEntryIds) {
      this._attachments.delete(variableEntryId);
    }
    this._onDidChangeContext.fire();
  }
  async addFile(uri, range) {
    if (/\.(png|jpe?g|gif|bmp|webp)$/i.test(uri.path)) {
      this.addContext(await this.asImageVariableEntry(uri));
      return;
    }
    this.addContext(this.asVariableEntry(uri, range));
  }
  addFolder(uri) {
    this.addContext({
      value: uri,
      id: uri.toString(),
      name: basename(uri),
      isFile: false,
      isDirectory: true
    });
  }
  asVariableEntry(uri, range) {
    return {
      value: range ? { uri, range } : uri,
      id: uri.toString() + (range?.toString() ?? ""),
      name: basename(uri),
      isFile: true
    };
  }
  async asImageVariableEntry(uri) {
    const fileName = basename(uri);
    const readFile = await this.fileService.readFile(uri);
    if (readFile.size > 30 * 1024 * 1024) {
      this.dialogService.error(localize("imageTooLarge", "Image is too large"), localize("imageTooLargeMessage", "The image {0} is too large to be attached.", fileName));
      throw new Error("Image is too large");
    }
    const resizedImage = await resizeImage(readFile.value.buffer);
    return {
      id: uri.toString(),
      name: fileName,
      fullName: uri.path,
      value: resizedImage,
      kind: "image",
      isFile: false,
      references: [{ reference: uri, kind: "reference" }]
    };
  }
  addContext(...attachments) {
    let hasAdded = false;
    for (const attachment of attachments) {
      if (!this._attachments.has(attachment.id)) {
        this._attachments.set(attachment.id, attachment);
        hasAdded = true;
      }
    }
    if (hasAdded) {
      this._onDidChangeContext.fire();
    }
  }
  clearAndSetContext(...attachments) {
    this.clear();
    this.addContext(...attachments);
  }
};
ChatAttachmentModel = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IFileService),
  __decorateParam(2, IDialogService)
], ChatAttachmentModel);
export {
  ChatAttachmentModel
};
//# sourceMappingURL=chatAttachmentModel.js.map
