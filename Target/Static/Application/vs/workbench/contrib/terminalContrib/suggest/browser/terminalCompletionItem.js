var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { basename } from "../../../../../base/common/path.js";
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
  TerminalCompletionItemKind2[TerminalCompletionItemKind2["Commit"] = 10] = "Commit";
  TerminalCompletionItemKind2[TerminalCompletionItemKind2["Branch"] = 11] = "Branch";
  TerminalCompletionItemKind2[TerminalCompletionItemKind2["Tag"] = 12] = "Tag";
  TerminalCompletionItemKind2[TerminalCompletionItemKind2["Stash"] = 13] = "Stash";
  TerminalCompletionItemKind2[TerminalCompletionItemKind2["Remote"] = 14] = "Remote";
  TerminalCompletionItemKind2[TerminalCompletionItemKind2["PullRequest"] = 15] = "PullRequest";
  TerminalCompletionItemKind2[TerminalCompletionItemKind2["PullRequestDone"] = 16] = "PullRequestDone";
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
  constructor(completion, pathSeparator) {
    super(completion);
    this.completion = completion;
    this.fileExtLow = "";
    this.punctuationPenalty = 0;
    const detectedSeparator = pathSeparator ?? (this.labelLow.includes("\\") ? "\\" : void 0);
    const useWindowsStylePath = detectedSeparator === "\\";
    this.labelLowExcludeFileExt = this.labelLow;
    this.labelLowNormalizedPath = this.labelLow;
    if (isFile(completion) || completion.kind === TerminalCompletionItemKind.Branch) {
      if (useWindowsStylePath) {
        this.labelLow = this.labelLow.replaceAll("/", "\\");
      }
    }
    if (isFile(completion)) {
      const extIndex = this.labelLow.lastIndexOf(".");
      if (extIndex > 0) {
        this.labelLowExcludeFileExt = this.labelLow.substring(0, extIndex);
        this.fileExtLow = this.labelLow.substring(extIndex + 1);
      }
    }
    if (isFile(completion) || completion.kind === TerminalCompletionItemKind.Folder) {
      if (useWindowsStylePath) {
        this.labelLowNormalizedPath = this.labelLow.replaceAll("\\", "/");
      }
      if (completion.kind === TerminalCompletionItemKind.Folder) {
        this.labelLowNormalizedPath = this.labelLowNormalizedPath.replace(/\/$/, "");
      }
    }
    this.punctuationPenalty = shouldPenalizeForPunctuation(this.labelLowExcludeFileExt) ? 1 : 0;
  }
  /**
   * Resolves the completion item's details lazily when needed.
   */
  async resolve(token) {
    if (this.resolveCache) {
      return this.resolveCache;
    }
    const unresolvedItem = this.completion._unresolvedItem;
    const provider = this.completion._resolveProvider;
    if (!unresolvedItem || !provider || !provider.resolveCompletionItem) {
      return;
    }
    this.resolveCache = (async () => {
      try {
        const resolved = await provider.resolveCompletionItem(unresolvedItem, token);
        if (resolved) {
          if (resolved.detail) {
            this.completion.detail = resolved.detail;
          }
          if (resolved.documentation) {
            this.completion.documentation = resolved.documentation;
          }
        }
      } catch (error) {
        return;
      }
    })();
    return this.resolveCache;
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
