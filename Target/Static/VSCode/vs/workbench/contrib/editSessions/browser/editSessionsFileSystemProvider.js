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
import { Disposable, IDisposable } from "../../../../base/common/lifecycle.js";
import { Event } from "../../../../base/common/event.js";
import { URI } from "../../../../base/common/uri.js";
import { FilePermission, FileSystemProviderCapabilities, FileSystemProviderErrorCode, FileType, IFileDeleteOptions, IFileOverwriteOptions, IFileSystemProviderWithFileReadWriteCapability, IStat, IWatchOptions } from "../../../../platform/files/common/files.js";
import { ChangeType, decodeEditSessionFileContent, EDIT_SESSIONS_SCHEME, EditSession, IEditSessionsStorageService } from "../common/editSessions.js";
import { NotSupportedError } from "../../../../base/common/errors.js";
let EditSessionsFileSystemProvider = class {
  constructor(editSessionsStorageService) {
    this.editSessionsStorageService = editSessionsStorageService;
  }
  static {
    __name(this, "EditSessionsFileSystemProvider");
  }
  static SCHEMA = EDIT_SESSIONS_SCHEME;
  capabilities = FileSystemProviderCapabilities.Readonly + FileSystemProviderCapabilities.FileReadWrite;
  async readFile(resource) {
    const match = /(?<ref>[^/]+)\/(?<folderName>[^/]+)\/(?<filePath>.*)/.exec(resource.path.substring(1));
    if (!match?.groups) {
      throw FileSystemProviderErrorCode.FileNotFound;
    }
    const { ref, folderName, filePath } = match.groups;
    const data = await this.editSessionsStorageService.read("editSessions", ref);
    if (!data) {
      throw FileSystemProviderErrorCode.FileNotFound;
    }
    const content = JSON.parse(data.content);
    const change = content.folders.find((f) => f.name === folderName)?.workingChanges.find((change2) => change2.relativeFilePath === filePath);
    if (!change || change.type === ChangeType.Deletion) {
      throw FileSystemProviderErrorCode.FileNotFound;
    }
    return decodeEditSessionFileContent(content.version, change.contents).buffer;
  }
  async stat(resource) {
    const content = await this.readFile(resource);
    const currentTime = Date.now();
    return {
      type: FileType.File,
      permissions: FilePermission.Readonly,
      mtime: currentTime,
      ctime: currentTime,
      size: content.byteLength
    };
  }
  //#region Unsupported file operations
  onDidChangeCapabilities = Event.None;
  onDidChangeFile = Event.None;
  watch(resource, opts) {
    return Disposable.None;
  }
  async mkdir(resource) {
  }
  async readdir(resource) {
    return [];
  }
  async rename(from, to, opts) {
  }
  async delete(resource, opts) {
  }
  async writeFile() {
    throw new NotSupportedError();
  }
  //#endregion
};
EditSessionsFileSystemProvider = __decorateClass([
  __decorateParam(0, IEditSessionsStorageService)
], EditSessionsFileSystemProvider);
export {
  EditSessionsFileSystemProvider
};
//# sourceMappingURL=editSessionsFileSystemProvider.js.map
