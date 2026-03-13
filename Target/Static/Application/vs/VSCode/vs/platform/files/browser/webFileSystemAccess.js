var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var WebFileSystemAccess;
(function(WebFileSystemAccess2) {
  function supported(obj) {
    if (typeof obj?.showDirectoryPicker === "function") {
      return true;
    }
    return false;
  }
  __name(supported, "supported");
  WebFileSystemAccess2.supported = supported;
  function isFileSystemHandle(handle) {
    const candidate = handle;
    if (!candidate) {
      return false;
    }
    return typeof candidate.kind === "string" && typeof candidate.queryPermission === "function" && typeof candidate.requestPermission === "function";
  }
  __name(isFileSystemHandle, "isFileSystemHandle");
  WebFileSystemAccess2.isFileSystemHandle = isFileSystemHandle;
  function isFileSystemFileHandle(handle) {
    return handle.kind === "file";
  }
  __name(isFileSystemFileHandle, "isFileSystemFileHandle");
  WebFileSystemAccess2.isFileSystemFileHandle = isFileSystemFileHandle;
  function isFileSystemDirectoryHandle(handle) {
    return handle.kind === "directory";
  }
  __name(isFileSystemDirectoryHandle, "isFileSystemDirectoryHandle");
  WebFileSystemAccess2.isFileSystemDirectoryHandle = isFileSystemDirectoryHandle;
})(WebFileSystemAccess || (WebFileSystemAccess = {}));
var WebFileSystemObserver;
(function(WebFileSystemObserver2) {
  function supported(obj) {
    return typeof obj?.FileSystemObserver === "function";
  }
  __name(supported, "supported");
  WebFileSystemObserver2.supported = supported;
})(WebFileSystemObserver || (WebFileSystemObserver = {}));
export {
  WebFileSystemAccess,
  WebFileSystemObserver
};
//# sourceMappingURL=webFileSystemAccess.js.map
