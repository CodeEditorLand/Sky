var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { basename } from "../../../../../base/common/path.js";
import { isWindows } from "../../../../../base/common/platform.js";
import { SimpleCompletionItem } from "../../../../services/suggest/browser/simpleCompletionItem.js";
var TerminalCompletionItemKind;
(function(TerminalCompletionItemKind2) {
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
})(TerminalCompletionItemKind || (TerminalCompletionItemKind = {}));
class TerminalCompletionItem extends SimpleCompletionItem {
  static {
    __name(this, "TerminalCompletionItem");
  }
  constructor(completion) {
    super(completion);
    this.completion = completion;
    this.underscorePenalty = 0;
    this.fileExtLow = "";
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
    if (isFile(completion) || completion.kind === TerminalCompletionItemKind.Folder) {
      if (isWindows) {
        this.labelLowNormalizedPath = this.labelLow.replaceAll("\\", "/");
      }
      if (completion.kind === TerminalCompletionItemKind.Folder) {
        this.labelLowNormalizedPath = this.labelLowNormalizedPath.replace(/\/$/, "");
      }
      this.underscorePenalty = basename(this.labelLowNormalizedPath).startsWith("_") ? 1 : 0;
    }
  }
}
function isFile(completion) {
  return !!(completion.kind === TerminalCompletionItemKind.File || completion.isFileOverride);
}
__name(isFile, "isFile");
export {
  TerminalCompletionItem,
  TerminalCompletionItemKind
};
//# sourceMappingURL=terminalCompletionItem.js.map
