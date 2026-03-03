var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var FileType = /* @__PURE__ */ ((FileType2) => {
  FileType2[FileType2["Unknown"] = 0] = "Unknown";
  FileType2[FileType2["File"] = 1] = "File";
  FileType2[FileType2["Directory"] = 2] = "Directory";
  FileType2[FileType2["SymbolicLink"] = 64] = "SymbolicLink";
  return FileType2;
})(FileType || {});
function fileTypeToString(fileType) {
  switch (fileType) {
    case 1 /* File */:
      return "file";
    case 2 /* Directory */:
      return "directory";
    case 64 /* SymbolicLink */:
      return "symlink";
    default:
      return "unknown";
  }
}
__name(fileTypeToString, "fileTypeToString");
export {
  FileType,
  fileTypeToString
};
//# sourceMappingURL=FileType.js.map
