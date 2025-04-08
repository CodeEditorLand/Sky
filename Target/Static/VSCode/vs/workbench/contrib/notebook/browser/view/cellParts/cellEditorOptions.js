var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter, Event } from "../../../../../../base/common/event.js";
import { URI } from "../../../../../../base/common/uri.js";
import { IEditorOptions } from "../../../../../../editor/common/config/editorOptions.js";
import { localize, localize2 } from "../../../../../../nls.js";
import { Action2, MenuId, registerAction2 } from "../../../../../../platform/actions/common/actions.js";
import { IConfigurationService } from "../../../../../../platform/configuration/common/configuration.js";
import { Extensions as ConfigurationExtensions, IConfigurationRegistry } from "../../../../../../platform/configuration/common/configurationRegistry.js";
import { ContextKeyExpr } from "../../../../../../platform/contextkey/common/contextkey.js";
import { ServicesAccessor } from "../../../../../../platform/instantiation/common/instantiation.js";
import { Registry } from "../../../../../../platform/registry/common/platform.js";
import { ActiveEditorContext } from "../../../../../common/contextkeys.js";
import { INotebookCellToolbarActionContext, INotebookCommandContext, NotebookMultiCellAction, NOTEBOOK_ACTIONS_CATEGORY } from "../../controller/coreActions.js";
import { IBaseCellEditorOptions, ICellViewModel } from "../../notebookBrowser.js";
import { NOTEBOOK_CELL_LINE_NUMBERS, NOTEBOOK_EDITOR_FOCUSED } from "../../../common/notebookContextKeys.js";
import { CellContentPart } from "../cellPart.js";
import { NotebookCellInternalMetadata, NOTEBOOK_EDITOR_ID } from "../../../common/notebookCommon.js";
import { NotebookOptions } from "../../notebookOptions.js";
import { CellViewModelStateChangeEvent } from "../../notebookViewEvents.js";
import { ITextModelUpdateOptions } from "../../../../../../editor/common/model.js";
class CellEditorOptions extends CellContentPart {
  constructor(base, notebookOptions, configurationService) {
    super();
    this.base = base;
    this.notebookOptions = notebookOptions;
    this.configurationService = configurationService;
    this._register(base.onDidChange(() => {
      this._recomputeOptions();
    }));
    this._value = this._computeEditorOptions();
  }
  static {
    __name(this, "CellEditorOptions");
  }
  _lineNumbers = "inherit";
  _tabSize;
  _indentSize;
  _insertSpaces;
  set tabSize(value) {
    if (this._tabSize !== value) {
      this._tabSize = value;
      this._onDidChange.fire();
    }
  }
  get tabSize() {
    return this._tabSize;
  }
  set indentSize(value) {
    if (this._indentSize !== value) {
      this._indentSize = value;
      this._onDidChange.fire();
    }
  }
  get indentSize() {
    return this._indentSize;
  }
  set insertSpaces(value) {
    if (this._insertSpaces !== value) {
      this._insertSpaces = value;
      this._onDidChange.fire();
    }
  }
  get insertSpaces() {
    return this._insertSpaces;
  }
  _onDidChange = this._register(new Emitter());
  onDidChange = this._onDidChange.event;
  _value;
  updateState(element, e) {
    if (e.cellLineNumberChanged) {
      this.setLineNumbers(element.lineNumbers);
    }
  }
  _recomputeOptions() {
    this._value = this._computeEditorOptions();
    this._onDidChange.fire();
  }
  _computeEditorOptions() {
    const value = this.base.value;
    const cellEditorOverridesRaw = this.notebookOptions.getDisplayOptions().editorOptionsCustomizations;
    const indentSize = cellEditorOverridesRaw?.["editor.indentSize"];
    if (indentSize !== void 0) {
      this.indentSize = indentSize;
    }
    const insertSpaces = cellEditorOverridesRaw?.["editor.insertSpaces"];
    if (insertSpaces !== void 0) {
      this.insertSpaces = insertSpaces;
    }
    const tabSize = cellEditorOverridesRaw?.["editor.tabSize"];
    if (tabSize !== void 0) {
      this.tabSize = tabSize;
    }
    let cellRenderLineNumber = value.lineNumbers;
    switch (this._lineNumbers) {
      case "inherit":
        if (this.configurationService.getValue("notebook.lineNumbers") === "on") {
          if (value.lineNumbers === "off") {
            cellRenderLineNumber = "on";
          }
        } else {
          cellRenderLineNumber = "off";
        }
        break;
      case "on":
        if (value.lineNumbers === "off") {
          cellRenderLineNumber = "on";
        }
        break;
      case "off":
        cellRenderLineNumber = "off";
        break;
    }
    const overrides = {};
    if (value.lineNumbers !== cellRenderLineNumber) {
      overrides.lineNumbers = cellRenderLineNumber;
    }
    if (this.notebookOptions.getLayoutConfiguration().disableRulers) {
      overrides.rulers = [];
    }
    return {
      ...value,
      ...overrides
    };
  }
  getUpdatedValue(internalMetadata, cellUri) {
    const options = this.getValue(internalMetadata, cellUri);
    delete options.hover;
    return options;
  }
  getValue(internalMetadata, cellUri) {
    return {
      ...this._value,
      ...{
        padding: this.notebookOptions.computeEditorPadding(internalMetadata, cellUri)
      }
    };
  }
  getDefaultValue() {
    return {
      ...this._value,
      ...{
        padding: { top: 12, bottom: 12 }
      }
    };
  }
  setLineNumbers(lineNumbers) {
    this._lineNumbers = lineNumbers;
    this._recomputeOptions();
  }
}
Registry.as(ConfigurationExtensions.Configuration).registerConfiguration({
  id: "notebook",
  order: 100,
  type: "object",
  "properties": {
    "notebook.lineNumbers": {
      type: "string",
      enum: ["off", "on"],
      default: "off",
      markdownDescription: localize("notebook.lineNumbers", "Controls the display of line numbers in the cell editor.")
    }
  }
});
registerAction2(class ToggleLineNumberAction extends Action2 {
  static {
    __name(this, "ToggleLineNumberAction");
  }
  constructor() {
    super({
      id: "notebook.toggleLineNumbers",
      title: localize2("notebook.toggleLineNumbers", "Toggle Notebook Line Numbers"),
      precondition: NOTEBOOK_EDITOR_FOCUSED,
      menu: [
        {
          id: MenuId.NotebookToolbar,
          group: "notebookLayout",
          order: 2,
          when: ContextKeyExpr.equals("config.notebook.globalToolbar", true)
        }
      ],
      category: NOTEBOOK_ACTIONS_CATEGORY,
      f1: true,
      toggled: {
        condition: ContextKeyExpr.notEquals("config.notebook.lineNumbers", "off"),
        title: localize("notebook.showLineNumbers", "Notebook Line Numbers")
      }
    });
  }
  async run(accessor) {
    const configurationService = accessor.get(IConfigurationService);
    const renderLiNumbers = configurationService.getValue("notebook.lineNumbers") === "on";
    if (renderLiNumbers) {
      configurationService.updateValue("notebook.lineNumbers", "off");
    } else {
      configurationService.updateValue("notebook.lineNumbers", "on");
    }
  }
});
registerAction2(class ToggleActiveLineNumberAction extends NotebookMultiCellAction {
  static {
    __name(this, "ToggleActiveLineNumberAction");
  }
  constructor() {
    super({
      id: "notebook.cell.toggleLineNumbers",
      title: localize("notebook.cell.toggleLineNumbers.title", "Show Cell Line Numbers"),
      precondition: ActiveEditorContext.isEqualTo(NOTEBOOK_EDITOR_ID),
      menu: [{
        id: MenuId.NotebookCellTitle,
        group: "View",
        order: 1
      }],
      toggled: ContextKeyExpr.or(
        NOTEBOOK_CELL_LINE_NUMBERS.isEqualTo("on"),
        ContextKeyExpr.and(NOTEBOOK_CELL_LINE_NUMBERS.isEqualTo("inherit"), ContextKeyExpr.equals("config.notebook.lineNumbers", "on"))
      )
    });
  }
  async runWithContext(accessor, context) {
    if (context.ui) {
      this.updateCell(accessor.get(IConfigurationService), context.cell);
    } else {
      const configurationService = accessor.get(IConfigurationService);
      context.selectedCells.forEach((cell) => {
        this.updateCell(configurationService, cell);
      });
    }
  }
  updateCell(configurationService, cell) {
    const renderLineNumbers = configurationService.getValue("notebook.lineNumbers") === "on";
    const cellLineNumbers = cell.lineNumbers;
    const currentLineNumberIsOn = cellLineNumbers === "on" || cellLineNumbers === "inherit" && renderLineNumbers;
    if (currentLineNumberIsOn) {
      cell.lineNumbers = "off";
    } else {
      cell.lineNumbers = "on";
    }
  }
});
export {
  CellEditorOptions
};
//# sourceMappingURL=cellEditorOptions.js.map
