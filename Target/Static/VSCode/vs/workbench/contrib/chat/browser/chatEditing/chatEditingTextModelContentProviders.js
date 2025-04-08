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
import { ITextModel } from "../../../../../editor/common/model.js";
import { IModelService } from "../../../../../editor/common/services/model.js";
import { ITextModelContentProvider } from "../../../../../editor/common/services/resolverService.js";
import { chatEditingSnapshotScheme, IChatEditingService } from "../../common/chatEditingService.js";
import { ChatEditingSession } from "./chatEditingSession.js";
let ChatEditingTextModelContentProvider = class {
  constructor(_chatEditingService, _modelService) {
    this._chatEditingService = _chatEditingService;
    this._modelService = _modelService;
  }
  static {
    __name(this, "ChatEditingTextModelContentProvider");
  }
  static scheme = "chat-editing-text-model";
  static getFileURI(chatSessionId, documentId, path) {
    return URI.from({
      scheme: ChatEditingTextModelContentProvider.scheme,
      path,
      query: JSON.stringify({ kind: "doc", documentId, chatSessionId })
    });
  }
  async provideTextContent(resource) {
    const existing = this._modelService.getModel(resource);
    if (existing && !existing.isDisposed()) {
      return existing;
    }
    const data = JSON.parse(resource.query);
    const session = this._chatEditingService.getEditingSession(data.chatSessionId);
    const entry = session?.entries.get().find((candidate) => candidate.entryId === data.documentId);
    if (!entry) {
      return null;
    }
    return this._modelService.getModel(entry.originalURI);
  }
};
ChatEditingTextModelContentProvider = __decorateClass([
  __decorateParam(1, IModelService)
], ChatEditingTextModelContentProvider);
let ChatEditingSnapshotTextModelContentProvider = class {
  constructor(_chatEditingService, _modelService) {
    this._chatEditingService = _chatEditingService;
    this._modelService = _modelService;
  }
  static {
    __name(this, "ChatEditingSnapshotTextModelContentProvider");
  }
  static getSnapshotFileURI(chatSessionId, requestId, undoStop, path) {
    return URI.from({
      scheme: chatEditingSnapshotScheme,
      path,
      query: JSON.stringify({ sessionId: chatSessionId, requestId: requestId ?? "", undoStop: undoStop ?? "" })
    });
  }
  async provideTextContent(resource) {
    const existing = this._modelService.getModel(resource);
    if (existing && !existing.isDisposed()) {
      return existing;
    }
    const data = JSON.parse(resource.query);
    const session = this._chatEditingService.getEditingSession(data.sessionId);
    if (!(session instanceof ChatEditingSession) || !data.requestId) {
      return null;
    }
    return session.getSnapshotModel(data.requestId, data.undoStop || void 0, resource);
  }
};
ChatEditingSnapshotTextModelContentProvider = __decorateClass([
  __decorateParam(1, IModelService)
], ChatEditingSnapshotTextModelContentProvider);
export {
  ChatEditingSnapshotTextModelContentProvider,
  ChatEditingTextModelContentProvider
};
//# sourceMappingURL=chatEditingTextModelContentProviders.js.map
