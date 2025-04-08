var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { FileSystemProviderCapabilities, IStat, FileType, IFileDeleteOptions, IFileOverwriteOptions, IFileWriteOptions, FileSystemProviderErrorCode, IFileSystemProviderWithFileReadWriteCapability, createFileSystemProviderError } from "../../../../platform/files/common/files.js";
import { Event } from "../../../../base/common/event.js";
import { IDisposable, Disposable } from "../../../../base/common/lifecycle.js";
import { URI } from "../../../../base/common/uri.js";
import { NotSupportedError } from "../../../../base/common/errors.js";
class FetchFileSystemProvider {
  static {
    __name(this, "FetchFileSystemProvider");
  }
  capabilities = FileSystemProviderCapabilities.Readonly + FileSystemProviderCapabilities.FileReadWrite + FileSystemProviderCapabilities.PathCaseSensitive;
  onDidChangeCapabilities = Event.None;
  onDidChangeFile = Event.None;
  // working implementations
  async readFile(resource) {
    try {
      const res = await fetch(resource.toString(true));
      if (res.status === 200) {
        return new Uint8Array(await res.arrayBuffer());
      }
      throw createFileSystemProviderError(res.statusText, FileSystemProviderErrorCode.Unknown);
    } catch (err) {
      throw createFileSystemProviderError(err, FileSystemProviderErrorCode.Unknown);
    }
  }
  // fake implementations
  async stat(_resource) {
    return {
      type: FileType.File,
      size: 0,
      mtime: 0,
      ctime: 0
    };
  }
  watch() {
    return Disposable.None;
  }
  // error implementations
  writeFile(_resource, _content, _opts) {
    throw new NotSupportedError();
  }
  readdir(_resource) {
    throw new NotSupportedError();
  }
  mkdir(_resource) {
    throw new NotSupportedError();
  }
  delete(_resource, _opts) {
    throw new NotSupportedError();
  }
  rename(_from, _to, _opts) {
    throw new NotSupportedError();
  }
}
export {
  FetchFileSystemProvider
};
//# sourceMappingURL=webWorkerFileSystemProvider.js.map
