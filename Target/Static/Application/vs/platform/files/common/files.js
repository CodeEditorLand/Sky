var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { TernarySearchTree } from "../../../base/common/ternarySearchTree.js";
import { sep } from "../../../base/common/path.js";
import { startsWithIgnoreCase } from "../../../base/common/strings.js";
import { isNumber } from "../../../base/common/types.js";
import { URI } from "../../../base/common/uri.js";
import { localize } from "../../../nls.js";
import { createDecorator } from "../../instantiation/common/instantiation.js";
import { isWeb } from "../../../base/common/platform.js";
import { Schemas } from "../../../base/common/network.js";
import { Lazy } from "../../../base/common/lazy.js";
const IFileService = createDecorator("fileService");
function isFileOpenForWriteOptions(options) {
  return options.create === true;
}
__name(isFileOpenForWriteOptions, "isFileOpenForWriteOptions");
var FileType;
(function(FileType2) {
  FileType2[FileType2["Unknown"] = 0] = "Unknown";
  FileType2[FileType2["File"] = 1] = "File";
  FileType2[FileType2["Directory"] = 2] = "Directory";
  FileType2[FileType2["SymbolicLink"] = 64] = "SymbolicLink";
})(FileType || (FileType = {}));
var FilePermission;
(function(FilePermission2) {
  FilePermission2[FilePermission2["Readonly"] = 1] = "Readonly";
  FilePermission2[FilePermission2["Locked"] = 2] = "Locked";
})(FilePermission || (FilePermission = {}));
var FileChangeFilter;
(function(FileChangeFilter2) {
  FileChangeFilter2[FileChangeFilter2["UPDATED"] = 2] = "UPDATED";
  FileChangeFilter2[FileChangeFilter2["ADDED"] = 4] = "ADDED";
  FileChangeFilter2[FileChangeFilter2["DELETED"] = 8] = "DELETED";
})(FileChangeFilter || (FileChangeFilter = {}));
function isFileSystemWatcher(thing) {
  const candidate = thing;
  return !!candidate && typeof candidate.onDidChange === "function";
}
__name(isFileSystemWatcher, "isFileSystemWatcher");
var FileSystemProviderCapabilities;
(function(FileSystemProviderCapabilities2) {
  FileSystemProviderCapabilities2[FileSystemProviderCapabilities2["None"] = 0] = "None";
  FileSystemProviderCapabilities2[FileSystemProviderCapabilities2["FileReadWrite"] = 2] = "FileReadWrite";
  FileSystemProviderCapabilities2[FileSystemProviderCapabilities2["FileOpenReadWriteClose"] = 4] = "FileOpenReadWriteClose";
  FileSystemProviderCapabilities2[FileSystemProviderCapabilities2["FileReadStream"] = 16] = "FileReadStream";
  FileSystemProviderCapabilities2[FileSystemProviderCapabilities2["FileFolderCopy"] = 8] = "FileFolderCopy";
  FileSystemProviderCapabilities2[FileSystemProviderCapabilities2["PathCaseSensitive"] = 1024] = "PathCaseSensitive";
  FileSystemProviderCapabilities2[FileSystemProviderCapabilities2["Readonly"] = 2048] = "Readonly";
  FileSystemProviderCapabilities2[FileSystemProviderCapabilities2["Trash"] = 4096] = "Trash";
  FileSystemProviderCapabilities2[FileSystemProviderCapabilities2["FileWriteUnlock"] = 8192] = "FileWriteUnlock";
  FileSystemProviderCapabilities2[FileSystemProviderCapabilities2["FileAtomicRead"] = 16384] = "FileAtomicRead";
  FileSystemProviderCapabilities2[FileSystemProviderCapabilities2["FileAtomicWrite"] = 32768] = "FileAtomicWrite";
  FileSystemProviderCapabilities2[FileSystemProviderCapabilities2["FileAtomicDelete"] = 65536] = "FileAtomicDelete";
  FileSystemProviderCapabilities2[FileSystemProviderCapabilities2["FileClone"] = 131072] = "FileClone";
  FileSystemProviderCapabilities2[FileSystemProviderCapabilities2["FileRealpath"] = 262144] = "FileRealpath";
})(FileSystemProviderCapabilities || (FileSystemProviderCapabilities = {}));
function hasReadWriteCapability(provider) {
  return !!(provider.capabilities & 2);
}
__name(hasReadWriteCapability, "hasReadWriteCapability");
function hasFileFolderCopyCapability(provider) {
  return !!(provider.capabilities & 8);
}
__name(hasFileFolderCopyCapability, "hasFileFolderCopyCapability");
function hasFileCloneCapability(provider) {
  return !!(provider.capabilities & 131072);
}
__name(hasFileCloneCapability, "hasFileCloneCapability");
function hasFileRealpathCapability(provider) {
  return !!(provider.capabilities & 262144);
}
__name(hasFileRealpathCapability, "hasFileRealpathCapability");
function hasOpenReadWriteCloseCapability(provider) {
  return !!(provider.capabilities & 4);
}
__name(hasOpenReadWriteCloseCapability, "hasOpenReadWriteCloseCapability");
function hasFileReadStreamCapability(provider) {
  return !!(provider.capabilities & 16);
}
__name(hasFileReadStreamCapability, "hasFileReadStreamCapability");
function hasFileAtomicReadCapability(provider) {
  if (!hasReadWriteCapability(provider)) {
    return false;
  }
  return !!(provider.capabilities & 16384);
}
__name(hasFileAtomicReadCapability, "hasFileAtomicReadCapability");
function hasFileAtomicWriteCapability(provider) {
  if (!hasReadWriteCapability(provider)) {
    return false;
  }
  return !!(provider.capabilities & 32768);
}
__name(hasFileAtomicWriteCapability, "hasFileAtomicWriteCapability");
function hasFileAtomicDeleteCapability(provider) {
  return !!(provider.capabilities & 65536);
}
__name(hasFileAtomicDeleteCapability, "hasFileAtomicDeleteCapability");
function hasReadonlyCapability(provider) {
  return !!(provider.capabilities & 2048);
}
__name(hasReadonlyCapability, "hasReadonlyCapability");
var FileSystemProviderErrorCode;
(function(FileSystemProviderErrorCode2) {
  FileSystemProviderErrorCode2["FileExists"] = "EntryExists";
  FileSystemProviderErrorCode2["FileNotFound"] = "EntryNotFound";
  FileSystemProviderErrorCode2["FileNotADirectory"] = "EntryNotADirectory";
  FileSystemProviderErrorCode2["FileIsADirectory"] = "EntryIsADirectory";
  FileSystemProviderErrorCode2["FileExceedsStorageQuota"] = "EntryExceedsStorageQuota";
  FileSystemProviderErrorCode2["FileTooLarge"] = "EntryTooLarge";
  FileSystemProviderErrorCode2["FileWriteLocked"] = "EntryWriteLocked";
  FileSystemProviderErrorCode2["NoPermissions"] = "NoPermissions";
  FileSystemProviderErrorCode2["Unavailable"] = "Unavailable";
  FileSystemProviderErrorCode2["Unknown"] = "Unknown";
})(FileSystemProviderErrorCode || (FileSystemProviderErrorCode = {}));
class FileSystemProviderError extends Error {
  static {
    __name(this, "FileSystemProviderError");
  }
  static create(error, code) {
    const providerError = new FileSystemProviderError(error.toString(), code);
    markAsFileSystemProviderError(providerError, code);
    return providerError;
  }
  constructor(message, code) {
    super(message);
    this.code = code;
  }
}
function createFileSystemProviderError(error, code) {
  return FileSystemProviderError.create(error, code);
}
__name(createFileSystemProviderError, "createFileSystemProviderError");
function ensureFileSystemProviderError(error) {
  if (!error) {
    return createFileSystemProviderError(localize("unknownError", "Unknown Error"), FileSystemProviderErrorCode.Unknown);
  }
  return error;
}
__name(ensureFileSystemProviderError, "ensureFileSystemProviderError");
function markAsFileSystemProviderError(error, code) {
  error.name = code ? `${code} (FileSystemError)` : `FileSystemError`;
  return error;
}
__name(markAsFileSystemProviderError, "markAsFileSystemProviderError");
function toFileSystemProviderErrorCode(error) {
  if (!error) {
    return FileSystemProviderErrorCode.Unknown;
  }
  if (error instanceof FileSystemProviderError) {
    return error.code;
  }
  const match = /^(.+) \(FileSystemError\)$/.exec(error.name);
  if (!match) {
    return FileSystemProviderErrorCode.Unknown;
  }
  switch (match[1]) {
    case FileSystemProviderErrorCode.FileExists:
      return FileSystemProviderErrorCode.FileExists;
    case FileSystemProviderErrorCode.FileIsADirectory:
      return FileSystemProviderErrorCode.FileIsADirectory;
    case FileSystemProviderErrorCode.FileNotADirectory:
      return FileSystemProviderErrorCode.FileNotADirectory;
    case FileSystemProviderErrorCode.FileNotFound:
      return FileSystemProviderErrorCode.FileNotFound;
    case FileSystemProviderErrorCode.FileTooLarge:
      return FileSystemProviderErrorCode.FileTooLarge;
    case FileSystemProviderErrorCode.FileWriteLocked:
      return FileSystemProviderErrorCode.FileWriteLocked;
    case FileSystemProviderErrorCode.NoPermissions:
      return FileSystemProviderErrorCode.NoPermissions;
    case FileSystemProviderErrorCode.Unavailable:
      return FileSystemProviderErrorCode.Unavailable;
  }
  return FileSystemProviderErrorCode.Unknown;
}
__name(toFileSystemProviderErrorCode, "toFileSystemProviderErrorCode");
function toFileOperationResult(error) {
  if (error instanceof FileOperationError) {
    return error.fileOperationResult;
  }
  switch (toFileSystemProviderErrorCode(error)) {
    case FileSystemProviderErrorCode.FileNotFound:
      return 1;
    case FileSystemProviderErrorCode.FileIsADirectory:
      return 0;
    case FileSystemProviderErrorCode.FileNotADirectory:
      return 9;
    case FileSystemProviderErrorCode.FileWriteLocked:
      return 5;
    case FileSystemProviderErrorCode.NoPermissions:
      return 6;
    case FileSystemProviderErrorCode.FileExists:
      return 4;
    case FileSystemProviderErrorCode.FileTooLarge:
      return 7;
    default:
      return 10;
  }
}
__name(toFileOperationResult, "toFileOperationResult");
var FileOperation;
(function(FileOperation2) {
  FileOperation2[FileOperation2["CREATE"] = 0] = "CREATE";
  FileOperation2[FileOperation2["DELETE"] = 1] = "DELETE";
  FileOperation2[FileOperation2["MOVE"] = 2] = "MOVE";
  FileOperation2[FileOperation2["COPY"] = 3] = "COPY";
  FileOperation2[FileOperation2["WRITE"] = 4] = "WRITE";
})(FileOperation || (FileOperation = {}));
class FileOperationEvent {
  static {
    __name(this, "FileOperationEvent");
  }
  constructor(resource, operation, target) {
    this.resource = resource;
    this.operation = operation;
    this.target = target;
  }
  isOperation(operation) {
    return this.operation === operation;
  }
}
var FileChangeType;
(function(FileChangeType2) {
  FileChangeType2[FileChangeType2["UPDATED"] = 0] = "UPDATED";
  FileChangeType2[FileChangeType2["ADDED"] = 1] = "ADDED";
  FileChangeType2[FileChangeType2["DELETED"] = 2] = "DELETED";
})(FileChangeType || (FileChangeType = {}));
class FileChangesEvent {
  static {
    __name(this, "FileChangesEvent");
  }
  static {
    this.MIXED_CORRELATION = null;
  }
  constructor(changes, ignorePathCasing) {
    this.ignorePathCasing = ignorePathCasing;
    this.correlationId = void 0;
    this.added = new Lazy(() => {
      const added = TernarySearchTree.forUris(() => this.ignorePathCasing);
      added.fill(this.rawAdded.map((resource) => [resource, true]));
      return added;
    });
    this.updated = new Lazy(() => {
      const updated = TernarySearchTree.forUris(() => this.ignorePathCasing);
      updated.fill(this.rawUpdated.map((resource) => [resource, true]));
      return updated;
    });
    this.deleted = new Lazy(() => {
      const deleted = TernarySearchTree.forUris(() => this.ignorePathCasing);
      deleted.fill(this.rawDeleted.map((resource) => [resource, true]));
      return deleted;
    });
    this.rawAdded = [];
    this.rawUpdated = [];
    this.rawDeleted = [];
    for (const change of changes) {
      switch (change.type) {
        case 1:
          this.rawAdded.push(change.resource);
          break;
        case 0:
          this.rawUpdated.push(change.resource);
          break;
        case 2:
          this.rawDeleted.push(change.resource);
          break;
      }
      if (this.correlationId !== FileChangesEvent.MIXED_CORRELATION) {
        if (typeof change.cId === "number") {
          if (this.correlationId === void 0) {
            this.correlationId = change.cId;
          } else if (this.correlationId !== change.cId) {
            this.correlationId = FileChangesEvent.MIXED_CORRELATION;
          }
        } else {
          if (this.correlationId !== void 0) {
            this.correlationId = FileChangesEvent.MIXED_CORRELATION;
          }
        }
      }
    }
  }
  /**
   * Find out if the file change events match the provided resource.
   *
   * Note: when passing `FileChangeType.DELETED`, we consider a match
   * also when the parent of the resource got deleted.
   */
  contains(resource, ...types) {
    return this.doContains(resource, { includeChildren: false }, ...types);
  }
  /**
   * Find out if the file change events either match the provided
   * resource, or contain a child of this resource.
   */
  affects(resource, ...types) {
    return this.doContains(resource, { includeChildren: true }, ...types);
  }
  doContains(resource, options, ...types) {
    if (!resource) {
      return false;
    }
    const hasTypesFilter = types.length > 0;
    if (!hasTypesFilter || types.includes(
      1
      /* FileChangeType.ADDED */
    )) {
      if (this.added.value.get(resource)) {
        return true;
      }
      if (options.includeChildren && this.added.value.findSuperstr(resource)) {
        return true;
      }
    }
    if (!hasTypesFilter || types.includes(
      0
      /* FileChangeType.UPDATED */
    )) {
      if (this.updated.value.get(resource)) {
        return true;
      }
      if (options.includeChildren && this.updated.value.findSuperstr(resource)) {
        return true;
      }
    }
    if (!hasTypesFilter || types.includes(
      2
      /* FileChangeType.DELETED */
    )) {
      if (this.deleted.value.findSubstr(resource)) {
        return true;
      }
      if (options.includeChildren && this.deleted.value.findSuperstr(resource)) {
        return true;
      }
    }
    return false;
  }
  /**
   * Returns if this event contains added files.
   */
  gotAdded() {
    return this.rawAdded.length > 0;
  }
  /**
   * Returns if this event contains deleted files.
   */
  gotDeleted() {
    return this.rawDeleted.length > 0;
  }
  /**
   * Returns if this event contains updated files.
   */
  gotUpdated() {
    return this.rawUpdated.length > 0;
  }
  /**
   * Returns if this event contains changes that correlate to the
   * provided `correlationId`.
   *
   * File change event correlation is an advanced watch feature that
   * allows to  identify from which watch request the events originate
   * from. This correlation allows to route events specifically
   * only to the requestor and not emit them to all listeners.
   */
  correlates(correlationId) {
    return this.correlationId === correlationId;
  }
  /**
   * Figure out if the event contains changes that correlate to one
   * correlation identifier.
   *
   * File change event correlation is an advanced watch feature that
   * allows to  identify from which watch request the events originate
   * from. This correlation allows to route events specifically
   * only to the requestor and not emit them to all listeners.
   */
  hasCorrelation() {
    return typeof this.correlationId === "number";
  }
}
function isParent(path, candidate, ignoreCase) {
  if (!path || !candidate || path === candidate) {
    return false;
  }
  if (candidate.length > path.length) {
    return false;
  }
  if (candidate.charAt(candidate.length - 1) !== sep) {
    candidate += sep;
  }
  if (ignoreCase) {
    return startsWithIgnoreCase(path, candidate);
  }
  return path.indexOf(candidate) === 0;
}
__name(isParent, "isParent");
class FileOperationError extends Error {
  static {
    __name(this, "FileOperationError");
  }
  constructor(message, fileOperationResult, options) {
    super(message);
    this.fileOperationResult = fileOperationResult;
    this.options = options;
  }
}
class TooLargeFileOperationError extends FileOperationError {
  static {
    __name(this, "TooLargeFileOperationError");
  }
  constructor(message, fileOperationResult, size, options) {
    super(message, fileOperationResult, options);
    this.fileOperationResult = fileOperationResult;
    this.size = size;
  }
}
class NotModifiedSinceFileOperationError extends FileOperationError {
  static {
    __name(this, "NotModifiedSinceFileOperationError");
  }
  constructor(message, stat, options) {
    super(message, 2, options);
    this.stat = stat;
  }
}
var FileOperationResult;
(function(FileOperationResult2) {
  FileOperationResult2[FileOperationResult2["FILE_IS_DIRECTORY"] = 0] = "FILE_IS_DIRECTORY";
  FileOperationResult2[FileOperationResult2["FILE_NOT_FOUND"] = 1] = "FILE_NOT_FOUND";
  FileOperationResult2[FileOperationResult2["FILE_NOT_MODIFIED_SINCE"] = 2] = "FILE_NOT_MODIFIED_SINCE";
  FileOperationResult2[FileOperationResult2["FILE_MODIFIED_SINCE"] = 3] = "FILE_MODIFIED_SINCE";
  FileOperationResult2[FileOperationResult2["FILE_MOVE_CONFLICT"] = 4] = "FILE_MOVE_CONFLICT";
  FileOperationResult2[FileOperationResult2["FILE_WRITE_LOCKED"] = 5] = "FILE_WRITE_LOCKED";
  FileOperationResult2[FileOperationResult2["FILE_PERMISSION_DENIED"] = 6] = "FILE_PERMISSION_DENIED";
  FileOperationResult2[FileOperationResult2["FILE_TOO_LARGE"] = 7] = "FILE_TOO_LARGE";
  FileOperationResult2[FileOperationResult2["FILE_INVALID_PATH"] = 8] = "FILE_INVALID_PATH";
  FileOperationResult2[FileOperationResult2["FILE_NOT_DIRECTORY"] = 9] = "FILE_NOT_DIRECTORY";
  FileOperationResult2[FileOperationResult2["FILE_OTHER_ERROR"] = 10] = "FILE_OTHER_ERROR";
})(FileOperationResult || (FileOperationResult = {}));
const AutoSaveConfiguration = {
  OFF: "off",
  AFTER_DELAY: "afterDelay",
  ON_FOCUS_CHANGE: "onFocusChange",
  ON_WINDOW_CHANGE: "onWindowChange"
};
const HotExitConfiguration = {
  OFF: "off",
  ON_EXIT: "onExit",
  ON_EXIT_AND_WINDOW_CLOSE: "onExitAndWindowClose"
};
const FILES_ASSOCIATIONS_CONFIG = "files.associations";
const FILES_EXCLUDE_CONFIG = "files.exclude";
const FILES_READONLY_INCLUDE_CONFIG = "files.readonlyInclude";
const FILES_READONLY_EXCLUDE_CONFIG = "files.readonlyExclude";
const FILES_READONLY_FROM_PERMISSIONS_CONFIG = "files.readonlyFromPermissions";
var FileKind;
(function(FileKind2) {
  FileKind2[FileKind2["FILE"] = 0] = "FILE";
  FileKind2[FileKind2["FOLDER"] = 1] = "FOLDER";
  FileKind2[FileKind2["ROOT_FOLDER"] = 2] = "ROOT_FOLDER";
})(FileKind || (FileKind = {}));
const ETAG_DISABLED = "";
function etag(stat) {
  if (typeof stat.size !== "number" || typeof stat.mtime !== "number") {
    return void 0;
  }
  return stat.mtime.toString(29) + stat.size.toString(31);
}
__name(etag, "etag");
async function whenProviderRegistered(file, fileService) {
  if (fileService.hasProvider(URI.from({ scheme: file.scheme }))) {
    return;
  }
  return new Promise((resolve) => {
    const disposable = fileService.onDidChangeFileSystemProviderRegistrations((e) => {
      if (e.scheme === file.scheme && e.added) {
        disposable.dispose();
        resolve();
      }
    });
  });
}
__name(whenProviderRegistered, "whenProviderRegistered");
class ByteSize {
  static {
    __name(this, "ByteSize");
  }
  static {
    this.KB = 1024;
  }
  static {
    this.MB = ByteSize.KB * ByteSize.KB;
  }
  static {
    this.GB = ByteSize.MB * ByteSize.KB;
  }
  static {
    this.TB = ByteSize.GB * ByteSize.KB;
  }
  static formatSize(size) {
    if (!isNumber(size)) {
      size = 0;
    }
    if (size < ByteSize.KB) {
      return localize("sizeB", "{0}B", size.toFixed(0));
    }
    if (size < ByteSize.MB) {
      return localize("sizeKB", "{0}KB", (size / ByteSize.KB).toFixed(2));
    }
    if (size < ByteSize.GB) {
      return localize("sizeMB", "{0}MB", (size / ByteSize.MB).toFixed(2));
    }
    if (size < ByteSize.TB) {
      return localize("sizeGB", "{0}GB", (size / ByteSize.GB).toFixed(2));
    }
    return localize("sizeTB", "{0}TB", (size / ByteSize.TB).toFixed(2));
  }
}
function getLargeFileConfirmationLimit(arg) {
  const isRemote = typeof arg === "string" || arg?.scheme === Schemas.vscodeRemote;
  const isLocal = typeof arg !== "string" && arg?.scheme === Schemas.file;
  if (isLocal) {
    return 1024 * ByteSize.MB;
  }
  if (isRemote) {
    return 10 * ByteSize.MB;
  }
  if (isWeb) {
    return 50 * ByteSize.MB;
  }
  return 1024 * ByteSize.MB;
}
__name(getLargeFileConfirmationLimit, "getLargeFileConfirmationLimit");
export {
  AutoSaveConfiguration,
  ByteSize,
  ETAG_DISABLED,
  FILES_ASSOCIATIONS_CONFIG,
  FILES_EXCLUDE_CONFIG,
  FILES_READONLY_EXCLUDE_CONFIG,
  FILES_READONLY_FROM_PERMISSIONS_CONFIG,
  FILES_READONLY_INCLUDE_CONFIG,
  FileChangeFilter,
  FileChangeType,
  FileChangesEvent,
  FileKind,
  FileOperation,
  FileOperationError,
  FileOperationEvent,
  FileOperationResult,
  FilePermission,
  FileSystemProviderCapabilities,
  FileSystemProviderError,
  FileSystemProviderErrorCode,
  FileType,
  HotExitConfiguration,
  IFileService,
  NotModifiedSinceFileOperationError,
  TooLargeFileOperationError,
  createFileSystemProviderError,
  ensureFileSystemProviderError,
  etag,
  getLargeFileConfirmationLimit,
  hasFileAtomicDeleteCapability,
  hasFileAtomicReadCapability,
  hasFileAtomicWriteCapability,
  hasFileCloneCapability,
  hasFileFolderCopyCapability,
  hasFileReadStreamCapability,
  hasFileRealpathCapability,
  hasOpenReadWriteCloseCapability,
  hasReadWriteCapability,
  hasReadonlyCapability,
  isFileOpenForWriteOptions,
  isFileSystemWatcher,
  isParent,
  markAsFileSystemProviderError,
  toFileOperationResult,
  toFileSystemProviderErrorCode,
  whenProviderRegistered
};
//# sourceMappingURL=files.js.map
