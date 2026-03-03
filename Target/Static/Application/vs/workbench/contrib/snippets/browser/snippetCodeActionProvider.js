var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = function(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
};
var SurroundWithSnippetCodeActionProvider_1, FileTemplateCodeActionProvider_1;
import { DisposableStore } from "../../../../base/common/lifecycle.js";
import { Selection } from "../../../../editor/common/core/selection.js";
import { ILanguageFeaturesService } from "../../../../editor/common/services/languageFeatures.js";
import { CodeActionKind } from "../../../../editor/contrib/codeAction/common/types.js";
import { localize } from "../../../../nls.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ApplyFileSnippetAction } from "./commands/fileTemplateSnippets.js";
import { getSurroundableSnippets, SurroundWithSnippetEditorAction } from "./commands/surroundWithSnippet.js";
import { ISnippetsService } from "./snippets.js";
let SurroundWithSnippetCodeActionProvider = class SurroundWithSnippetCodeActionProvider2 {
  static {
    __name(this, "SurroundWithSnippetCodeActionProvider");
  }
  static {
    SurroundWithSnippetCodeActionProvider_1 = this;
  }
  static {
    this._MAX_CODE_ACTIONS = 4;
  }
  static {
    this._overflowCommandCodeAction = {
      kind: CodeActionKind.SurroundWith.value,
      title: localize("more", "More..."),
      command: {
        id: SurroundWithSnippetEditorAction.options.id,
        title: SurroundWithSnippetEditorAction.options.title.value
      }
    };
  }
  constructor(_snippetService) {
    this._snippetService = _snippetService;
  }
  async provideCodeActions(model, range) {
    if (range.isEmpty()) {
      return void 0;
    }
    const position = Selection.isISelection(range) ? range.getPosition() : range.getStartPosition();
    const snippets = await getSurroundableSnippets(this._snippetService, model, position, false);
    if (!snippets.length) {
      return void 0;
    }
    const actions = [];
    for (const snippet of snippets) {
      if (actions.length >= SurroundWithSnippetCodeActionProvider_1._MAX_CODE_ACTIONS) {
        actions.push(SurroundWithSnippetCodeActionProvider_1._overflowCommandCodeAction);
        break;
      }
      actions.push({
        title: localize("codeAction", "{0}", snippet.name),
        kind: CodeActionKind.SurroundWith.value,
        edit: asWorkspaceEdit(model, range, snippet)
      });
    }
    return {
      actions,
      dispose() {
      }
    };
  }
};
SurroundWithSnippetCodeActionProvider = SurroundWithSnippetCodeActionProvider_1 = __decorate([
  __param(0, ISnippetsService)
], SurroundWithSnippetCodeActionProvider);
let FileTemplateCodeActionProvider = class FileTemplateCodeActionProvider2 {
  static {
    __name(this, "FileTemplateCodeActionProvider");
  }
  static {
    FileTemplateCodeActionProvider_1 = this;
  }
  static {
    this._MAX_CODE_ACTIONS = 4;
  }
  static {
    this._overflowCommandCodeAction = {
      title: localize("overflow.start.title", "Start with Snippet"),
      kind: CodeActionKind.SurroundWith.value,
      command: {
        id: ApplyFileSnippetAction.Id,
        title: ""
      }
    };
  }
  constructor(_snippetService) {
    this._snippetService = _snippetService;
    this.providedCodeActionKinds = [CodeActionKind.SurroundWith.value];
  }
  async provideCodeActions(model) {
    if (model.getValueLength() !== 0) {
      return void 0;
    }
    const snippets = await this._snippetService.getSnippets(model.getLanguageId(), model.uri, { fileTemplateSnippets: true, includeNoPrefixSnippets: true });
    const actions = [];
    for (const snippet of snippets) {
      if (actions.length >= FileTemplateCodeActionProvider_1._MAX_CODE_ACTIONS) {
        actions.push(FileTemplateCodeActionProvider_1._overflowCommandCodeAction);
        break;
      }
      actions.push({
        title: localize("title", "Start with: {0}", snippet.name),
        kind: CodeActionKind.SurroundWith.value,
        edit: asWorkspaceEdit(model, model.getFullModelRange(), snippet)
      });
    }
    return {
      actions,
      dispose() {
      }
    };
  }
};
FileTemplateCodeActionProvider = FileTemplateCodeActionProvider_1 = __decorate([
  __param(0, ISnippetsService)
], FileTemplateCodeActionProvider);
function asWorkspaceEdit(model, range, snippet) {
  return {
    edits: [{
      versionId: model.getVersionId(),
      resource: model.uri,
      textEdit: {
        range,
        text: snippet.body,
        insertAsSnippet: true
      }
    }]
  };
}
__name(asWorkspaceEdit, "asWorkspaceEdit");
let SnippetCodeActions = class SnippetCodeActions2 {
  static {
    __name(this, "SnippetCodeActions");
  }
  constructor(instantiationService, languageFeaturesService, configService) {
    this._store = new DisposableStore();
    const setting = "editor.snippets.codeActions.enabled";
    const sessionStore = new DisposableStore();
    const update = /* @__PURE__ */ __name(() => {
      sessionStore.clear();
      if (configService.getValue(setting)) {
        sessionStore.add(languageFeaturesService.codeActionProvider.register("*", instantiationService.createInstance(SurroundWithSnippetCodeActionProvider)));
        sessionStore.add(languageFeaturesService.codeActionProvider.register("*", instantiationService.createInstance(FileTemplateCodeActionProvider)));
      }
    }, "update");
    update();
    this._store.add(configService.onDidChangeConfiguration((e) => e.affectsConfiguration(setting) && update()));
    this._store.add(sessionStore);
  }
  dispose() {
    this._store.dispose();
  }
};
SnippetCodeActions = __decorate([
  __param(0, IInstantiationService),
  __param(1, ILanguageFeaturesService),
  __param(2, IConfigurationService)
], SnippetCodeActions);
export {
  SnippetCodeActions
};
//# sourceMappingURL=snippetCodeActionProvider.js.map
