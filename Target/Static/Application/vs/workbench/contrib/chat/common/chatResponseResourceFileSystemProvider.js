var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { decodeBase64, VSBuffer } from "../../../../base/common/buffer.js";
import { Event } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { newWriteableStream } from "../../../../base/common/stream.js";
import { createFileSystemProviderError, FileSystemProviderErrorCode, FileType, IFileService } from "../../../../platform/files/common/files.js";
import { ChatResponseResource } from "./chatModel.js";
import { IChatService } from "./chatService.js";
import { isToolResultInputOutputDetails } from "./languageModelToolsService.js";
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
let ChatResponseResourceFileSystemProvider = class ChatResponseResourceFileSystemProvider2 extends Disposable {
  static {
    __name(this, "ChatResponseResourceFileSystemProvider");
  }
  static {
    this.ID = "workbench.contrib.chatResponseResourceFileSystemProvider";
  }
  constructor(chatService, _fileService) {
    super();
    this.chatService = chatService;
    this._fileService = _fileService;
    this.onDidChangeCapabilities = Event.None;
    this.onDidChangeFile = Event.None;
    this.capabilities = 0 | 2048 | 1024 | 16 | 16384 | 2;
    this._register(this._fileService.registerProvider(ChatResponseResource.scheme, this));
  }
  readFile(resource) {
    return Promise.resolve(this.lookupURI(resource));
  }
  readFileStream(resource) {
    const stream = newWriteableStream((data) => VSBuffer.concat(data.map((data2) => VSBuffer.wrap(data2))).buffer);
    stream.end(this.lookupURI(resource));
    return stream;
  }
  stat(resource) {
    const r = this.lookupURI(resource);
    return Promise.resolve({
      type: FileType.File,
      ctime: 0,
      mtime: 0,
      size: r.length
    });
  }
  delete() {
    throw createFileSystemProviderError("fs is readonly", FileSystemProviderErrorCode.NoPermissions);
  }
  watch() {
    return Disposable.None;
  }
  mkdir() {
    throw createFileSystemProviderError("fs is readonly", FileSystemProviderErrorCode.NoPermissions);
  }
  readdir() {
    return Promise.resolve([]);
  }
  rename() {
    throw createFileSystemProviderError("fs is readonly", FileSystemProviderErrorCode.NoPermissions);
  }
  writeFile() {
    throw createFileSystemProviderError("fs is readonly", FileSystemProviderErrorCode.NoPermissions);
  }
  lookupURI(uri) {
    const parsed = ChatResponseResource.parseUri(uri);
    if (!parsed) {
      throw createFileSystemProviderError(`File not found`, FileSystemProviderErrorCode.FileNotFound);
    }
    const { sessionId, requestId, toolCallId } = parsed;
    const result = this.chatService.getSession(sessionId)?.getRequests().find((r) => r.id === requestId)?.response?.entireResponse.value.find((r) => (r.kind === "toolInvocation" || r.kind === "toolInvocationSerialized") && r.toolCallId === toolCallId);
    if (!result) {
      throw createFileSystemProviderError(`File not found`, FileSystemProviderErrorCode.FileNotFound);
    }
    if (!isToolResultInputOutputDetails(result.resultDetails)) {
      throw createFileSystemProviderError(`Tool does not have I/O`, FileSystemProviderErrorCode.FileNotFound);
    }
    const part = result.resultDetails.output.at(parsed.index);
    if (!part) {
      throw createFileSystemProviderError(`Tool does not have part`, FileSystemProviderErrorCode.FileNotFound);
    }
    return part.isText ? new TextEncoder().encode(part.value) : decodeBase64(part.value).buffer;
  }
};
ChatResponseResourceFileSystemProvider = __decorate([
  __param(0, IChatService),
  __param(1, IFileService)
], ChatResponseResourceFileSystemProvider);
export {
  ChatResponseResourceFileSystemProvider
};
//# sourceMappingURL=chatResponseResourceFileSystemProvider.js.map
