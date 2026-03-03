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
import { Range } from "../../../../../../editor/common/core/range.js";
import { localize } from "../../../../../../nls.js";
import { ILanguageModelToolsService } from "../../tools/languageModelToolsService.js";
import { getPromptsTypeForLanguageId, PromptsType } from "../promptTypes.js";
import { IPromptsService } from "../service/promptsService.js";
import { parseCommaSeparatedList, PromptHeaderAttributes } from "../promptFileParser.js";
import { Lazy } from "../../../../../../base/common/lazy.js";
import { LEGACY_MODE_FILE_EXTENSION } from "../config/promptFileLocations.js";
import { IFileService } from "../../../../../../platform/files/common/files.js";
import { getTarget, isVSCodeOrDefaultTarget, MARKERS_OWNER_ID } from "./promptValidator.js";
import { IMarkerService } from "../../../../../../platform/markers/common/markers.js";
import { CodeActionKind } from "../../../../../../editor/contrib/codeAction/common/types.js";
let PromptCodeActionProvider = class PromptCodeActionProvider2 {
  static {
    __name(this, "PromptCodeActionProvider");
  }
  constructor(promptsService, languageModelToolsService, fileService, markerService) {
    this.promptsService = promptsService;
    this.languageModelToolsService = languageModelToolsService;
    this.fileService = fileService;
    this.markerService = markerService;
    this._debugDisplayName = "PromptCodeActionProvider";
  }
  async provideCodeActions(model, range, context, token) {
    const promptType = getPromptsTypeForLanguageId(model.getLanguageId());
    if (!promptType || promptType === PromptsType.instructions) {
      return void 0;
    }
    const result = [];
    const promptAST = this.promptsService.getParsedPromptFile(model);
    switch (promptType) {
      case PromptsType.agent:
        this.getUpdateToolsCodeActions(promptAST, promptType, model, range, result);
        await this.getMigrateModeFileCodeActions(model, result);
        break;
      case PromptsType.prompt:
        this.getUpdateModeCodeActions(promptAST, model, range, result);
        this.getUpdateToolsCodeActions(promptAST, promptType, model, range, result);
        break;
    }
    if (result.length === 0) {
      return void 0;
    }
    return {
      actions: result,
      dispose: /* @__PURE__ */ __name(() => {
      }, "dispose")
    };
  }
  getMarkers(model, range) {
    const markers = this.markerService.read({ resource: model.uri, owner: MARKERS_OWNER_ID });
    return markers.filter((marker) => range.containsRange(marker));
  }
  createCodeAction(model, range, title, edits) {
    return {
      title,
      edit: { edits },
      ranges: [range],
      diagnostics: this.getMarkers(model, range),
      kind: CodeActionKind.QuickFix.value
    };
  }
  getUpdateModeCodeActions(promptFile, model, range, result) {
    const modeAttr = promptFile.header?.getAttribute(PromptHeaderAttributes.mode);
    if (!modeAttr?.range.containsRange(range)) {
      return;
    }
    const keyRange = new Range(modeAttr.range.startLineNumber, modeAttr.range.startColumn, modeAttr.range.startLineNumber, modeAttr.range.startColumn + modeAttr.key.length);
    result.push(this.createCodeAction(model, keyRange, localize("renameToAgent", "Rename to 'agent'"), [asWorkspaceTextEdit(model, { range: keyRange, text: "agent" })]));
  }
  async getMigrateModeFileCodeActions(model, result) {
    if (model.uri.path.endsWith(LEGACY_MODE_FILE_EXTENSION)) {
      const location = this.promptsService.getAgentFileURIFromModeFile(model.uri);
      if (location && await this.fileService.canMove(model.uri, location)) {
        const edit = { oldResource: model.uri, newResource: location, options: { overwrite: false, copy: false } };
        result.push(this.createCodeAction(model, new Range(1, 1, 1, 4), localize("migrateToAgent", "Migrate to custom agent file"), [edit]));
      }
    }
  }
  getUpdateToolsCodeActions(promptFile, promptType, model, range, result) {
    if (!promptFile.header) {
      return;
    }
    const toolsAttr = promptFile.header.getAttribute(PromptHeaderAttributes.tools);
    if (!toolsAttr || !toolsAttr.value.range.containsRange(range)) {
      return;
    }
    const target = getTarget(promptType, promptFile.header);
    if (!isVSCodeOrDefaultTarget(target)) {
      return;
    }
    let value = toolsAttr.value;
    if (value.type === "scalar") {
      value = parseCommaSeparatedList(value);
    }
    if (value.type !== "sequence") {
      return;
    }
    const values = value.items;
    const deprecatedNames = new Lazy(() => this.languageModelToolsService.getDeprecatedFullReferenceNames());
    const edits = [];
    for (const item of values) {
      if (item.type !== "scalar") {
        continue;
      }
      const newNames = deprecatedNames.value.get(item.value);
      if (newNames && newNames.size > 0) {
        const quote = model.getValueInRange(new Range(item.range.startLineNumber, item.range.startColumn, item.range.endLineNumber, item.range.startColumn + 1));
        if (newNames.size === 1) {
          const newName = Array.from(newNames)[0];
          const text = quote === `'` || quote === '"' ? quote + newName + quote : newName;
          const edit = { range: item.range, text };
          edits.push(edit);
          if (item.range.containsRange(range)) {
            result.push(this.createCodeAction(model, item.range, localize("updateToolName", "Update to '{0}'", newName), [asWorkspaceTextEdit(model, edit)]));
          }
        } else {
          const newNamesArray = Array.from(newNames).sort((a, b) => a.localeCompare(b));
          const separator = model.getValueInRange(new Range(item.range.startLineNumber, item.range.endColumn, item.range.endLineNumber, item.range.endColumn + 2));
          const useCommaSpace = separator.includes(",");
          const delimiterText = useCommaSpace ? ", " : ",";
          const newNamesText = newNamesArray.map((name) => quote === `'` || quote === '"' ? quote + name + quote : name).join(delimiterText);
          const edit = { range: item.range, text: newNamesText };
          edits.push(edit);
          if (item.range.containsRange(range)) {
            result.push(this.createCodeAction(model, item.range, localize("expandToolNames", "Expand to {0} tools", newNames.size), [asWorkspaceTextEdit(model, edit)]));
          }
        }
      }
    }
    if (edits.length && result.length === 0 || edits.length > 1) {
      result.push(this.createCodeAction(model, value.range, localize("updateAllToolNames", "Update all tool names"), edits.map((edit) => asWorkspaceTextEdit(model, edit))));
    }
  }
};
PromptCodeActionProvider = __decorate([
  __param(0, IPromptsService),
  __param(1, ILanguageModelToolsService),
  __param(2, IFileService),
  __param(3, IMarkerService)
], PromptCodeActionProvider);
function asWorkspaceTextEdit(model, textEdit) {
  return {
    versionId: model.getVersionId(),
    resource: model.uri,
    textEdit
  };
}
__name(asWorkspaceTextEdit, "asWorkspaceTextEdit");
export {
  PromptCodeActionProvider
};
//# sourceMappingURL=promptCodeActions.js.map
