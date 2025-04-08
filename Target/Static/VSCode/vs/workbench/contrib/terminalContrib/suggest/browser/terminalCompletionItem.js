var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { basename } from "../../../../../base/common/path.js";
import { isWindows } from "../../../../../base/common/platform.js";
import { ISimpleCompletion, SimpleCompletionItem } from "../../../../services/suggest/browser/simpleCompletionItem.js";
var TerminalCompletionItemKind = /* @__PURE__ */ ((TerminalCompletionItemKind2) => {
  TerminalCompletionItemKind2[TerminalCompletionItemKind2["File"] = 0] = "File";
  TerminalCompletionItemKind2[TerminalCompletionItemKind2["Folder"] = 1] = "Folder";
  TerminalCompletionItemKind2[TerminalCompletionItemKind2["Method"] = 2] = "Method";
  TerminalCompletionItemKind2[TerminalCompletionItemKind2["Alias"] = 3] = "Alias";
  TerminalCompletionItemKind2[TerminalCompletionItemKind2["Argument"] = 4] = "Argument";
  TerminalCompletionItemKind2[TerminalCompletionItemKind2["Option"] = 5] = "Option";
  TerminalCompletionItemKind2[TerminalCompletionItemKind2["OptionValue"] = 6] = "OptionValue";
  TerminalCompletionItemKind2[TerminalCompletionItemKind2["Flag"] = 7] = "Flag";
  TerminalCompletionItemKind2[TerminalCompletionItemKind2["InlineSuggestion"] = 100] = "InlineSuggestion";
  TerminalCompletionItemKind2[TerminalCompletionItemKind2["InlineSuggestionAlwaysOnTop"] = 101] = "InlineSuggestionAlwaysOnTop";
  return TerminalCompletionItemKind2;
})(TerminalCompletionItemKind || {});
class TerminalCompletionItem extends SimpleCompletionItem {
  constructor(completion) {
    super(completion);
    this.completion = completion;
    this.labelLowExcludeFileExt = this.labelLow;
    this.labelLowNormalizedPath = this.labelLow;
    if (isFile(completion)) {
      if (isWindows) {
        this.labelLow = this.labelLow.replaceAll("/", "\\");
      }
      const extIndex = this.labelLow.lastIndexOf(".");
      if (extIndex > 0) {
        this.labelLowExcludeFileExt = this.labelLow.substring(0, extIndex);
        this.fileExtLow = this.labelLow.substring(extIndex + 1);
      }
    }
    if (isFile(completion) || completion.kind === 1 /* Folder */) {
      if (isWindows) {
        this.labelLowNormalizedPath = this.labelLow.replaceAll("\\", "/");
      }
      if (completion.kind === 1 /* Folder */) {
        this.labelLowNormalizedPath = this.labelLowNormalizedPath.replace(/\/$/, "");
      }
      this.underscorePenalty = basename(this.labelLowNormalizedPath).startsWith("_") ? 1 : 0;
    }
  }
  static {
    __name(this, "TerminalCompletionItem");
  }
  /**
   * {@link labelLow} without the file extension.
   */
  labelLowExcludeFileExt;
  /**
   * The lowercase label, when the completion is a file or directory this has  normalized path
   * separators (/) on Windows and no trailing separator for directories.
   */
  labelLowNormalizedPath;
  /**
   * A penalty that applies to files or folders starting with the underscore character.
   */
  underscorePenalty = 0;
  /**
   * The file extension part from {@link labelLow}.
   */
  fileExtLow = "";
}
function isFile(completion) {
  return !!(completion.kind === 0 /* File */ || completion.isFileOverride);
}
__name(isFile, "isFile");
export {
  TerminalCompletionItem,
  TerminalCompletionItemKind
};
//# sourceMappingURL=terminalCompletionItem.js.map
