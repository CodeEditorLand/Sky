var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { VSBuffer } from "../../../../../../base/common/buffer.js";
import { Event } from "../../../../../../base/common/event.js";
import { Disposable } from "../../../../../../base/common/lifecycle.js";
import { createFileSystemProviderError, FileSystemProviderErrorCode, FileType } from "../../../../../../platform/files/common/files.js";
const CHAT_INTERNAL_SCHEME = "vscode-chat-internal";
class ChatInternalFileSystemProvider extends Disposable {
  static {
    __name(this, "ChatInternalFileSystemProvider");
  }
  constructor() {
    super(...arguments);
    this.files = /* @__PURE__ */ new Map();
    this.onDidChangeCapabilities = Event.None;
    this.onDidChangeFile = Event.None;
    this.capabilities = 2 | 2048 | 1024;
  }
  /**
   * Register a file with static content. Must be called before the
   * file can be read. Typically called once at startup.
   */
  registerFile(uri, content) {
    this.files.set(uri.toString(), VSBuffer.fromString(content).buffer);
  }
  // --- IFileSystemProvider ---
  watch() {
    return Disposable.None;
  }
  async stat(resource) {
    const data = this.files.get(resource.toString());
    if (data) {
      return {
        type: FileType.File,
        ctime: 0,
        mtime: 0,
        size: data.byteLength
      };
    }
    const prefix = resource.toString() + "/";
    for (const key of this.files.keys()) {
      if (key.startsWith(prefix)) {
        return { type: FileType.Directory, ctime: 0, mtime: 0, size: 0 };
      }
    }
    throw createFileSystemProviderError("file not found", FileSystemProviderErrorCode.FileNotFound);
  }
  async mkdir() {
    throw createFileSystemProviderError("readonly filesystem", FileSystemProviderErrorCode.NoPermissions);
  }
  async readdir(resource) {
    const prefix = resource.toString() + "/";
    const entries = /* @__PURE__ */ new Map();
    for (const key of this.files.keys()) {
      if (key.startsWith(prefix)) {
        const rest = key.substring(prefix.length);
        const slash = rest.indexOf("/");
        if (slash === -1) {
          entries.set(rest, FileType.File);
        } else {
          entries.set(rest.substring(0, slash), FileType.Directory);
        }
      }
    }
    return [...entries.entries()];
  }
  async delete(_resource, _opts) {
    throw createFileSystemProviderError("readonly filesystem", FileSystemProviderErrorCode.NoPermissions);
  }
  async rename(_from, _to, _opts) {
    throw createFileSystemProviderError("readonly filesystem", FileSystemProviderErrorCode.NoPermissions);
  }
  async readFile(resource) {
    const data = this.files.get(resource.toString());
    if (data) {
      return data;
    }
    throw createFileSystemProviderError("file not found", FileSystemProviderErrorCode.FileNotFound);
  }
  async writeFile(_resource, _content, _opts) {
    throw createFileSystemProviderError("readonly filesystem", FileSystemProviderErrorCode.NoPermissions);
  }
}
function registerChatInternalFileSystem(fileService) {
  const provider = new ChatInternalFileSystemProvider();
  const registration = fileService.registerProvider(CHAT_INTERNAL_SCHEME, provider);
  return {
    provider,
    disposable: {
      dispose() {
        registration.dispose();
        provider.dispose();
      }
    }
  };
}
__name(registerChatInternalFileSystem, "registerChatInternalFileSystem");
export {
  CHAT_INTERNAL_SCHEME,
  ChatInternalFileSystemProvider,
  registerChatInternalFileSystem
};
//# sourceMappingURL=internalPromptFileSystem.js.map
