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
var ChatEditingNotebookFileSystemProvider_1;
import { Event } from "../../../../../../base/common/event.js";
import { Disposable } from "../../../../../../base/common/lifecycle.js";
import { ResourceMap } from "../../../../../../base/common/map.js";
import { FileType, IFileService } from "../../../../../../platform/files/common/files.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
import { INotebookService } from "../../../../notebook/common/notebookService.js";
import { IChatEditingService } from "../../../common/chatEditingService.js";
import { ChatEditingNotebookSnapshotScheme, deserializeSnapshot } from "./chatEditingModifiedNotebookSnapshot.js";
import { ChatEditingSession } from "../chatEditingSession.js";
let ChatEditingNotebookFileSystemProviderContrib = class ChatEditingNotebookFileSystemProviderContrib2 extends Disposable {
  static {
    __name(this, "ChatEditingNotebookFileSystemProviderContrib");
  }
  static {
    this.ID = "chatEditingNotebookFileSystemProviderContribution";
  }
  constructor(fileService, instantiationService) {
    super();
    this.fileService = fileService;
    const fileSystemProvider = instantiationService.createInstance(ChatEditingNotebookFileSystemProvider);
    this._register(this.fileService.registerProvider(ChatEditingNotebookSnapshotScheme, fileSystemProvider));
  }
};
ChatEditingNotebookFileSystemProviderContrib = __decorate([
  __param(0, IFileService),
  __param(1, IInstantiationService)
], ChatEditingNotebookFileSystemProviderContrib);
let ChatEditingNotebookFileSystemProvider = class ChatEditingNotebookFileSystemProvider2 {
  static {
    __name(this, "ChatEditingNotebookFileSystemProvider");
  }
  static {
    ChatEditingNotebookFileSystemProvider_1 = this;
  }
  static {
    this.registeredFiles = new ResourceMap();
  }
  static registerFile(resource, buffer) {
    ChatEditingNotebookFileSystemProvider_1.registeredFiles.set(resource, buffer);
    return {
      dispose() {
        if (ChatEditingNotebookFileSystemProvider_1.registeredFiles.get(resource) === buffer) {
          ChatEditingNotebookFileSystemProvider_1.registeredFiles.delete(resource);
        }
      }
    };
  }
  constructor(_chatEditingService, notebookService) {
    this._chatEditingService = _chatEditingService;
    this.notebookService = notebookService;
    this.capabilities = 2048 | 16384 | 2;
    this.onDidChangeCapabilities = Event.None;
    this.onDidChangeFile = Event.None;
  }
  watch(_resource, _opts) {
    return Disposable.None;
  }
  async stat(_resource) {
    return {
      type: FileType.File,
      ctime: 0,
      mtime: 0,
      size: 0
    };
  }
  mkdir(_resource) {
    throw new Error("Method not implemented1.");
  }
  readdir(_resource) {
    throw new Error("Method not implemented2.");
  }
  delete(_resource, _opts) {
    throw new Error("Method not implemented3.");
  }
  rename(_from, _to, _opts) {
    throw new Error("Method not implemented4.");
  }
  copy(_from, _to, _opts) {
    throw new Error("Method not implemented5.");
  }
  async readFile(resource) {
    const buffer = ChatEditingNotebookFileSystemProvider_1.registeredFiles.get(resource);
    if (buffer) {
      return buffer.buffer;
    }
    const queryData = JSON.parse(resource.query);
    if (!queryData.viewType) {
      throw new Error("File not found, viewType not found");
    }
    const session = this._chatEditingService.getEditingSession(queryData.sessionId);
    if (!(session instanceof ChatEditingSession) || !queryData.requestId) {
      throw new Error("File not found, session not found");
    }
    const snapshotEntry = session.getSnapshot(queryData.requestId, queryData.undoStop || void 0, resource);
    if (!snapshotEntry) {
      throw new Error("File not found, snapshot not found");
    }
    const { data } = deserializeSnapshot(snapshotEntry.current);
    const { serializer } = await this.notebookService.withNotebookDataProvider(queryData.viewType);
    return serializer.notebookToData(data).then((s) => s.buffer);
  }
  writeFile(__resource, _content, _opts) {
    throw new Error("Method not implemented7.");
  }
  readFileStream(__resource, _opts, _token) {
    throw new Error("Method not implemented8.");
  }
  open(__resource, _opts) {
    throw new Error("Method not implemented9.");
  }
  close(_fd) {
    throw new Error("Method not implemented10.");
  }
  read(_fd, _pos, _data, _offset, _length) {
    throw new Error("Method not implemented11.");
  }
  write(_fd, _pos, _data, _offset, _length) {
    throw new Error("Method not implemented12.");
  }
  cloneFile(_from, __to) {
    throw new Error("Method not implemented13.");
  }
};
ChatEditingNotebookFileSystemProvider = ChatEditingNotebookFileSystemProvider_1 = __decorate([
  __param(0, IChatEditingService),
  __param(1, INotebookService)
], ChatEditingNotebookFileSystemProvider);
export {
  ChatEditingNotebookFileSystemProvider,
  ChatEditingNotebookFileSystemProviderContrib
};
//# sourceMappingURL=chatEditingNotebookFileSystemProvider.js.map
