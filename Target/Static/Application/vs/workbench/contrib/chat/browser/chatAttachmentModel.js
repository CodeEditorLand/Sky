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
import { URI } from "../../../../base/common/uri.js";
import { Emitter } from "../../../../base/common/event.js";
import { basename } from "../../../../base/common/resources.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ChatPromptAttachmentsCollection } from "./chatAttachmentModel/chatPromptAttachmentsCollection.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { IDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import { ISharedWebContentExtractorService } from "../../../../platform/webContentExtractor/common/webContentExtractor.js";
import { Schemas } from "../../../../base/common/network.js";
import { resolveImageEditorAttachContext } from "./chatAttachmentResolve.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { equals } from "../../../../base/common/objects.js";
let ChatAttachmentModel = class ChatAttachmentModel2 extends Disposable {
  static {
    __name(this, "ChatAttachmentModel");
  }
  constructor(instaService, fileService, dialogService, webContentExtractorService) {
    super();
    this.fileService = fileService;
    this.dialogService = dialogService;
    this.webContentExtractorService = webContentExtractorService;
    this._attachments = /* @__PURE__ */ new Map();
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this.promptInstructions = this._register(instaService.createInstance(ChatPromptAttachmentsCollection));
  }
  get attachments() {
    return Array.from(this._attachments.values());
  }
  get size() {
    return this._attachments.size;
  }
  get fileAttachments() {
    return this.attachments.filter((file) => file.kind === "file" && URI.isUri(file.value)).map((file) => file.value);
  }
  getAttachmentIDs() {
    return new Set(this._attachments.keys());
  }
  clear(clearStickyAttachments = false) {
    const deleted = Array.from(this._attachments.keys());
    this._attachments.clear();
    if (clearStickyAttachments) {
      this.promptInstructions.clear();
    }
    this._onDidChange.fire({ deleted, added: [], updated: [] });
  }
  delete(...variableEntryIds) {
    const deleted = [];
    for (const variableEntryId of variableEntryIds) {
      if (this._attachments.delete(variableEntryId)) {
        deleted.push(variableEntryId);
      }
    }
    if (deleted.length > 0) {
      this._onDidChange.fire({ deleted, added: [], updated: [] });
    }
  }
  async addFile(uri, range) {
    if (/\.(png|jpe?g|gif|bmp|webp)$/i.test(uri.path)) {
      const context = await this.asImageVariableEntry(uri);
      if (context) {
        this.addContext(context);
      }
      return;
    }
    this.addContext(this.asVariableEntry(uri, range));
  }
  addFolder(uri) {
    this.addContext({
      kind: "directory",
      value: uri,
      id: uri.toString(),
      name: basename(uri)
    });
  }
  asVariableEntry(uri, range) {
    return {
      kind: "file",
      value: range ? { uri, range } : uri,
      id: uri.toString() + (range?.toString() ?? ""),
      name: basename(uri)
    };
  }
  // Gets an image variable for a given URI, which may be a file or a web URL
  async asImageVariableEntry(uri) {
    if (uri.scheme === Schemas.file && await this.fileService.canHandleResource(uri)) {
      return await resolveImageEditorAttachContext(this.fileService, this.dialogService, uri);
    } else if (uri.scheme === Schemas.http || uri.scheme === Schemas.https) {
      const extractedImages = await this.webContentExtractorService.readImage(uri, CancellationToken.None);
      if (extractedImages) {
        return await resolveImageEditorAttachContext(this.fileService, this.dialogService, uri, extractedImages);
      }
    }
    return void 0;
  }
  addContext(...attachments) {
    const added = [];
    for (const attachment of attachments) {
      if (!this._attachments.has(attachment.id)) {
        this._attachments.set(attachment.id, attachment);
        added.push(attachment);
      }
    }
    if (added.length > 0) {
      this._onDidChange.fire({ deleted: [], added, updated: [] });
    }
  }
  clearAndSetContext(...attachments) {
    const deleted = Array.from(this._attachments.keys());
    this._attachments.clear();
    const added = [];
    for (const attachment of attachments) {
      this._attachments.set(attachment.id, attachment);
      added.push(attachment);
    }
    if (deleted.length > 0 || added.length > 0) {
      this._onDidChange.fire({ deleted, added, updated: [] });
    }
  }
  updateContent(toDelete, upsert) {
    const deleted = [];
    const added = [];
    const updated = [];
    for (const id of toDelete) {
      if (this._attachments.delete(id)) {
        deleted.push(id);
      }
    }
    for (const item of upsert) {
      const oldItem = this._attachments.get(item.id);
      if (!oldItem) {
        this._attachments.set(item.id, item);
        added.push(item);
      } else if (!equals(oldItem, item)) {
        this._attachments.set(item.id, item);
        updated.push(item);
      }
    }
    if (deleted.length > 0 || added.length > 0 || updated.length > 0) {
      this._onDidChange.fire({ deleted, added, updated });
    }
  }
};
ChatAttachmentModel = __decorate([
  __param(0, IInstantiationService),
  __param(1, IFileService),
  __param(2, IDialogService),
  __param(3, ISharedWebContentExtractorService)
], ChatAttachmentModel);
export {
  ChatAttachmentModel
};
//# sourceMappingURL=chatAttachmentModel.js.map
