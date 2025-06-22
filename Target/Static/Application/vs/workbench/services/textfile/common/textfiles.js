var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { FileOperationError } from "../../../../platform/files/common/files.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { VSBuffer } from "../../../../base/common/buffer.js";
import { areFunctions, isUndefinedOrNull } from "../../../../base/common/types.js";
const ITextFileService = createDecorator("textFileService");
var TextFileOperationResult;
(function(TextFileOperationResult2) {
  TextFileOperationResult2[TextFileOperationResult2["FILE_IS_BINARY"] = 0] = "FILE_IS_BINARY";
})(TextFileOperationResult || (TextFileOperationResult = {}));
class TextFileOperationError extends FileOperationError {
  static {
    __name(this, "TextFileOperationError");
  }
  static isTextFileOperationError(obj) {
    return obj instanceof Error && !isUndefinedOrNull(obj.textFileOperationResult);
  }
  constructor(message, textFileOperationResult, options) {
    super(
      message,
      10
      /* FileOperationResult.FILE_OTHER_ERROR */
    );
    this.textFileOperationResult = textFileOperationResult;
    this.options = options;
  }
}
var TextFileEditorModelState;
(function(TextFileEditorModelState2) {
  TextFileEditorModelState2[TextFileEditorModelState2["SAVED"] = 0] = "SAVED";
  TextFileEditorModelState2[TextFileEditorModelState2["DIRTY"] = 1] = "DIRTY";
  TextFileEditorModelState2[TextFileEditorModelState2["PENDING_SAVE"] = 2] = "PENDING_SAVE";
  TextFileEditorModelState2[TextFileEditorModelState2["CONFLICT"] = 3] = "CONFLICT";
  TextFileEditorModelState2[TextFileEditorModelState2["ORPHAN"] = 4] = "ORPHAN";
  TextFileEditorModelState2[TextFileEditorModelState2["ERROR"] = 5] = "ERROR";
})(TextFileEditorModelState || (TextFileEditorModelState = {}));
var TextFileResolveReason;
(function(TextFileResolveReason2) {
  TextFileResolveReason2[TextFileResolveReason2["EDITOR"] = 1] = "EDITOR";
  TextFileResolveReason2[TextFileResolveReason2["REFERENCE"] = 2] = "REFERENCE";
  TextFileResolveReason2[TextFileResolveReason2["OTHER"] = 3] = "OTHER";
})(TextFileResolveReason || (TextFileResolveReason = {}));
var EncodingMode;
(function(EncodingMode2) {
  EncodingMode2[EncodingMode2["Encode"] = 0] = "Encode";
  EncodingMode2[EncodingMode2["Decode"] = 1] = "Decode";
})(EncodingMode || (EncodingMode = {}));
function isTextFileEditorModel(model) {
  const candidate = model;
  return areFunctions(candidate.setEncoding, candidate.getEncoding, candidate.save, candidate.revert, candidate.isDirty, candidate.getLanguageId);
}
__name(isTextFileEditorModel, "isTextFileEditorModel");
function snapshotToString(snapshot) {
  const chunks = [];
  let chunk;
  while (typeof (chunk = snapshot.read()) === "string") {
    chunks.push(chunk);
  }
  return chunks.join("");
}
__name(snapshotToString, "snapshotToString");
function stringToSnapshot(value) {
  let done = false;
  return {
    read() {
      if (!done) {
        done = true;
        return value;
      }
      return null;
    }
  };
}
__name(stringToSnapshot, "stringToSnapshot");
function toBufferOrReadable(value) {
  if (typeof value === "undefined") {
    return void 0;
  }
  if (typeof value === "string") {
    return VSBuffer.fromString(value);
  }
  return {
    read: /* @__PURE__ */ __name(() => {
      const chunk = value.read();
      if (typeof chunk === "string") {
        return VSBuffer.fromString(chunk);
      }
      return null;
    }, "read")
  };
}
__name(toBufferOrReadable, "toBufferOrReadable");
export {
  EncodingMode,
  ITextFileService,
  TextFileEditorModelState,
  TextFileOperationError,
  TextFileOperationResult,
  TextFileResolveReason,
  isTextFileEditorModel,
  snapshotToString,
  stringToSnapshot,
  toBufferOrReadable
};
//# sourceMappingURL=textfiles.js.map
