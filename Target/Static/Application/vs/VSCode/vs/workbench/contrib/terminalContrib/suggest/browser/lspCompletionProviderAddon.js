var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { mapLspKindToTerminalKind, TerminalCompletionItemKind } from "./terminalCompletionItem.js";
import { Position } from "../../../../../editor/common/core/position.js";
class LspCompletionProviderAddon extends Disposable {
  static {
    __name(this, "LspCompletionProviderAddon");
  }
  constructor(provider, textVirtualModel, lspTerminalModelContentProvider) {
    super();
    this.id = "lsp";
    this.isBuiltin = true;
    this.shellTypes = [
      "python"
      /* GeneralShellType.Python */
    ];
    this._provider = provider;
    this._textVirtualModel = textVirtualModel;
    this._lspTerminalModelContentProvider = lspTerminalModelContentProvider;
    this.triggerCharacters = provider.triggerCharacters ? [...provider.triggerCharacters, " ", "("] : [" ", "("];
  }
  activate(terminal) {
  }
  async provideCompletions(value, cursorPosition, token) {
    this._lspTerminalModelContentProvider.trackPromptInputToVirtualFile(value);
    const textBeforeCursor = value.substring(0, cursorPosition);
    const lines = textBeforeCursor.split("\n");
    const column = lines[lines.length - 1].length + 1;
    const lineNum = this._textVirtualModel.object.textEditorModel.getLineCount();
    const positionVirtualDocument = new Position(lineNum, column);
    const completions = [];
    if (this._provider && this._provider._debugDisplayName !== "wordbasedCompletions") {
      const result = await this._provider.provideCompletionItems(this._textVirtualModel.object.textEditorModel, positionVirtualDocument, {
        triggerKind: 1
        /* CompletionTriggerKind.TriggerCharacter */
      }, token);
      for (const item of result?.suggestions || []) {
        const convertedKind = item.kind ? mapLspKindToTerminalKind(item.kind) : TerminalCompletionItemKind.Method;
        const completionItemTemp = createCompletionItemPython(cursorPosition, textBeforeCursor, convertedKind, "lspCompletionItem", void 0);
        const terminalCompletion = {
          label: item.label,
          provider: `lsp:${item.extensionId?.value}`,
          detail: item.detail,
          documentation: item.documentation,
          kind: convertedKind,
          replacementRange: completionItemTemp.replacementRange
        };
        if (this._provider.resolveCompletionItem && (!item.detail || !item.documentation)) {
          terminalCompletion._unresolvedItem = item;
          terminalCompletion._resolveProvider = this._provider;
        }
        completions.push(terminalCompletion);
      }
    }
    return completions;
  }
}
function createCompletionItemPython(cursorPosition, prefix, kind, label, detail) {
  const lastWord = getLastWord(prefix);
  return {
    label,
    detail: detail ?? "",
    replacementRange: [cursorPosition - lastWord.length, cursorPosition],
    kind: kind ?? TerminalCompletionItemKind.Method
  };
}
__name(createCompletionItemPython, "createCompletionItemPython");
function getLastWord(prefix) {
  if (prefix.endsWith(" ")) {
    return "";
  }
  if (prefix.endsWith(".")) {
    return "";
  }
  const lastSpaceIndex = prefix.lastIndexOf(" ");
  const lastDotIndex = prefix.lastIndexOf(".");
  const lastParenIndex = prefix.lastIndexOf("(");
  const lastDelimiterIndex = Math.max(lastSpaceIndex, lastDotIndex, lastParenIndex);
  if (lastDelimiterIndex === -1) {
    return prefix;
  }
  return prefix.substring(lastDelimiterIndex + 1);
}
__name(getLastWord, "getLastWord");
export {
  LspCompletionProviderAddon,
  createCompletionItemPython
};
//# sourceMappingURL=lspCompletionProviderAddon.js.map
