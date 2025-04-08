var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { EditorAction, ServicesAccessor, IActionOptions } from "../../../../editor/browser/editorExtensions.js";
import { grammarsExtPoint, ITMSyntaxExtensionPoint } from "../../../services/textMate/common/TMGrammars.js";
import { IExtensionService, ExtensionPointContribution } from "../../../services/extensions/common/extensions.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { ICodeEditor } from "../../../../editor/browser/editorBrowser.js";
class GrammarContributions {
  static {
    __name(this, "GrammarContributions");
  }
  static _grammars = {};
  constructor(contributions) {
    if (!Object.keys(GrammarContributions._grammars).length) {
      this.fillModeScopeMap(contributions);
    }
  }
  fillModeScopeMap(contributions) {
    contributions.forEach((contribution) => {
      contribution.value.forEach((grammar) => {
        if (grammar.language && grammar.scopeName) {
          GrammarContributions._grammars[grammar.language] = grammar.scopeName;
        }
      });
    });
  }
  getGrammar(mode) {
    return GrammarContributions._grammars[mode];
  }
}
class EmmetEditorAction extends EditorAction {
  static {
    __name(this, "EmmetEditorAction");
  }
  emmetActionName;
  constructor(opts) {
    super(opts);
    this.emmetActionName = opts.actionName;
  }
  static emmetSupportedModes = ["html", "css", "xml", "xsl", "haml", "jade", "jsx", "slim", "scss", "sass", "less", "stylus", "styl", "svg"];
  _lastGrammarContributions = null;
  _lastExtensionService = null;
  _withGrammarContributions(extensionService) {
    if (this._lastExtensionService !== extensionService) {
      this._lastExtensionService = extensionService;
      this._lastGrammarContributions = extensionService.readExtensionPointContributions(grammarsExtPoint).then((contributions) => {
        return new GrammarContributions(contributions);
      });
    }
    return this._lastGrammarContributions || Promise.resolve(null);
  }
  run(accessor, editor) {
    const extensionService = accessor.get(IExtensionService);
    const commandService = accessor.get(ICommandService);
    return this._withGrammarContributions(extensionService).then((grammarContributions) => {
      if (this.id === "editor.emmet.action.expandAbbreviation" && grammarContributions) {
        return commandService.executeCommand("emmet.expandAbbreviation", EmmetEditorAction.getLanguage(editor, grammarContributions));
      }
      return void 0;
    });
  }
  static getLanguage(editor, grammars) {
    const model = editor.getModel();
    const selection = editor.getSelection();
    if (!model || !selection) {
      return null;
    }
    const position = selection.getStartPosition();
    model.tokenization.tokenizeIfCheap(position.lineNumber);
    const languageId = model.getLanguageIdAtPosition(position.lineNumber, position.column);
    const syntax = languageId.split(".").pop();
    if (!syntax) {
      return null;
    }
    const checkParentMode = /* @__PURE__ */ __name(() => {
      const languageGrammar = grammars.getGrammar(syntax);
      if (!languageGrammar) {
        return syntax;
      }
      const languages = languageGrammar.split(".");
      if (languages.length < 2) {
        return syntax;
      }
      for (let i = 1; i < languages.length; i++) {
        const language = languages[languages.length - i];
        if (this.emmetSupportedModes.indexOf(language) !== -1) {
          return language;
        }
      }
      return syntax;
    }, "checkParentMode");
    return {
      language: syntax,
      parentMode: checkParentMode()
    };
  }
}
export {
  EmmetEditorAction
};
//# sourceMappingURL=emmetActions.js.map
