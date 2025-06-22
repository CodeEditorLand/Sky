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
    this._provider = provider;
    this._textVirtualModel = textVirtualModel;
    this._lspTerminalModelContentProvider = lspTerminalModelContentProvider;
    this.triggerCharacters = provider.triggerCharacters ? [...provider.triggerCharacters, " "] : [" "];
  }
  activate(terminal) {
  }
  async provideCompletions(value, cursorPosition, allowFallbackCompletions, token) {
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
      completions.push(...(result?.suggestions || []).map((e) => {
        const convertedKind = e.kind ? mapLspKindToTerminalKind(e.kind) : TerminalCompletionItemKind.Method;
        const completionItemTemp = createCompletionItemPython(cursorPosition, textBeforeCursor, convertedKind, "lspCompletionItem", void 0);
        return {
          label: e.insertText,
          provider: `lsp:${this._provider._debugDisplayName}`,
          detail: e.detail,
          kind: convertedKind,
          replacementIndex: completionItemTemp.replacementIndex,
          replacementLength: completionItemTemp.replacementLength
        };
      }));
    }
    return completions;
  }
}
function createCompletionItemPython(cursorPosition, prefix, kind, label, detail) {
  const endsWithDot = prefix.endsWith(".");
  const endsWithSpace = prefix.endsWith(" ");
  if (endsWithSpace) {
    const lastWord = endsWithSpace ? "" : prefix.split(" ").at(-1) ?? "";
    return {
      label,
      detail: detail ?? detail ?? "",
      replacementIndex: cursorPosition - lastWord.length,
      replacementLength: lastWord.length,
      kind: kind ?? kind ?? TerminalCompletionItemKind.Method
    };
  } else {
    const lastWord = endsWithDot ? "" : prefix.split(".").at(-1) ?? "";
    return {
      label,
      detail: detail ?? detail ?? "",
      replacementIndex: cursorPosition - lastWord.length,
      replacementLength: lastWord.length,
      kind: kind ?? kind ?? TerminalCompletionItemKind.Method
    };
  }
}
__name(createCompletionItemPython, "createCompletionItemPython");
export {
  LspCompletionProviderAddon,
  createCompletionItemPython
};
//# sourceMappingURL=lspCompletionProviderAddon.js.map
