var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { matchesFuzzy } from "../../../../base/common/filters.js";
import { localize } from "../../../../nls.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { PickerQuickAccessProvider } from "../../../../platform/quickinput/browser/pickerQuickAccess.js";
import { IViewsService } from "../../../services/views/common/viewsService.js";
import { DEBUG_CONSOLE_QUICK_ACCESS_PREFIX, SELECT_AND_START_ID } from "./debugCommands.js";
import { IDebugService, REPL_VIEW_ID } from "../common/debug.js";
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
let DebugConsoleQuickAccess = class DebugConsoleQuickAccess2 extends PickerQuickAccessProvider {
  static {
    __name(this, "DebugConsoleQuickAccess");
  }
  constructor(_debugService, _viewsService, _commandService) {
    super(DEBUG_CONSOLE_QUICK_ACCESS_PREFIX, { canAcceptInBackground: true });
    this._debugService = _debugService;
    this._viewsService = _viewsService;
    this._commandService = _commandService;
  }
  _getPicks(filter, disposables, token) {
    const debugConsolePicks = [];
    this._debugService.getModel().getSessions(true).filter((s) => s.hasSeparateRepl()).forEach((session, index) => {
      const pick = this._createPick(session, index, filter);
      if (pick) {
        debugConsolePicks.push(pick);
      }
    });
    if (debugConsolePicks.length > 0) {
      debugConsolePicks.push({ type: "separator" });
    }
    const createTerminalLabel = localize("workbench.action.debug.startDebug", "Start a New Debug Session");
    debugConsolePicks.push({
      label: `$(plus) ${createTerminalLabel}`,
      ariaLabel: createTerminalLabel,
      accept: /* @__PURE__ */ __name(() => this._commandService.executeCommand(SELECT_AND_START_ID), "accept")
    });
    return debugConsolePicks;
  }
  _createPick(session, sessionIndex, filter) {
    const label = session.name;
    const highlights = matchesFuzzy(filter, label, true);
    if (highlights) {
      return {
        label,
        highlights: { label: highlights },
        accept: /* @__PURE__ */ __name((keyMod, event) => {
          this._debugService.focusStackFrame(void 0, void 0, session, { explicit: true });
          if (!this._viewsService.isViewVisible(REPL_VIEW_ID)) {
            this._viewsService.openView(REPL_VIEW_ID, true);
          }
        }, "accept")
      };
    }
    return void 0;
  }
};
DebugConsoleQuickAccess = __decorate([
  __param(0, IDebugService),
  __param(1, IViewsService),
  __param(2, ICommandService)
], DebugConsoleQuickAccess);
export {
  DebugConsoleQuickAccess
};
//# sourceMappingURL=debugConsoleQuickAccess.js.map
