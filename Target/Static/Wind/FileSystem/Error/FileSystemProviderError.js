var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { FileSystemErrorCode } from "../Type/FileSystemType.js";
class FileSystemProviderError extends Error {
  static {
    __name(this, "FileSystemProviderError");
  }
  _tag;
  code;
  constructor(message, code, cause) {
    super(message, cause ? { cause } : void 0);
    this.name = "FileSystemProviderError";
    this._tag = "FileSystemProviderError";
    this.code = code;
  }
}
class FileNotFoundError extends FileSystemProviderError {
  static {
    __name(this, "FileNotFoundError");
  }
  constructor(path, cause) {
    super(`File not found: ${path}`, FileSystemErrorCode.FileNotFound, cause);
    this.name = "FileNotFoundError";
    this._tag = "FileNotFoundError";
  }
}
class FileExistsError extends FileSystemProviderError {
  static {
    __name(this, "FileExistsError");
  }
  constructor(path, cause) {
    super(`File already exists: ${path}`, FileSystemErrorCode.FileExists, cause);
    this.name = "FileExistsError";
    this._tag = "FileExistsError";
  }
}
class PermissionError extends FileSystemProviderError {
  static {
    __name(this, "PermissionError");
  }
  constructor(path, cause) {
    super(`Permission denied: ${path}`, FileSystemErrorCode.NoPermissions, cause);
    this.name = "PermissionError";
    this._tag = "PermissionError";
  }
}
class InvalidPathError extends FileSystemProviderError {
  static {
    __name(this, "InvalidPathError");
  }
  constructor(path, cause) {
    super(`Invalid path: ${path}`, FileSystemErrorCode.InvalidPath, cause);
    this.name = "InvalidPathError";
    this._tag = "InvalidPathError";
  }
}
class NotSupportedError extends FileSystemProviderError {
  static {
    __name(this, "NotSupportedError");
  }
  constructor(operation, cause) {
    super(`Operation not supported: ${operation}`, FileSystemErrorCode.NotSupported, cause);
    this.name = "NotSupportedError";
    this._tag = "NotSupportedError";
  }
}
class UnknownFileSystemError extends FileSystemProviderError {
  static {
    __name(this, "UnknownFileSystemError");
  }
  constructor(message, cause) {
    super(`Unknown file system error: ${message}`, FileSystemErrorCode.Unknown, cause);
    this.name = "UnknownFileSystemError";
    this._tag = "UnknownFileSystemError";
  }
}
function isFileSystemProviderError(error) {
  return error instanceof FileSystemProviderError;
}
__name(isFileSystemProviderError, "isFileSystemProviderError");
function isFileNotFoundError(error) {
  return error instanceof FileNotFoundError;
}
__name(isFileNotFoundError, "isFileNotFoundError");
function isFileExistsError(error) {
  return error instanceof FileExistsError;
}
__name(isFileExistsError, "isFileExistsError");
function isPermissionError(error) {
  return error instanceof PermissionError;
}
__name(isPermissionError, "isPermissionError");
function isInvalidPathError(error) {
  return error instanceof InvalidPathError;
}
__name(isInvalidPathError, "isInvalidPathError");
function isNotSupportedError(error) {
  return error instanceof NotSupportedError;
}
__name(isNotSupportedError, "isNotSupportedError");
function isUnknownFileSystemError(error) {
  return error instanceof UnknownFileSystemError;
}
__name(isUnknownFileSystemError, "isUnknownFileSystemError");
function toFileSystemProviderError(error, context, contextValue) {
  if (isFileSystemProviderError(error)) {
    return error;
  }
  const message = error instanceof Error ? error.message : String(error);
  const fullMessage = contextValue ? `${context} (${contextValue}): ${message}` : `${context}: ${message}`;
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes("not found") || lowerMessage.includes("no such")) {
    return new FileNotFoundError(contextValue ?? context, error);
  }
  if (lowerMessage.includes("already exists") || lowerMessage.includes("exists")) {
    return new FileExistsError(contextValue ?? context, error);
  }
  if (lowerMessage.includes("permission") || lowerMessage.includes("denied")) {
    return new PermissionError(contextValue ?? context, error);
  }
  if (lowerMessage.includes("invalid") || lowerMessage.includes("malformed")) {
    return new InvalidPathError(contextValue ?? context, error);
  }
  return new UnknownFileSystemError(fullMessage, error);
}
__name(toFileSystemProviderError, "toFileSystemProviderError");
export {
  FileExistsError,
  FileNotFoundError,
  FileSystemProviderError,
  InvalidPathError,
  NotSupportedError,
  PermissionError,
  UnknownFileSystemError,
  isFileExistsError,
  isFileNotFoundError,
  isFileSystemProviderError,
  isInvalidPathError,
  isNotSupportedError,
  isPermissionError,
  isUnknownFileSystemError,
  toFileSystemProviderError
};
//# sourceMappingURL=FileSystemProviderError.js.map
