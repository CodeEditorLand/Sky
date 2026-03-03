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
import { Disposable } from "../../../../../../base/common/lifecycle.js";
import { autorun } from "../../../../../../base/common/observable.js";
import { localize } from "../../../../../../nls.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../../../platform/keybinding/common/keybinding.js";
import { OPEN_CELL_FAILURE_ACTIONS_COMMAND_ID } from "./cellDiagnosticsActions.js";
import { NotebookStatusBarController } from "../cellStatusBar/executionStatusBarItemController.js";
import { registerNotebookContribution } from "../../notebookEditorExtensions.js";
import { CodeCellViewModel } from "../../viewModel/codeCellViewModel.js";
import { IChatAgentService } from "../../../../chat/common/participants/chatAgents.js";
import { ChatAgentLocation } from "../../../../chat/common/constants.js";
let DiagnosticCellStatusBarContrib = class DiagnosticCellStatusBarContrib2 extends Disposable {
  static {
    __name(this, "DiagnosticCellStatusBarContrib");
  }
  static {
    this.id = "workbench.notebook.statusBar.diagtnostic";
  }
  constructor(notebookEditor, instantiationService) {
    super();
    this._register(new NotebookStatusBarController(notebookEditor, (vm, cell) => cell instanceof CodeCellViewModel ? instantiationService.createInstance(DiagnosticCellStatusBarItem, vm, cell) : Disposable.None));
  }
};
DiagnosticCellStatusBarContrib = __decorate([
  __param(1, IInstantiationService)
], DiagnosticCellStatusBarContrib);
registerNotebookContribution(DiagnosticCellStatusBarContrib.id, DiagnosticCellStatusBarContrib);
let DiagnosticCellStatusBarItem = class DiagnosticCellStatusBarItem2 extends Disposable {
  static {
    __name(this, "DiagnosticCellStatusBarItem");
  }
  constructor(_notebookViewModel, cell, keybindingService, chatAgentService) {
    super();
    this._notebookViewModel = _notebookViewModel;
    this.cell = cell;
    this.keybindingService = keybindingService;
    this.chatAgentService = chatAgentService;
    this._currentItemIds = [];
    this._register(autorun((reader) => this.updateSparkleItem(reader.readObservable(cell.executionErrorDiagnostic))));
  }
  hasNotebookAgent() {
    const agents = this.chatAgentService.getAgents();
    return !!agents.find((agent) => agent.locations.includes(ChatAgentLocation.Notebook));
  }
  async updateSparkleItem(error) {
    let item;
    if (error?.location && this.hasNotebookAgent()) {
      const tooltip = this.keybindingService.appendKeybinding(localize("notebook.cell.status.diagnostic", "Quick Actions"), OPEN_CELL_FAILURE_ACTIONS_COMMAND_ID);
      item = {
        text: `$(sparkle)`,
        tooltip,
        alignment: 1,
        command: OPEN_CELL_FAILURE_ACTIONS_COMMAND_ID,
        priority: Number.MAX_SAFE_INTEGER - 1
      };
    }
    const items = item ? [item] : [];
    this._currentItemIds = this._notebookViewModel.deltaCellStatusBarItems(this._currentItemIds, [{ handle: this.cell.handle, items }]);
  }
  dispose() {
    super.dispose();
    this._notebookViewModel.deltaCellStatusBarItems(this._currentItemIds, [{ handle: this.cell.handle, items: [] }]);
  }
};
DiagnosticCellStatusBarItem = __decorate([
  __param(2, IKeybindingService),
  __param(3, IChatAgentService)
], DiagnosticCellStatusBarItem);
export {
  DiagnosticCellStatusBarContrib
};
//# sourceMappingURL=diagnosticCellStatusBarContrib.js.map
