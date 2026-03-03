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
var ReplEditorInput_1;
import { ITextModelService } from "../../../../editor/common/services/resolverService.js";
import { ITextResourceConfigurationService } from "../../../../editor/common/services/textResourceConfiguration.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IFileDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { ILabelService } from "../../../../platform/label/common/label.js";
import { IInteractiveHistoryService } from "../../interactive/browser/interactiveHistoryService.js";
import { CellKind, NotebookSetting } from "../../notebook/common/notebookCommon.js";
import { NotebookEditorInput } from "../../notebook/common/notebookEditorInput.js";
import { INotebookEditorModelResolverService } from "../../notebook/common/notebookEditorModelResolverService.js";
import { INotebookService } from "../../notebook/common/notebookService.js";
import { ICustomEditorLabelService } from "../../../services/editor/common/customEditorLabelService.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.js";
import { IFilesConfigurationService } from "../../../services/filesConfiguration/common/filesConfigurationService.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { localize } from "../../../../nls.js";
import { registerIcon } from "../../../../platform/theme/common/iconRegistry.js";
import { IWorkbenchEnvironmentService } from "../../../services/environment/common/environmentService.js";
import { IPathService } from "../../../services/path/common/pathService.js";
const replTabIcon = registerIcon("repl-editor-label-icon", Codicon.debugLineByLine, localize("replEditorLabelIcon", "Icon of the REPL editor label."));
let ReplEditorInput = class ReplEditorInput2 extends NotebookEditorInput {
  static {
    __name(this, "ReplEditorInput");
  }
  static {
    ReplEditorInput_1 = this;
  }
  static {
    this.ID = "workbench.editorinputs.replEditorInput";
  }
  constructor(resource, label, _notebookService, _notebookModelResolverService, _fileDialogService, labelService, fileService, filesConfigurationService, extensionService, editorService, textResourceConfigurationService, customEditorLabelService, historyService, _textModelService, configurationService, environmentService, pathService) {
    super(resource, void 0, "jupyter-notebook", {}, _notebookService, _notebookModelResolverService, _fileDialogService, labelService, fileService, filesConfigurationService, extensionService, editorService, textResourceConfigurationService, customEditorLabelService, environmentService, pathService);
    this.historyService = historyService;
    this._textModelService = _textModelService;
    this.isDisposing = false;
    this.isScratchpad = resource.scheme === "untitled" && configurationService.getValue(NotebookSetting.InteractiveWindowPromptToSave) !== true;
    this.label = label ?? this.createEditorLabel(resource);
  }
  getIcon() {
    return replTabIcon;
  }
  createEditorLabel(resource) {
    if (!resource) {
      return "REPL";
    }
    if (resource.scheme === "untitled") {
      const match = new RegExp("Untitled-(\\d+).").exec(resource.path);
      if (match?.length === 2) {
        return `REPL - ${match[1]}`;
      }
    }
    const filename = resource.path.split("/").pop();
    return filename ? `REPL - ${filename}` : "REPL";
  }
  get typeId() {
    return ReplEditorInput_1.ID;
  }
  get editorId() {
    return "repl";
  }
  getName() {
    return this.label;
  }
  get editorInputs() {
    return [this];
  }
  get capabilities() {
    const capabilities = super.capabilities;
    const scratchPad = this.isScratchpad ? 512 : 0;
    return capabilities | 2 | scratchPad;
  }
  async resolve() {
    const model = await super.resolve();
    if (model) {
      this.ensureInputBoxCell(model.notebook);
    }
    return model;
  }
  ensureInputBoxCell(notebook) {
    const lastCell = notebook.cells[notebook.cells.length - 1];
    if (!lastCell || lastCell.cellKind === CellKind.Markup || lastCell.outputs.length > 0 || lastCell.internalMetadata.executionOrder !== void 0) {
      notebook.applyEdits([
        {
          editType: 1,
          index: notebook.cells.length,
          count: 0,
          cells: [
            {
              cellKind: CellKind.Code,
              language: "python",
              mime: void 0,
              outputs: [],
              source: ""
            }
          ]
        }
      ], true, void 0, () => void 0, void 0, false);
    }
  }
  async resolveInput(notebook) {
    if (this.inputModelRef) {
      return this.inputModelRef.object.textEditorModel;
    }
    const lastCell = notebook.cells[notebook.cells.length - 1];
    if (!lastCell) {
      throw new Error("The REPL editor requires at least one cell for the input box.");
    }
    this.inputModelRef = await this._textModelService.createModelReference(lastCell.uri);
    return this.inputModelRef.object.textEditorModel;
  }
  dispose() {
    if (!this.isDisposing) {
      this.isDisposing = true;
      this.editorModelReference?.object.revert({ soft: true });
      this.inputModelRef?.dispose();
      super.dispose();
    }
  }
};
ReplEditorInput = ReplEditorInput_1 = __decorate([
  __param(2, INotebookService),
  __param(3, INotebookEditorModelResolverService),
  __param(4, IFileDialogService),
  __param(5, ILabelService),
  __param(6, IFileService),
  __param(7, IFilesConfigurationService),
  __param(8, IExtensionService),
  __param(9, IEditorService),
  __param(10, ITextResourceConfigurationService),
  __param(11, ICustomEditorLabelService),
  __param(12, IInteractiveHistoryService),
  __param(13, ITextModelService),
  __param(14, IConfigurationService),
  __param(15, IWorkbenchEnvironmentService),
  __param(16, IPathService)
], ReplEditorInput);
export {
  ReplEditorInput
};
//# sourceMappingURL=replEditorInput.js.map
