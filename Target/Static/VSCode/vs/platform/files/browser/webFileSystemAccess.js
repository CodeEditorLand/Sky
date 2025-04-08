var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var WebFileSystemAccess;
((WebFileSystemAccess2) => {
  function supported(obj) {
    if (typeof obj?.showDirectoryPicker === "function") {
      return true;
    }
    return false;
  }
  WebFileSystemAccess2.supported = supported;
  __name(supported, "supported");
  function isFileSystemHandle(handle) {
    const candidate = handle;
    if (!candidate) {
      return false;
    }
    return typeof candidate.kind === "string" && typeof candidate.queryPermission === "function" && typeof candidate.requestPermission === "function";
  }
  WebFileSystemAccess2.isFileSystemHandle = isFileSystemHandle;
  __name(isFileSystemHandle, "isFileSystemHandle");
  function isFileSystemFileHandle(handle) {
    return handle.kind === "file";
  }
  WebFileSystemAccess2.isFileSystemFileHandle = isFileSystemFileHandle;
  __name(isFileSystemFileHandle, "isFileSystemFileHandle");
  function isFileSystemDirectoryHandle(handle) {
    return handle.kind === "directory";
  }
  WebFileSystemAccess2.isFileSystemDirectoryHandle = isFileSystemDirectoryHandle;
  __name(isFileSystemDirectoryHandle, "isFileSystemDirectoryHandle");
})(WebFileSystemAccess || (WebFileSystemAccess = {}));
var WebFileSystemObserver;
((WebFileSystemObserver2) => {
  function supported(obj) {
    return typeof obj?.FileSystemObserver === "function";
  }
  WebFileSystemObserver2.supported = supported;
  __name(supported, "supported");
})(WebFileSystemObserver || (WebFileSystemObserver = {}));
export {
  WebFileSystemAccess,
  WebFileSystemObserver
};
//# sourceMappingURL=webFileSystemAccess.js.map
