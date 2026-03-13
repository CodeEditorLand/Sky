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
import { Codicon } from "../../../../../../base/common/codicons.js";
import { ThemeIcon } from "../../../../../../base/common/themables.js";
import { localize } from "../../../../../../nls.js";
import { IActionWidgetService } from "../../../../../../platform/actionWidget/browser/actionWidget.js";
import { IContextKeyService } from "../../../../../../platform/contextkey/common/contextkey.js";
import { IKeybindingService } from "../../../../../../platform/keybinding/common/keybinding.js";
import { ITelemetryService } from "../../../../../../platform/telemetry/common/telemetry.js";
import { ChatConfiguration, ChatPermissionLevel } from "../../../common/constants.js";
import { IConfigurationService } from "../../../../../../platform/configuration/common/configuration.js";
import { IDialogService } from "../../../../../../platform/dialogs/common/dialogs.js";
import Severity from "../../../../../../base/common/severity.js";
import { MarkdownString } from "../../../../../../base/common/htmlContent.js";
import { ChatInputPickerActionViewItem } from "./chatInputPickerActionItem.js";
const shownWarnings = /* @__PURE__ */ new Set();
function hasShownElevatedWarning(level) {
  if (shownWarnings.has(level)) {
    return true;
  }
  if (level === ChatPermissionLevel.AutoApprove && shownWarnings.has(ChatPermissionLevel.Autopilot)) {
    return true;
  }
  return false;
}
__name(hasShownElevatedWarning, "hasShownElevatedWarning");
let PermissionPickerActionItem = class PermissionPickerActionItem2 extends ChatInputPickerActionViewItem {
  static {
    __name(this, "PermissionPickerActionItem");
  }
  constructor(action, delegate, pickerOptions, actionWidgetService, keybindingService, contextKeyService, telemetryService, configurationService, dialogService) {
    const isAutoApprovePolicyRestricted = /* @__PURE__ */ __name(() => configurationService.inspect(ChatConfiguration.GlobalAutoApprove).policyValue === false, "isAutoApprovePolicyRestricted");
    const isAutopilotEnabled = /* @__PURE__ */ __name(() => configurationService.getValue(ChatConfiguration.AutopilotEnabled) !== false, "isAutopilotEnabled");
    const actionProvider = {
      getActions: /* @__PURE__ */ __name(() => {
        const currentLevel = delegate.currentPermissionLevel.get();
        const policyRestricted = isAutoApprovePolicyRestricted();
        const actions = [
          {
            ...action,
            id: "chat.permissions.default",
            label: localize("permissions.default", "Default Approvals"),
            description: localize("permissions.default.subtext", "Copilot uses your configured settings"),
            icon: ThemeIcon.fromId(Codicon.shield.id),
            checked: currentLevel === ChatPermissionLevel.Default,
            tooltip: "",
            hover: {
              content: localize("permissions.default.description", "Use configured approval settings"),
              position: pickerOptions.hoverPosition
            },
            run: /* @__PURE__ */ __name(async () => {
              delegate.setPermissionLevel(ChatPermissionLevel.Default);
              if (this.element) {
                this.renderLabel(this.element);
              }
            }, "run")
          },
          {
            ...action,
            id: "chat.permissions.autoApprove",
            label: localize("permissions.autoApprove", "Bypass Approvals"),
            description: localize("permissions.autoApprove.subtext", "All tool calls are auto-approved"),
            icon: ThemeIcon.fromId(Codicon.warning.id),
            checked: currentLevel === ChatPermissionLevel.AutoApprove,
            enabled: !policyRestricted,
            tooltip: policyRestricted ? localize("permissions.autoApprove.policyDisabled", "Disabled by enterprise policy") : "",
            hover: {
              content: policyRestricted ? localize("permissions.autoApprove.policyDescription", "Disabled by enterprise policy") : localize("permissions.autoApprove.description", "Auto-approve all tool calls and retry on errors"),
              position: pickerOptions.hoverPosition
            },
            run: /* @__PURE__ */ __name(async () => {
              if (!hasShownElevatedWarning(ChatPermissionLevel.AutoApprove)) {
                const result = await this.dialogService.prompt({
                  type: Severity.Warning,
                  message: localize("permissions.autoApprove.warning.title", "Enable Bypass Approvals?"),
                  buttons: [
                    {
                      label: localize("permissions.autoApprove.warning.confirm", "Enable"),
                      run: /* @__PURE__ */ __name(() => true, "run")
                    },
                    {
                      label: localize("permissions.autoApprove.warning.cancel", "Cancel"),
                      run: /* @__PURE__ */ __name(() => false, "run")
                    }
                  ],
                  custom: {
                    icon: Codicon.warning,
                    markdownDetails: [{
                      markdown: new MarkdownString(localize("permissions.autoApprove.warning.detail", "Bypass Approvals will auto-approve all tool calls without asking for confirmation. This includes file edits, terminal commands, and external tool calls."))
                    }]
                  }
                });
                if (result.result !== true) {
                  return;
                }
                shownWarnings.add(ChatPermissionLevel.AutoApprove);
              }
              delegate.setPermissionLevel(ChatPermissionLevel.AutoApprove);
              if (this.element) {
                this.renderLabel(this.element);
              }
            }, "run")
          }
        ];
        if (isAutopilotEnabled()) {
          actions.push({
            ...action,
            id: "chat.permissions.autopilot",
            label: localize("permissions.autopilot", "Autopilot (Preview)"),
            description: localize("permissions.autopilot.subtext", "Autonomously iterates from start to finish"),
            icon: ThemeIcon.fromId(Codicon.rocket.id),
            checked: currentLevel === ChatPermissionLevel.Autopilot,
            enabled: !policyRestricted,
            tooltip: policyRestricted ? localize("permissions.autopilot.policyDisabled", "Disabled by enterprise policy") : "",
            hover: {
              content: policyRestricted ? localize("permissions.autopilot.policyDescription", "Disabled by enterprise policy") : localize("permissions.autopilot.description", "Auto-approve all tool calls and continue until the task is done"),
              position: pickerOptions.hoverPosition
            },
            run: /* @__PURE__ */ __name(async () => {
              if (!hasShownElevatedWarning(ChatPermissionLevel.Autopilot)) {
                const result = await this.dialogService.prompt({
                  type: Severity.Warning,
                  message: localize("permissions.autopilot.warning.title", "Enable Autopilot?"),
                  buttons: [
                    {
                      label: localize("permissions.autopilot.warning.confirm", "Enable"),
                      run: /* @__PURE__ */ __name(() => true, "run")
                    },
                    {
                      label: localize("permissions.autopilot.warning.cancel", "Cancel"),
                      run: /* @__PURE__ */ __name(() => false, "run")
                    }
                  ],
                  custom: {
                    icon: Codicon.rocket,
                    markdownDetails: [{
                      markdown: new MarkdownString(localize("permissions.autopilot.warning.detail", "Autopilot will auto-approve all tool calls and continue working autonomously until the task is complete. The agent will make decisions on your behalf without asking for confirmation.\n\nYou can stop the agent at any time by clicking the stop button. This applies to the current session only."))
                    }]
                  }
                });
                if (result.result !== true) {
                  return;
                }
                shownWarnings.add(ChatPermissionLevel.Autopilot);
              }
              delegate.setPermissionLevel(ChatPermissionLevel.Autopilot);
              if (this.element) {
                this.renderLabel(this.element);
              }
            }, "run")
          });
        }
        return actions;
      }, "getActions")
    };
    super(action, {
      actionProvider,
      reporter: { id: "ChatPermissionPicker", name: "ChatPermissionPicker", includeOptions: true },
      listOptions: { descriptionBelow: true, minWidth: 255 }
    }, pickerOptions, actionWidgetService, keybindingService, contextKeyService, telemetryService);
    this.delegate = delegate;
    this.dialogService = dialogService;
  }
  renderLabel(element) {
    this.setAriaLabelAttributes(element);
    const level = this.delegate.currentPermissionLevel.get();
    let icon;
    let label;
    switch (level) {
      case ChatPermissionLevel.Autopilot:
        icon = Codicon.rocket;
        label = localize("permissions.autopilot.label", "Autopilot (Preview)");
        break;
      case ChatPermissionLevel.AutoApprove:
        icon = Codicon.warning;
        label = localize("permissions.autoApprove.label", "Bypass Approvals");
        break;
      default:
        icon = Codicon.shield;
        label = localize("permissions.default.label", "Default Approvals");
        break;
    }
    const labelElements = [];
    labelElements.push(...renderLabelWithIcons(`$(${icon.id})`));
    labelElements.push(dom.$("span.chat-input-picker-label", void 0, label));
    labelElements.push(...renderLabelWithIcons(`$(chevron-down)`));
    dom.reset(element, ...labelElements);
    element.classList.toggle("warning", level === ChatPermissionLevel.Autopilot);
    element.classList.toggle("info", level === ChatPermissionLevel.AutoApprove);
    return null;
  }
  refresh() {
    if (this.element) {
      this.renderLabel(this.element);
    }
  }
};
PermissionPickerActionItem = __decorate([
  __param(3, IActionWidgetService),
  __param(4, IKeybindingService),
  __param(5, IContextKeyService),
  __param(6, ITelemetryService),
  __param(7, IConfigurationService),
  __param(8, IDialogService)
], PermissionPickerActionItem);
export {
  PermissionPickerActionItem
};
//# sourceMappingURL=permissionPickerActionItem.js.map
