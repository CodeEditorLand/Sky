var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { basename } from "../../../../base/common/path.js";
import { assert, assertNever } from "../../../../base/common/assert.js";
class ParseError extends Error {
  static {
    __name(this, "ParseError");
  }
  constructor(message, options) {
    super(message, options);
  }
  /**
   * Check if provided object is of the same type as this error.
   */
  sameTypeAs(other) {
    if (other === null || other === void 0) {
      return false;
    }
    return other instanceof this.constructor;
  }
  /**
   * Check if provided object is equal to this error.
   */
  equal(other) {
    return this.sameTypeAs(other);
  }
}
class ResolveError extends ParseError {
  static {
    __name(this, "ResolveError");
  }
  constructor(uri, message, options) {
    super(message, options);
    this.uri = uri;
  }
}
class FailedToResolveContentsStream extends ResolveError {
  static {
    __name(this, "FailedToResolveContentsStream");
  }
  constructor(uri, originalError, message = `Failed to resolve prompt contents stream for '${uri.toString()}': ${originalError}.`) {
    super(uri, message);
    this.originalError = originalError;
    this.errorType = "FailedToResolveContentsStream";
  }
}
class OpenFailed extends FailedToResolveContentsStream {
  static {
    __name(this, "OpenFailed");
  }
  constructor(uri, originalError) {
    super(uri, originalError, `Failed to open '${uri.fsPath}': ${originalError}.`);
    this.errorType = "OpenError";
  }
}
const DEFAULT_RECURSIVE_PATH_JOIN_CHAR = " -> ";
class RecursiveReference extends ResolveError {
  static {
    __name(this, "RecursiveReference");
  }
  constructor(uri, recursivePath) {
    assert(recursivePath.length >= 2, `Recursive path must contain at least two paths, got '${recursivePath.length}'.`);
    super(uri, "Recursive references found.");
    this.recursivePath = recursivePath;
    this.errorType = "RecursiveReferenceError";
  }
  get message() {
    return `${super.message} ${this.getRecursivePathString("fullpath")}`;
  }
  /**
   * Returns a string representation of the recursive path.
   */
  getRecursivePathString(filename, pathJoinCharacter = DEFAULT_RECURSIVE_PATH_JOIN_CHAR) {
    const isDefault = filename === "fullpath" && pathJoinCharacter === DEFAULT_RECURSIVE_PATH_JOIN_CHAR;
    if (isDefault && this.defaultPathStringCache !== void 0) {
      return this.defaultPathStringCache;
    }
    const result = this.recursivePath.map((path) => {
      if (filename === "fullpath") {
        return `'${path}'`;
      }
      if (filename === "basename") {
        return `'${basename(path)}'`;
      }
      assertNever(filename, `Unknown filename format '${filename}'.`);
    }).join(pathJoinCharacter);
    if (isDefault) {
      this.defaultPathStringCache = result;
    }
    return result;
  }
  /**
   * Check if provided object is of the same type as this
   * error, contains the same recursive path and URI.
   */
  equal(other) {
    if (!this.sameTypeAs(other)) {
      return false;
    }
    if (this.uri.toString() !== other.uri.toString()) {
      return false;
    }
    if (this.recursivePath.length !== other.recursivePath.length) {
      return false;
    }
    const myRecursivePath = this.getRecursivePathString("fullpath");
    const theirRecursivePath = other.getRecursivePathString("fullpath");
    if (myRecursivePath.length !== theirRecursivePath.length) {
      return false;
    }
    return myRecursivePath === theirRecursivePath;
  }
  /**
   * Returns a string representation of the error object.
   */
  toString() {
    return `"${this.message}"(${this.uri})`;
  }
}
class NotPromptFile extends ResolveError {
  static {
    __name(this, "NotPromptFile");
  }
  constructor(uri, message = "") {
    const suffix = message ? `: ${message}` : "";
    super(uri, `Resource at ${uri.path} is not a prompt file${suffix}`);
    this.errorType = "NotPromptFileError";
  }
}
class FolderReference extends NotPromptFile {
  static {
    __name(this, "FolderReference");
  }
  constructor(uri, message = "") {
    const suffix = message ? `: ${message}` : "";
    super(uri, `Entity at '${uri.path}' is a folder${suffix}`);
    this.errorType = "FolderReferenceError";
  }
}
export {
  FailedToResolveContentsStream,
  FolderReference,
  NotPromptFile,
  OpenFailed,
  RecursiveReference,
  ResolveError
};
//# sourceMappingURL=promptFileReferenceErrors.js.map
