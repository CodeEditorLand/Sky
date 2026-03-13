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
var TerminalQuickAccessProvider_1;
import { localize } from "../../../../../nls.js";
import { PickerQuickAccessProvider, TriggerAction } from "../../../../../platform/quickinput/browser/pickerQuickAccess.js";
import { matchesFuzzy } from "../../../../../base/common/filters.js";
import { ITerminalEditorService, ITerminalGroupService, ITerminalService } from "../../../terminal/browser/terminal.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.js";
import { IThemeService } from "../../../../../platform/theme/common/themeService.js";
import { ThemeIcon } from "../../../../../base/common/themables.js";
import { killTerminalIcon, renameTerminalIcon } from "../../../terminal/browser/terminalIcons.js";
import { getColorClass, getIconId, getUriClasses } from "../../../terminal/browser/terminalIcon.js";
import { terminalStrings } from "../../../terminal/common/terminalStrings.js";
import { TerminalLocation } from "../../../../../platform/terminal/common/terminal.js";
import { IEditorService } from "../../../../services/editor/common/editorService.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
let terminalPicks = [];
let TerminalQuickAccessProvider = class TerminalQuickAccessProvider2 extends PickerQuickAccessProvider {
  static {
    __name(this, "TerminalQuickAccessProvider");
  }
  static {
    TerminalQuickAccessProvider_1 = this;
  }
  static {
    this.PREFIX = "term ";
  }
  constructor(_commandService, _editorService, _instantiationService, _terminalEditorService, _terminalGroupService, _terminalService, _themeService) {
    super(TerminalQuickAccessProvider_1.PREFIX, { canAcceptInBackground: true });
    this._commandService = _commandService;
    this._editorService = _editorService;
    this._instantiationService = _instantiationService;
    this._terminalEditorService = _terminalEditorService;
    this._terminalGroupService = _terminalGroupService;
    this._terminalService = _terminalService;
    this._themeService = _themeService;
  }
  _getPicks(filter) {
    terminalPicks = [];
    terminalPicks.push({ type: "separator", label: "panel" });
    const terminalGroups = this._terminalGroupService.groups;
    for (let groupIndex = 0; groupIndex < terminalGroups.length; groupIndex++) {
      const terminalGroup = terminalGroups[groupIndex];
      for (let terminalIndex = 0; terminalIndex < terminalGroup.terminalInstances.length; terminalIndex++) {
        const terminal = terminalGroup.terminalInstances[terminalIndex];
        const pick = this._createPick(terminal, terminalIndex, filter, { groupIndex, groupSize: terminalGroup.terminalInstances.length });
        if (pick) {
          terminalPicks.push(pick);
        }
      }
    }
    if (terminalPicks.length > 0) {
      terminalPicks.push({ type: "separator", label: "editor" });
    }
    const terminalEditors = this._terminalEditorService.instances;
    for (let editorIndex = 0; editorIndex < terminalEditors.length; editorIndex++) {
      const term = terminalEditors[editorIndex];
      term.target = TerminalLocation.Editor;
      const pick = this._createPick(term, editorIndex, filter);
      if (pick) {
        terminalPicks.push(pick);
      }
    }
    if (terminalPicks.length > 0) {
      terminalPicks.push({ type: "separator" });
    }
    const createTerminalLabel = localize("workbench.action.terminal.newplus", "Create New Terminal");
    terminalPicks.push({
      label: `$(plus) ${createTerminalLabel}`,
      ariaLabel: createTerminalLabel,
      accept: /* @__PURE__ */ __name(() => this._commandService.executeCommand(
        "workbench.action.terminal.new"
        /* TerminalCommandId.New */
      ), "accept")
    });
    const createWithProfileLabel = localize("workbench.action.terminal.newWithProfilePlus", "Create New Terminal With Profile...");
    terminalPicks.push({
      label: `$(plus) ${createWithProfileLabel}`,
      ariaLabel: createWithProfileLabel,
      accept: /* @__PURE__ */ __name(() => this._commandService.executeCommand(
        "workbench.action.terminal.newWithProfile"
        /* TerminalCommandId.NewWithProfile */
      ), "accept")
    });
    return terminalPicks;
  }
  _createPick(terminal, terminalIndex, filter, groupInfo) {
    const iconId = this._instantiationService.invokeFunction(getIconId, terminal);
    const index = groupInfo ? groupInfo.groupSize > 1 ? `${groupInfo.groupIndex + 1}.${terminalIndex + 1}` : `${groupInfo.groupIndex + 1}` : `${terminalIndex + 1}`;
    const label = `$(${iconId}) ${index}: ${terminal.title}`;
    const iconClasses = [];
    const colorClass = getColorClass(terminal);
    if (colorClass) {
      iconClasses.push(colorClass);
    }
    const uriClasses = getUriClasses(terminal, this._themeService.getColorTheme().type);
    if (uriClasses) {
      iconClasses.push(...uriClasses);
    }
    const highlights = matchesFuzzy(filter, label, true);
    if (highlights) {
      return {
        label,
        description: terminal.description,
        highlights: { label: highlights },
        buttons: [
          {
            iconClass: ThemeIcon.asClassName(renameTerminalIcon),
            tooltip: localize("renameTerminal", "Rename Terminal")
          },
          {
            iconClass: ThemeIcon.asClassName(killTerminalIcon),
            tooltip: terminalStrings.kill.value
          }
        ],
        iconClasses,
        trigger: /* @__PURE__ */ __name((buttonIndex) => {
          switch (buttonIndex) {
            case 0:
              this._commandService.executeCommand("workbench.action.terminal.rename", terminal);
              return TriggerAction.NO_ACTION;
            case 1:
              this._terminalService.safeDisposeTerminal(terminal);
              return TriggerAction.REMOVE_ITEM;
          }
          return TriggerAction.NO_ACTION;
        }, "trigger"),
        accept: /* @__PURE__ */ __name((keyMod, event) => {
          if (terminal.target === TerminalLocation.Editor) {
            const existingEditors = this._editorService.findEditors(terminal.resource);
            this._terminalEditorService.openEditor(terminal, { viewColumn: existingEditors?.[0].groupId });
            this._terminalEditorService.setActiveInstance(terminal);
          } else {
            this._terminalGroupService.showPanel(!event.inBackground);
            this._terminalGroupService.setActiveInstance(terminal);
          }
        }, "accept")
      };
    }
    return void 0;
  }
};
TerminalQuickAccessProvider = TerminalQuickAccessProvider_1 = __decorate([
  __param(0, ICommandService),
  __param(1, IEditorService),
  __param(2, IInstantiationService),
  __param(3, ITerminalEditorService),
  __param(4, ITerminalGroupService),
  __param(5, ITerminalService),
  __param(6, IThemeService)
], TerminalQuickAccessProvider);
export {
  TerminalQuickAccessProvider
};
//# sourceMappingURL=terminalQuickAccess.js.map
