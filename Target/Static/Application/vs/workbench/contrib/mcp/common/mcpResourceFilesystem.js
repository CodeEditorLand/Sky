var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { sumBy } from "../../../../base/common/arrays.js";
import { decodeBase64, VSBuffer } from "../../../../base/common/buffer.js";
import { CancellationTokenSource } from "../../../../base/common/cancellation.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { Lazy } from "../../../../base/common/lazy.js";
import { Disposable, DisposableStore, MutableDisposable } from "../../../../base/common/lifecycle.js";
import { autorun } from "../../../../base/common/observable.js";
import { newWriteableStream } from "../../../../base/common/stream.js";
import { equalsIgnoreCase } from "../../../../base/common/strings.js";
import { URI } from "../../../../base/common/uri.js";
import { createFileSystemProviderError, FileSystemProviderErrorCode, FileType, IFileService } from "../../../../platform/files/common/files.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { McpServer } from "./mcpServer.js";
import { IMcpService, McpResourceURI } from "./mcpTypes.js";
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
let McpResourceFilesystem = class McpResourceFilesystem2 extends Disposable {
  static {
    __name(this, "McpResourceFilesystem");
  }
  get _mcpService() {
    return this._mcpServiceLazy.value;
  }
  constructor(_instantiationService, _fileService) {
    super();
    this._instantiationService = _instantiationService;
    this._fileService = _fileService;
    this._mcpServiceLazy = new Lazy(() => this._instantiationService.invokeFunction((a) => a.get(IMcpService)));
    this.onDidChangeCapabilities = Event.None;
    this._onDidChangeFile = this._register(new Emitter());
    this.onDidChangeFile = this._onDidChangeFile.event;
    this.capabilities = 0 | 2048 | 1024 | 16 | 16384 | 2;
    this._register(this._fileService.registerProvider(McpResourceURI.scheme, this));
  }
  //#region Filesystem API
  async readFile(resource) {
    return this._readFile(resource);
  }
  readFileStream(resource, opts, token) {
    const stream = newWriteableStream((data) => VSBuffer.concat(data.map((data2) => VSBuffer.wrap(data2))).buffer);
    this._readFile(resource, token).then((data) => {
      if (opts.position) {
        data = data.slice(opts.position);
      }
      if (opts.length) {
        data = data.slice(0, opts.length);
      }
      stream.end(data);
    }, (err) => stream.error(err));
    return stream;
  }
  watch(uri, _opts) {
    const { resourceURI, server } = this._decodeURI(uri);
    const cap = server.capabilities.get();
    if (cap !== void 0 && !(cap & 32)) {
      return Disposable.None;
    }
    server.start();
    const store = new DisposableStore();
    let watchedOnHandler;
    const watchListener = store.add(new MutableDisposable());
    const callCts = store.add(new MutableDisposable());
    store.add(autorun((reader) => {
      const connection = server.connection.read(reader);
      if (!connection) {
        return;
      }
      const handler = connection.handler.read(reader);
      if (!handler || watchedOnHandler === handler) {
        return;
      }
      callCts.value?.dispose(true);
      callCts.value = new CancellationTokenSource();
      watchedOnHandler = handler;
      const token = callCts.value.token;
      handler.subscribe({ uri: resourceURI.toString(true) }, token).then(() => {
        if (!token.isCancellationRequested) {
          watchListener.value = handler.onDidUpdateResource((e) => {
            if (equalsUriPath(e.params.uri, resourceURI)) {
              this._onDidChangeFile.fire([{
                resource: uri,
                type: 0
                /* FileChangeType.UPDATED */
              }]);
            }
          });
        }
      }, (err) => {
        handler.logger.warn(`Failed to subscribe to resource changes for ${resourceURI}: ${err}`);
        watchedOnHandler = void 0;
      });
    }));
    return store;
  }
  async stat(resource) {
    const { forSameURI, contents } = await this._readURI(resource);
    if (!contents.length) {
      throw createFileSystemProviderError(`File not found`, FileSystemProviderErrorCode.FileNotFound);
    }
    return {
      ctime: 0,
      mtime: 0,
      size: sumBy(contents, (c) => contentToBuffer(c).byteLength),
      type: forSameURI.length ? FileType.File : FileType.Directory
    };
  }
  async readdir(resource) {
    const { forSameURI, contents, resourceURI } = await this._readURI(resource);
    if (forSameURI.length > 0) {
      throw createFileSystemProviderError(`File is not a directory`, FileSystemProviderErrorCode.FileNotADirectory);
    }
    const resourcePathParts = resourceURI.path.split("/");
    const output = /* @__PURE__ */ new Map();
    for (const content of contents) {
      const contentURI = URI.parse(content.uri);
      const contentPathParts = contentURI.path.split("/");
      if (contentPathParts.length <= resourcePathParts.length || !resourcePathParts.every((part, index) => equalsIgnoreCase(part, contentPathParts[index]))) {
        continue;
      } else if (contentPathParts.length > resourcePathParts.length + 1) {
        output.set(contentPathParts[resourcePathParts.length], FileType.Directory);
      } else {
        const name = contentPathParts[contentPathParts.length - 1];
        output.set(name, contentToBuffer(content).byteLength > 0 ? FileType.File : FileType.Directory);
      }
    }
    return [...output];
  }
  mkdir(resource) {
    throw createFileSystemProviderError("write is not supported", FileSystemProviderErrorCode.NoPermissions);
  }
  writeFile(resource, content, opts) {
    throw createFileSystemProviderError("write is not supported", FileSystemProviderErrorCode.NoPermissions);
  }
  delete(resource, opts) {
    throw createFileSystemProviderError("delete is not supported", FileSystemProviderErrorCode.NoPermissions);
  }
  rename(from, to, opts) {
    throw createFileSystemProviderError("rename is not supported", FileSystemProviderErrorCode.NoPermissions);
  }
  //#endregion
  async _readFile(resource, token) {
    const { forSameURI, contents } = await this._readURI(resource);
    if (!forSameURI.length) {
      if (!contents.length) {
        throw createFileSystemProviderError(`File not found`, FileSystemProviderErrorCode.FileNotFound);
      } else {
        throw createFileSystemProviderError(`File is a directory`, FileSystemProviderErrorCode.FileIsADirectory);
      }
    }
    return contentToBuffer(forSameURI[0]);
  }
  _decodeURI(uri) {
    let definitionId;
    let resourceURI;
    try {
      ({ definitionId, resourceURI } = McpResourceURI.toServer(uri));
    } catch (e) {
      throw createFileSystemProviderError(String(e), FileSystemProviderErrorCode.FileNotFound);
    }
    if (resourceURI.path.endsWith("/")) {
      resourceURI = resourceURI.with({ path: resourceURI.path.slice(0, -1) });
    }
    const server = this._mcpService.servers.get().find((s) => s.definition.id === definitionId);
    if (!server) {
      throw createFileSystemProviderError(`MCP server ${definitionId} not found`, FileSystemProviderErrorCode.FileNotFound);
    }
    const cap = server.capabilities.get();
    if (cap !== void 0 && !(cap & 16)) {
      throw createFileSystemProviderError(`MCP server ${definitionId} does not support resources`, FileSystemProviderErrorCode.FileNotFound);
    }
    return { definitionId, resourceURI, server };
  }
  async _readURI(uri, token) {
    const { resourceURI, server } = this._decodeURI(uri);
    const res = await McpServer.callOn(server, (r) => r.readResource({ uri: resourceURI.toString(true) }, token), token);
    return {
      contents: res.contents,
      resourceURI,
      forSameURI: res.contents.filter((c) => equalsUriPath(c.uri, resourceURI))
    };
  }
};
McpResourceFilesystem = __decorate([
  __param(0, IInstantiationService),
  __param(1, IFileService)
], McpResourceFilesystem);
function equalsUriPath(a, b) {
  return equalsIgnoreCase(URI.parse(a).path, b.path);
}
__name(equalsUriPath, "equalsUriPath");
function contentToBuffer(content) {
  if ("text" in content) {
    return VSBuffer.fromString(content.text).buffer;
  } else if ("blob" in content) {
    return decodeBase64(content.blob).buffer;
  } else {
    throw createFileSystemProviderError("Unknown content type", FileSystemProviderErrorCode.Unknown);
  }
}
__name(contentToBuffer, "contentToBuffer");
export {
  McpResourceFilesystem
};
//# sourceMappingURL=mcpResourceFilesystem.js.map
