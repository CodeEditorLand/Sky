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
  TerminalCompletionItemKind2[TerminalCompletionItemKind2["SymbolicLinkFile"] = 8] = "SymbolicLinkFile";
  TerminalCompletionItemKind2[TerminalCompletionItemKind2["SymbolicLinkFolder"] = 9] = "SymbolicLinkFolder";
  TerminalCompletionItemKind2[TerminalCompletionItemKind2["InlineSuggestion"] = 100] = "InlineSuggestion";
  TerminalCompletionItemKind2[TerminalCompletionItemKind2["InlineSuggestionAlwaysOnTop"] = 101] = "InlineSuggestionAlwaysOnTop";
})(TerminalCompletionItemKind || (TerminalCompletionItemKind = {}));
function mapLspKindToTerminalKind(lspKind) {
  switch (lspKind) {
    case 20:
      return TerminalCompletionItemKind.File;
    case 23:
      return TerminalCompletionItemKind.Folder;
    case 0:
      return TerminalCompletionItemKind.Method;
    case 18:
      return TerminalCompletionItemKind.Argument;
    // consider adding new type?
    case 4:
      return TerminalCompletionItemKind.Argument;
    // ""
    case 16:
      return TerminalCompletionItemKind.OptionValue;
    // ""
    case 17:
      return TerminalCompletionItemKind.Alias;
    default:
      return TerminalCompletionItemKind.Method;
  }
}
__name(mapLspKindToTerminalKind, "mapLspKindToTerminalKind");
class TerminalCompletionItem extends SimpleCompletionItem {
  static {
    __name(this, "TerminalCompletionItem");
  }
  constructor(completion) {
    super(completion);
    this.completion = completion;
    this.fileExtLow = "";
    this.punctuationPenalty = 0;
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
    }
    this.punctuationPenalty = shouldPenalizeForPunctuation(this.labelLowExcludeFileExt) ? 1 : 0;
  }
}
function isFile(completion) {
  return !!(completion.kind === TerminalCompletionItemKind.File || completion.isFileOverride);
}
__name(isFile, "isFile");
function shouldPenalizeForPunctuation(label) {
  return basename(label).startsWith("_") || /^[\[\]\{\}\(\)\.,;:!?\/\\\-_@#~*%^=$]+$/.test(label);
}
__name(shouldPenalizeForPunctuation, "shouldPenalizeForPunctuation");
export {
  TerminalCompletionItem,
  TerminalCompletionItemKind,
  mapLspKindToTerminalKind
};
//# sourceMappingURL=terminalCompletionItem.js.map
