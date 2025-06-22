var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { URI } from "../../../../base/common/uri.js";
import { Emitter } from "../../../../base/common/event.js";
import { basename } from "../../../../base/common/resources.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { isPromptFileVariableEntry } from "../common/chatVariableEntries.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { ISharedWebContentExtractorService } from "../../../../platform/webContentExtractor/common/webContentExtractor.js";
import { Schemas } from "../../../../base/common/network.js";
import { IChatAttachmentResolveService } from "./chatAttachmentResolveService.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { equals } from "../../../../base/common/objects.js";
import { Iterable } from "../../../../base/common/iterator.js";
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
let ChatAttachmentModel = class ChatAttachmentModel2 extends Disposable {
  static {
    __name(this, "ChatAttachmentModel");
  }
  constructor(fileService, webContentExtractorService, chatAttachmentResolveService) {
    super();
    this.fileService = fileService;
    this.webContentExtractorService = webContentExtractorService;
    this.chatAttachmentResolveService = chatAttachmentResolveService;
    this._attachments = /* @__PURE__ */ new Map();
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
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
  async addFile(uri, range) {
    if (/\.(png|jpe?g|gif|bmp|webp)$/i.test(uri.path)) {
      const context = await this.asImageVariableEntry(uri);
      if (context) {
        this.addContext(context);
      }
      return;
    } else {
      this.addContext(this.asFileVariableEntry(uri, range));
    }
  }
  addFolder(uri) {
    this.addContext({
      kind: "directory",
      value: uri,
      id: uri.toString(),
      name: basename(uri)
    });
  }
  clear(clearStickyAttachments = false) {
    if (clearStickyAttachments) {
      const deleted = Array.from(this._attachments.keys());
      this._attachments.clear();
      this._onDidChange.fire({ deleted, added: [], updated: [] });
    } else {
      const deleted = [];
      const allIds = Array.from(this._attachments.keys());
      for (const id of allIds) {
        const entry = this._attachments.get(id);
        if (entry && !isPromptFileVariableEntry(entry)) {
          this._attachments.delete(id);
          deleted.push(id);
        }
      }
      this._onDidChange.fire({ deleted, added: [], updated: [] });
    }
  }
  addContext(...attachments) {
    attachments = attachments.filter((attachment) => !this._attachments.has(attachment.id));
    this.updateContext(Iterable.empty(), attachments);
  }
  clearAndSetContext(...attachments) {
    this.updateContext(Array.from(this._attachments.keys()), attachments);
  }
  delete(...variableEntryIds) {
    this.updateContext(variableEntryIds, Iterable.empty());
  }
  updateContext(toDelete, upsert) {
    const deleted = [];
    const added = [];
    const updated = [];
    for (const id of toDelete) {
      const item = this._attachments.get(id);
      if (item) {
        this._attachments.delete(id);
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
  // ---- create utils
  asFileVariableEntry(uri, range) {
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
      return await this.chatAttachmentResolveService.resolveImageEditorAttachContext(uri);
    } else if (uri.scheme === Schemas.http || uri.scheme === Schemas.https) {
      const extractedImages = await this.webContentExtractorService.readImage(uri, CancellationToken.None);
      if (extractedImages) {
        return await this.chatAttachmentResolveService.resolveImageEditorAttachContext(uri, extractedImages);
      }
    }
    return void 0;
  }
};
ChatAttachmentModel = __decorate([
  __param(0, IFileService),
  __param(1, ISharedWebContentExtractorService),
  __param(2, IChatAttachmentResolveService)
], ChatAttachmentModel);
export {
  ChatAttachmentModel
};
//# sourceMappingURL=chatAttachmentModel.js.map
