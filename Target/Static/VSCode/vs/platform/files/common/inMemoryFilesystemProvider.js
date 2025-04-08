var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { VSBuffer } from "../../../base/common/buffer.js";
import { Emitter, Event } from "../../../base/common/event.js";
import { Disposable, IDisposable } from "../../../base/common/lifecycle.js";
import * as resources from "../../../base/common/resources.js";
import { ReadableStreamEvents, newWriteableStream } from "../../../base/common/stream.js";
import { URI } from "../../../base/common/uri.js";
import { FileChangeType, IFileDeleteOptions, IFileOverwriteOptions, FileSystemProviderCapabilities, FileSystemProviderErrorCode, FileType, IFileWriteOptions, IFileChange, IFileSystemProviderWithFileReadWriteCapability, IStat, IWatchOptions, createFileSystemProviderError, IFileSystemProviderWithOpenReadWriteCloseCapability, IFileOpenOptions, IFileSystemProviderWithFileAtomicDeleteCapability, IFileSystemProviderWithFileAtomicReadCapability, IFileSystemProviderWithFileAtomicWriteCapability, IFileSystemProviderWithFileReadStreamCapability } from "./files.js";
class File {
  static {
    __name(this, "File");
  }
  type;
  ctime;
  mtime;
  size;
  name;
  data;
  constructor(name) {
    this.type = FileType.File;
    this.ctime = Date.now();
    this.mtime = Date.now();
    this.size = 0;
    this.name = name;
  }
}
class Directory {
  static {
    __name(this, "Directory");
  }
  type;
  ctime;
  mtime;
  size;
  name;
  entries;
  constructor(name) {
    this.type = FileType.Directory;
    this.ctime = Date.now();
    this.mtime = Date.now();
    this.size = 0;
    this.name = name;
    this.entries = /* @__PURE__ */ new Map();
  }
}
class InMemoryFileSystemProvider extends Disposable {
  static {
    __name(this, "InMemoryFileSystemProvider");
  }
  memoryFdCounter = 0;
  fdMemory = /* @__PURE__ */ new Map();
  _onDidChangeCapabilities = this._register(new Emitter());
  onDidChangeCapabilities = this._onDidChangeCapabilities.event;
  _capabilities = FileSystemProviderCapabilities.FileReadWrite | FileSystemProviderCapabilities.PathCaseSensitive;
  get capabilities() {
    return this._capabilities;
  }
  setReadOnly(readonly) {
    const isReadonly = !!(this._capabilities & FileSystemProviderCapabilities.Readonly);
    if (readonly !== isReadonly) {
      this._capabilities = readonly ? FileSystemProviderCapabilities.Readonly | FileSystemProviderCapabilities.PathCaseSensitive | FileSystemProviderCapabilities.FileReadWrite : FileSystemProviderCapabilities.FileReadWrite | FileSystemProviderCapabilities.PathCaseSensitive;
      this._onDidChangeCapabilities.fire();
    }
  }
  root = new Directory("");
  // --- manage file metadata
  async stat(resource) {
    return this._lookup(resource, false);
  }
  async readdir(resource) {
    const entry = this._lookupAsDirectory(resource, false);
    const result = [];
    entry.entries.forEach((child, name) => result.push([name, child.type]));
    return result;
  }
  // --- manage file contents
  async readFile(resource) {
    const data = this._lookupAsFile(resource, false).data;
    if (data) {
      return data;
    }
    throw createFileSystemProviderError("file not found", FileSystemProviderErrorCode.FileNotFound);
  }
  readFileStream(resource) {
    const data = this._lookupAsFile(resource, false).data;
    const stream = newWriteableStream((data2) => VSBuffer.concat(data2.map((data3) => VSBuffer.wrap(data3))).buffer);
    stream.end(data);
    return stream;
  }
  async writeFile(resource, content, opts) {
    const basename = resources.basename(resource);
    const parent = this._lookupParentDirectory(resource);
    let entry = parent.entries.get(basename);
    if (entry instanceof Directory) {
      throw createFileSystemProviderError("file is directory", FileSystemProviderErrorCode.FileIsADirectory);
    }
    if (!entry && !opts.create) {
      throw createFileSystemProviderError("file not found", FileSystemProviderErrorCode.FileNotFound);
    }
    if (entry && opts.create && !opts.overwrite) {
      throw createFileSystemProviderError("file exists already", FileSystemProviderErrorCode.FileExists);
    }
    if (!entry) {
      entry = new File(basename);
      parent.entries.set(basename, entry);
      this._fireSoon({ type: FileChangeType.ADDED, resource });
    }
    entry.mtime = Date.now();
    entry.size = content.byteLength;
    entry.data = content;
    this._fireSoon({ type: FileChangeType.UPDATED, resource });
  }
  // file open/read/write/close
  open(resource, opts) {
    const data = this._lookupAsFile(resource, false).data;
    if (data) {
      const fd = this.memoryFdCounter++;
      this.fdMemory.set(fd, data);
      return Promise.resolve(fd);
    }
    throw createFileSystemProviderError("file not found", FileSystemProviderErrorCode.FileNotFound);
  }
  close(fd) {
    this.fdMemory.delete(fd);
    return Promise.resolve();
  }
  read(fd, pos, data, offset, length) {
    const memory = this.fdMemory.get(fd);
    if (!memory) {
      throw createFileSystemProviderError(`No file with that descriptor open`, FileSystemProviderErrorCode.Unavailable);
    }
    const toWrite = VSBuffer.wrap(memory).slice(pos, pos + length);
    data.set(toWrite.buffer, offset);
    return Promise.resolve(toWrite.byteLength);
  }
  write(fd, pos, data, offset, length) {
    const memory = this.fdMemory.get(fd);
    if (!memory) {
      throw createFileSystemProviderError(`No file with that descriptor open`, FileSystemProviderErrorCode.Unavailable);
    }
    const toWrite = VSBuffer.wrap(data).slice(offset, offset + length);
    memory.set(toWrite.buffer, pos);
    return Promise.resolve(toWrite.byteLength);
  }
  // --- manage files/folders
  async rename(from, to, opts) {
    if (!opts.overwrite && this._lookup(to, true)) {
      throw createFileSystemProviderError("file exists already", FileSystemProviderErrorCode.FileExists);
    }
    const entry = this._lookup(from, false);
    const oldParent = this._lookupParentDirectory(from);
    const newParent = this._lookupParentDirectory(to);
    const newName = resources.basename(to);
    oldParent.entries.delete(entry.name);
    entry.name = newName;
    newParent.entries.set(newName, entry);
    this._fireSoon(
      { type: FileChangeType.DELETED, resource: from },
      { type: FileChangeType.ADDED, resource: to }
    );
  }
  async delete(resource, opts) {
    const dirname = resources.dirname(resource);
    const basename = resources.basename(resource);
    const parent = this._lookupAsDirectory(dirname, false);
    if (parent.entries.has(basename)) {
      parent.entries.delete(basename);
      parent.mtime = Date.now();
      parent.size -= 1;
      this._fireSoon({ type: FileChangeType.UPDATED, resource: dirname }, { resource, type: FileChangeType.DELETED });
    }
  }
  async mkdir(resource) {
    if (this._lookup(resource, true)) {
      throw createFileSystemProviderError("file exists already", FileSystemProviderErrorCode.FileExists);
    }
    const basename = resources.basename(resource);
    const dirname = resources.dirname(resource);
    const parent = this._lookupAsDirectory(dirname, false);
    const entry = new Directory(basename);
    parent.entries.set(entry.name, entry);
    parent.mtime = Date.now();
    parent.size += 1;
    this._fireSoon({ type: FileChangeType.UPDATED, resource: dirname }, { type: FileChangeType.ADDED, resource });
  }
  _lookup(uri, silent) {
    const parts = uri.path.split("/");
    let entry = this.root;
    for (const part of parts) {
      if (!part) {
        continue;
      }
      let child;
      if (entry instanceof Directory) {
        child = entry.entries.get(part);
      }
      if (!child) {
        if (!silent) {
          throw createFileSystemProviderError("file not found", FileSystemProviderErrorCode.FileNotFound);
        } else {
          return void 0;
        }
      }
      entry = child;
    }
    return entry;
  }
  _lookupAsDirectory(uri, silent) {
    const entry = this._lookup(uri, silent);
    if (entry instanceof Directory) {
      return entry;
    }
    throw createFileSystemProviderError("file not a directory", FileSystemProviderErrorCode.FileNotADirectory);
  }
  _lookupAsFile(uri, silent) {
    const entry = this._lookup(uri, silent);
    if (entry instanceof File) {
      return entry;
    }
    throw createFileSystemProviderError("file is a directory", FileSystemProviderErrorCode.FileIsADirectory);
  }
  _lookupParentDirectory(uri) {
    const dirname = resources.dirname(uri);
    return this._lookupAsDirectory(dirname, false);
  }
  // --- manage file events
  _onDidChangeFile = this._register(new Emitter());
  onDidChangeFile = this._onDidChangeFile.event;
  _bufferedChanges = [];
  _fireSoonHandle;
  watch(resource, opts) {
    return Disposable.None;
  }
  _fireSoon(...changes) {
    this._bufferedChanges.push(...changes);
    if (this._fireSoonHandle) {
      clearTimeout(this._fireSoonHandle);
    }
    this._fireSoonHandle = setTimeout(() => {
      this._onDidChangeFile.fire(this._bufferedChanges);
      this._bufferedChanges.length = 0;
    }, 5);
  }
  dispose() {
    super.dispose();
    this.fdMemory.clear();
  }
}
export {
  InMemoryFileSystemProvider
};
//# sourceMappingURL=inMemoryFilesystemProvider.js.map
