var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class FileSystemError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
    this.name = "FileSystemError";
  }
  static {
    __name(this, "FileSystemError");
  }
}
var FileSystemErrorCode = /* @__PURE__ */ ((FileSystemErrorCode2) => {
  FileSystemErrorCode2["FileNotFound"] = "FileNotFound";
  FileSystemErrorCode2["FileExists"] = "FileExists";
  FileSystemErrorCode2["NoPermissions"] = "NoPermissions";
  FileSystemErrorCode2["InvalidPath"] = "InvalidPath";
  FileSystemErrorCode2["NotSupported"] = "NotSupported";
  FileSystemErrorCode2["Unknown"] = "Unknown";
  return FileSystemErrorCode2;
})(FileSystemErrorCode || {});
export {
  FileSystemError,
  FileSystemErrorCode
};
//# sourceMappingURL=FileSystemType.js.map
