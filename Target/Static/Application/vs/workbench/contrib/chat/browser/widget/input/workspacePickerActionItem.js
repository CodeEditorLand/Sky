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
import * as dom from "../../../../../../base/browser/dom.js";
import { renderLabelWithIcons } from "../../../../../../base/browser/ui/iconLabel/iconLabels.js";
import { basename } from "../../../../../../base/common/resources.js";
import { localize } from "../../../../../../nls.js";
import { IActionWidgetService } from "../../../../../../platform/actionWidget/browser/actionWidget.js";
import { ICommandService } from "../../../../../../platform/commands/common/commands.js";
import { IContextKeyService } from "../../../../../../platform/contextkey/common/contextkey.js";
import { IKeybindingService } from "../../../../../../platform/keybinding/common/keybinding.js";
import { ITelemetryService } from "../../../../../../platform/telemetry/common/telemetry.js";
import { ChatInputPickerActionViewItem } from "./chatInputPickerActionItem.js";
let WorkspacePickerActionItem = class WorkspacePickerActionItem2 extends ChatInputPickerActionViewItem {
  static {
    __name(this, "WorkspacePickerActionItem");
  }
  constructor(action, delegate, pickerOptions, actionWidgetService, keybindingService, contextKeyService, commandService, telemetryService) {
    const actionProvider = {
      getActions: /* @__PURE__ */ __name(() => {
        const currentWorkspace = this.delegate.getSelectedWorkspace();
        const workspaces = this.delegate.getWorkspaces();
        const actions = workspaces.map((workspace) => ({
          ...action,
          id: `workspace.${workspace.uri.toString()}`,
          label: workspace.label,
          checked: currentWorkspace?.uri.toString() === workspace.uri.toString(),
          icon: workspace.isFolder ? { id: "folder" } : { id: "file-symlink-directory" },
          enabled: true,
          tooltip: workspace.uri.fsPath,
          run: /* @__PURE__ */ __name(async () => {
            this.delegate.setSelectedWorkspace(workspace);
            if (this.element) {
              this.renderLabel(this.element);
            }
          }, "run")
        }));
        actions.push({
          ...action,
          id: "workspace.openFolder",
          label: localize("openFolder", "Open Folder..."),
          checked: false,
          enabled: true,
          tooltip: localize("openFolderTooltip", "Open Folder..."),
          run: /* @__PURE__ */ __name(async () => {
            this.commandService.executeCommand(this.delegate.openFolderCommand);
          }, "run")
        });
        return actions;
      }, "getActions")
    };
    const actionBarActionProvider = {
      getActions: /* @__PURE__ */ __name(() => [], "getActions")
    };
    const workspacePickerOptions = {
      actionProvider,
      actionBarActionProvider,
      showItemKeybindings: false,
      reporter: { id: "ChatWorkspacePicker", name: "ChatWorkspacePicker", includeOptions: false }
    };
    super(action, workspacePickerOptions, pickerOptions, actionWidgetService, keybindingService, contextKeyService, telemetryService);
    this.delegate = delegate;
    this.commandService = commandService;
    this._register(this.delegate.onDidChangeSelectedWorkspace(() => {
      if (this.element) {
        this.renderLabel(this.element);
      }
    }));
    this._register(this.delegate.onDidChangeWorkspaces(() => {
      if (this.element) {
        this.renderLabel(this.element);
      }
    }));
  }
  renderLabel(element) {
    this.setAriaLabelAttributes(element);
    const currentWorkspace = this.delegate.getSelectedWorkspace();
    const labelElements = [];
    if (currentWorkspace) {
      const label = currentWorkspace.label || basename(currentWorkspace.uri);
      labelElements.push(...renderLabelWithIcons(`$(folder)`));
      labelElements.push(dom.$("span.chat-input-picker-label", void 0, label));
    } else {
      labelElements.push(...renderLabelWithIcons(`$(folder)`));
      labelElements.push(dom.$("span.chat-input-picker-label", void 0, localize("selectWorkspace", "Workspace")));
    }
    labelElements.push(...renderLabelWithIcons(`$(chevron-down)`));
    dom.reset(element, ...labelElements);
    return null;
  }
};
WorkspacePickerActionItem = __decorate([
  __param(3, IActionWidgetService),
  __param(4, IKeybindingService),
  __param(5, IContextKeyService),
  __param(6, ICommandService),
  __param(7, ITelemetryService)
], WorkspacePickerActionItem);
export {
  WorkspacePickerActionItem
};
//# sourceMappingURL=workspacePickerActionItem.js.map
