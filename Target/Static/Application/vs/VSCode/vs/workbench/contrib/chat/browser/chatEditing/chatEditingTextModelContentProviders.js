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
var ChatEditingTextModelContentProvider_1;
import { Schemas } from "../../../../../base/common/network.js";
import { URI } from "../../../../../base/common/uri.js";
import { IModelService } from "../../../../../editor/common/services/model.js";
let ChatEditingTextModelContentProvider = class ChatEditingTextModelContentProvider2 {
  static {
    __name(this, "ChatEditingTextModelContentProvider");
  }
  static {
    ChatEditingTextModelContentProvider_1 = this;
  }
  static {
    this.scheme = Schemas.chatEditingModel;
  }
  static getFileURI(chatSessionResource, documentId, path) {
    return URI.from({
      scheme: ChatEditingTextModelContentProvider_1.scheme,
      path,
      query: JSON.stringify({ kind: "doc", documentId, chatSessionResource })
    });
  }
  constructor(_chatEditingService, _modelService) {
    this._chatEditingService = _chatEditingService;
    this._modelService = _modelService;
  }
  async provideTextContent(resource) {
    const existing = this._modelService.getModel(resource);
    if (existing && !existing.isDisposed()) {
      return existing;
    }
    const data = JSON.parse(resource.query);
    const session = this._chatEditingService.getEditingSession(URI.revive(data.chatSessionResource));
    const entry = session?.entries.get().find((candidate) => candidate.entryId === data.documentId);
    if (!entry) {
      return null;
    }
    return this._modelService.getModel(entry.originalURI);
  }
};
ChatEditingTextModelContentProvider = ChatEditingTextModelContentProvider_1 = __decorate([
  __param(1, IModelService)
], ChatEditingTextModelContentProvider);
let ChatEditingSnapshotTextModelContentProvider = class ChatEditingSnapshotTextModelContentProvider2 {
  static {
    __name(this, "ChatEditingSnapshotTextModelContentProvider");
  }
  static getSnapshotFileURI(chatSessionResource, requestId, undoStop, path, scheme) {
    return URI.from({
      scheme: Schemas.chatEditingSnapshotScheme,
      path,
      query: JSON.stringify({ session: chatSessionResource, requestId: requestId ?? "", undoStop: undoStop ?? "", scheme })
    });
  }
  constructor(_chatEditingService, _modelService) {
    this._chatEditingService = _chatEditingService;
    this._modelService = _modelService;
  }
  async provideTextContent(resource) {
    const existing = this._modelService.getModel(resource);
    if (existing && !existing.isDisposed()) {
      return existing;
    }
    const data = JSON.parse(resource.query);
    const session = this._chatEditingService.getEditingSession(URI.revive(data.session));
    if (!session || !data.requestId) {
      return null;
    }
    return session.getSnapshotModel(data.requestId, data.undoStop || void 0, resource);
  }
};
ChatEditingSnapshotTextModelContentProvider = __decorate([
  __param(1, IModelService)
], ChatEditingSnapshotTextModelContentProvider);
export {
  ChatEditingSnapshotTextModelContentProvider,
  ChatEditingTextModelContentProvider
};
//# sourceMappingURL=chatEditingTextModelContentProviders.js.map
