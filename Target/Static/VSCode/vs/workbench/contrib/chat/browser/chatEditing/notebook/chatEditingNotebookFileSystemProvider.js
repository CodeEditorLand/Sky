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
import { VSBuffer } from "../../../../../../base/common/buffer.js";
import { CancellationToken } from "../../../../../../base/common/cancellation.js";
import { Event } from "../../../../../../base/common/event.js";
import { Disposable, IDisposable } from "../../../../../../base/common/lifecycle.js";
import { ResourceMap } from "../../../../../../base/common/map.js";
import { ReadableStreamEvents } from "../../../../../../base/common/stream.js";
import { URI } from "../../../../../../base/common/uri.js";
import { FileSystemProviderCapabilities, FileType, IFileChange, IFileDeleteOptions, IFileOpenOptions, IFileOverwriteOptions, IFileReadStreamOptions, IFileService, IFileSystemProvider, IFileWriteOptions, IStat, IWatchOptions } from "../../../../../../platform/files/common/files.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
import { IWorkbenchContribution } from "../../../../../common/contributions.js";
import { INotebookService } from "../../../../notebook/common/notebookService.js";
import { IChatEditingService } from "../../../common/chatEditingService.js";
import { ChatEditingNotebookSnapshotScheme, deserializeSnapshot } from "./chatEditingModifiedNotebookSnapshot.js";
import { ChatEditingSession } from "../chatEditingSession.js";
let ChatEditingNotebookFileSystemProviderContrib = class extends Disposable {
  constructor(fileService, instantiationService) {
    super();
    this.fileService = fileService;
    const fileSystemProvider = instantiationService.createInstance(ChatEditingNotebookFileSystemProvider);
    this._register(this.fileService.registerProvider(ChatEditingNotebookSnapshotScheme, fileSystemProvider));
  }
  static {
    __name(this, "ChatEditingNotebookFileSystemProviderContrib");
  }
  static ID = "chatEditingNotebookFileSystemProviderContribution";
};
ChatEditingNotebookFileSystemProviderContrib = __decorateClass([
  __decorateParam(0, IFileService),
  __decorateParam(1, IInstantiationService)
], ChatEditingNotebookFileSystemProviderContrib);
let ChatEditingNotebookFileSystemProvider = class {
  constructor(_chatEditingService, notebookService) {
    this._chatEditingService = _chatEditingService;
    this.notebookService = notebookService;
  }
  static {
    __name(this, "ChatEditingNotebookFileSystemProvider");
  }
  static registeredFiles = new ResourceMap();
  capabilities = FileSystemProviderCapabilities.Readonly | FileSystemProviderCapabilities.FileAtomicRead | FileSystemProviderCapabilities.FileReadWrite;
  static registerFile(resource, buffer) {
    ChatEditingNotebookFileSystemProvider.registeredFiles.set(resource, buffer);
    return {
      dispose() {
        if (ChatEditingNotebookFileSystemProvider.registeredFiles.get(resource) === buffer) {
          ChatEditingNotebookFileSystemProvider.registeredFiles.delete(resource);
        }
      }
    };
  }
  onDidChangeCapabilities = Event.None;
  onDidChangeFile = Event.None;
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
    const buffer = ChatEditingNotebookFileSystemProvider.registeredFiles.get(resource);
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
ChatEditingNotebookFileSystemProvider = __decorateClass([
  __decorateParam(0, IChatEditingService),
  __decorateParam(1, INotebookService)
], ChatEditingNotebookFileSystemProvider);
export {
  ChatEditingNotebookFileSystemProvider,
  ChatEditingNotebookFileSystemProviderContrib
};
//# sourceMappingURL=chatEditingNotebookFileSystemProvider.js.map
