var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { URI } from "../../../../base/common/uri.js";
import { Event } from "../../../../base/common/event.js";
import { IDisposable } from "../../../../base/common/lifecycle.js";
import { ISaveOptions, IRevertOptions, SaveReason } from "../../../common/editor.js";
import { ReadableStream } from "../../../../base/common/stream.js";
import { IBaseFileStatWithMetadata, IFileStatWithMetadata, IWriteFileOptions, FileOperationError, FileOperationResult, IReadFileStreamOptions, IFileReadLimits } from "../../../../platform/files/common/files.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { ITextEditorModel } from "../../../../editor/common/services/resolverService.js";
import { ITextBufferFactory, ITextModel, ITextSnapshot } from "../../../../editor/common/model.js";
import { VSBuffer, VSBufferReadable, VSBufferReadableStream } from "../../../../base/common/buffer.js";
import { areFunctions, isUndefinedOrNull } from "../../../../base/common/types.js";
import { IWorkingCopy, IWorkingCopySaveEvent } from "../../workingCopy/common/workingCopy.js";
import { IUntitledTextEditorModelManager } from "../../untitled/common/untitledTextEditorService.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { IProgress, IProgressStep } from "../../../../platform/progress/common/progress.js";
import { IFileOperationUndoRedoInfo } from "../../workingCopy/common/workingCopyFileService.js";
const ITextFileService = createDecorator("textFileService");
var TextFileOperationResult = /* @__PURE__ */ ((TextFileOperationResult2) => {
  TextFileOperationResult2[TextFileOperationResult2["FILE_IS_BINARY"] = 0] = "FILE_IS_BINARY";
  return TextFileOperationResult2;
})(TextFileOperationResult || {});
class TextFileOperationError extends FileOperationError {
  constructor(message, textFileOperationResult, options) {
    super(message, FileOperationResult.FILE_OTHER_ERROR);
    this.textFileOperationResult = textFileOperationResult;
    this.options = options;
  }
  static {
    __name(this, "TextFileOperationError");
  }
  static isTextFileOperationError(obj) {
    return obj instanceof Error && !isUndefinedOrNull(obj.textFileOperationResult);
  }
  options;
}
var TextFileEditorModelState = /* @__PURE__ */ ((TextFileEditorModelState2) => {
  TextFileEditorModelState2[TextFileEditorModelState2["SAVED"] = 0] = "SAVED";
  TextFileEditorModelState2[TextFileEditorModelState2["DIRTY"] = 1] = "DIRTY";
  TextFileEditorModelState2[TextFileEditorModelState2["PENDING_SAVE"] = 2] = "PENDING_SAVE";
  TextFileEditorModelState2[TextFileEditorModelState2["CONFLICT"] = 3] = "CONFLICT";
  TextFileEditorModelState2[TextFileEditorModelState2["ORPHAN"] = 4] = "ORPHAN";
  TextFileEditorModelState2[TextFileEditorModelState2["ERROR"] = 5] = "ERROR";
  return TextFileEditorModelState2;
})(TextFileEditorModelState || {});
var TextFileResolveReason = /* @__PURE__ */ ((TextFileResolveReason2) => {
  TextFileResolveReason2[TextFileResolveReason2["EDITOR"] = 1] = "EDITOR";
  TextFileResolveReason2[TextFileResolveReason2["REFERENCE"] = 2] = "REFERENCE";
  TextFileResolveReason2[TextFileResolveReason2["OTHER"] = 3] = "OTHER";
  return TextFileResolveReason2;
})(TextFileResolveReason || {});
var EncodingMode = /* @__PURE__ */ ((EncodingMode2) => {
  EncodingMode2[EncodingMode2["Encode"] = 0] = "Encode";
  EncodingMode2[EncodingMode2["Decode"] = 1] = "Decode";
  return EncodingMode2;
})(EncodingMode || {});
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
