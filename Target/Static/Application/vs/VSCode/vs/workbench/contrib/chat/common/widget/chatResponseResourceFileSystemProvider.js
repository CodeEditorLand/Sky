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
import { decodeBase64, VSBuffer } from "../../../../../base/common/buffer.js";
import { Event } from "../../../../../base/common/event.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { ResourceMap, ResourceSet } from "../../../../../base/common/map.js";
import { newWriteableStream } from "../../../../../base/common/stream.js";
import { URI } from "../../../../../base/common/uri.js";
import { generateUuid } from "../../../../../base/common/uuid.js";
import { createDecorator } from "../../../../../platform/instantiation/common/instantiation.js";
import { createFileSystemProviderError, FileSystemProviderErrorCode, FileType, IFileService } from "../../../../../platform/files/common/files.js";
import { ChatResponseResource } from "../model/chatModel.js";
import { IChatService, IChatToolInvocation } from "../chatService/chatService.js";
import { isToolResultInputOutputDetails } from "../tools/languageModelToolsService.js";
const IChatResponseResourceFileSystemProvider = createDecorator("chatResponseResourceFileSystemProvider");
let ChatResponseResourceFileSystemProvider = class ChatResponseResourceFileSystemProvider2 extends Disposable {
  static {
    __name(this, "ChatResponseResourceFileSystemProvider");
  }
  constructor(chatService, _fileService) {
    super();
    this.chatService = chatService;
    this._fileService = _fileService;
    this.onDidChangeCapabilities = Event.None;
    this.onDidChangeFile = Event.None;
    this.capabilities = 0 | 2048 | 1024 | 16 | 16384 | 2;
    this._associated = new ResourceMap();
    this._sessionAssociations = new ResourceMap();
    this._register(this.chatService.onDidDisposeSession((e) => {
      for (const sessionResource of e.sessionResource) {
        const uris = this._sessionAssociations.get(sessionResource);
        if (uris) {
          for (const uri of uris) {
            this._associated.delete(uri);
          }
          this._sessionAssociations.delete(sessionResource);
        }
      }
    }));
  }
  associate(sessionResource, data, name) {
    const id = generateUuid();
    const uri = URI.from({
      scheme: ChatResponseResource.scheme,
      path: `/assoc/${id}` + (name ? `/${name}` : "")
    });
    this._associated.set(uri, data);
    let set = this._sessionAssociations.get(sessionResource);
    if (!set) {
      set = new ResourceSet();
      this._sessionAssociations.set(sessionResource, set);
    }
    set.add(uri);
    return uri;
  }
  readFile(resource) {
    return Promise.resolve(this.lookupURI(resource));
  }
  readFileStream(resource) {
    const stream = newWriteableStream((data) => VSBuffer.concat(data.map((data2) => VSBuffer.wrap(data2))).buffer);
    Promise.resolve(this.lookupURI(resource)).then((v) => stream.end(v));
    return stream;
  }
  async stat(resource) {
    const r = await this.lookupURI(resource);
    return {
      type: FileType.File,
      ctime: 0,
      mtime: 0,
      size: r.length
    };
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
  findMatchingInvocation(uri) {
    const parsed = ChatResponseResource.parseUri(uri);
    if (!parsed) {
      throw createFileSystemProviderError(`File not found`, FileSystemProviderErrorCode.FileNotFound);
    }
    const { sessionResource, toolCallId, index } = parsed;
    const session = this.chatService.getSession(sessionResource);
    if (!session) {
      throw createFileSystemProviderError(`File not found`, FileSystemProviderErrorCode.FileNotFound);
    }
    const requests = session.getRequests();
    for (let k = requests.length - 1; k >= 0; k--) {
      const req = requests[k];
      const tc = req.response?.entireResponse.value.find((r) => (r.kind === "toolInvocation" || r.kind === "toolInvocationSerialized") && r.toolCallId === toolCallId);
      if (tc) {
        return { result: tc, index };
      }
    }
    throw createFileSystemProviderError(`File not found`, FileSystemProviderErrorCode.FileNotFound);
  }
  lookupURI(uri) {
    const associated = this._associated.get(uri);
    if (associated) {
      if (associated instanceof Uint8Array) {
        return associated;
      }
      const decoded = decodeBase64(associated.base64).buffer;
      this._associated.set(uri, decoded);
      return decoded;
    }
    const { result, index } = this.findMatchingInvocation(uri);
    const details = IChatToolInvocation.resultDetails(result);
    if (!isToolResultInputOutputDetails(details)) {
      throw createFileSystemProviderError(`Tool does not have I/O`, FileSystemProviderErrorCode.FileNotFound);
    }
    const part = details.output.at(index);
    if (!part) {
      throw createFileSystemProviderError(`Tool does not have part`, FileSystemProviderErrorCode.FileNotFound);
    }
    if (part.type === "ref") {
      return this._fileService.readFile(part.uri).then((r) => r.value.buffer);
    }
    return part.isText ? new TextEncoder().encode(part.value) : decodeBase64(part.value).buffer;
  }
};
ChatResponseResourceFileSystemProvider = __decorate([
  __param(0, IChatService),
  __param(1, IFileService)
], ChatResponseResourceFileSystemProvider);
let ChatResponseResourceWorkbenchContribution = class ChatResponseResourceWorkbenchContribution2 extends Disposable {
  static {
    __name(this, "ChatResponseResourceWorkbenchContribution");
  }
  static {
    this.ID = "chatResponseResourceWorkbenchContribution";
  }
  constructor(chatResponseResourceFsProvider, fileService) {
    super();
    this._register(fileService.registerProvider(ChatResponseResource.scheme, chatResponseResourceFsProvider));
  }
};
ChatResponseResourceWorkbenchContribution = __decorate([
  __param(0, IChatResponseResourceFileSystemProvider),
  __param(1, IFileService)
], ChatResponseResourceWorkbenchContribution);
export {
  ChatResponseResourceFileSystemProvider,
  ChatResponseResourceWorkbenchContribution,
  IChatResponseResourceFileSystemProvider
};
//# sourceMappingURL=chatResponseResourceFileSystemProvider.js.map
