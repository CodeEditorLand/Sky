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
import * as dom from "../../../../base/browser/dom.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { Emitter } from "../../../../base/common/event.js";
import { Disposable, DisposableStore } from "../../../../base/common/lifecycle.js";
import { localize } from "../../../../nls.js";
import { IActionWidgetService } from "../../../../platform/actionWidget/browser/actionWidget.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import { renderIcon } from "../../../../base/browser/ui/iconLabel/iconLabels.js";
import { ChatConfiguration, ChatPermissionLevel } from "../../../../workbench/contrib/chat/common/constants.js";
import Severity from "../../../../base/common/severity.js";
import { MarkdownString } from "../../../../base/common/htmlContent.js";
const shownWarnings = /* @__PURE__ */ new Set();
let NewChatPermissionPicker = class NewChatPermissionPicker2 extends Disposable {
  static {
    __name(this, "NewChatPermissionPicker");
  }
  get permissionLevel() {
    return this._currentLevel;
  }
  constructor(actionWidgetService, configurationService, dialogService) {
    super();
    this.actionWidgetService = actionWidgetService;
    this.configurationService = configurationService;
    this.dialogService = dialogService;
    this._onDidChangeLevel = this._register(new Emitter());
    this.onDidChangeLevel = this._onDidChangeLevel.event;
    this._currentLevel = ChatPermissionLevel.Default;
    this._renderDisposables = this._register(new DisposableStore());
  }
  render(container) {
    this._renderDisposables.clear();
    const slot = dom.append(container, dom.$(".sessions-chat-picker-slot"));
    this._container = slot;
    this._renderDisposables.add({ dispose: /* @__PURE__ */ __name(() => slot.remove(), "dispose") });
    const trigger = dom.append(slot, dom.$("a.action-label"));
    trigger.tabIndex = 0;
    trigger.role = "button";
    this._triggerElement = trigger;
    this._updateTriggerLabel(trigger);
    this._renderDisposables.add(dom.addDisposableListener(trigger, dom.EventType.CLICK, (e) => {
      dom.EventHelper.stop(e, true);
      this.showPicker();
    }));
    this._renderDisposables.add(dom.addDisposableListener(trigger, dom.EventType.KEY_DOWN, (e) => {
      if (e.key === "Enter" || e.key === " ") {
        dom.EventHelper.stop(e, true);
        this.showPicker();
      }
    }));
    return slot;
  }
  setVisible(visible) {
    if (this._container) {
      this._container.style.display = visible ? "" : "none";
    }
  }
  showPicker() {
    if (!this._triggerElement || this.actionWidgetService.isVisible) {
      return;
    }
    const policyRestricted = this.configurationService.inspect(ChatConfiguration.GlobalAutoApprove).policyValue === false;
    const isAutopilotEnabled = this.configurationService.getValue(ChatConfiguration.AutopilotEnabled) !== false;
    const items = [
      {
        kind: "action",
        group: { kind: "header", title: "", icon: Codicon.shield },
        item: {
          level: ChatPermissionLevel.Default,
          label: localize("permissions.default", "Default Approvals"),
          icon: Codicon.shield,
          checked: this._currentLevel === ChatPermissionLevel.Default
        },
        label: localize("permissions.default", "Default Approvals"),
        description: localize("permissions.default.subtext", "Copilot uses your configured settings"),
        disabled: false
      },
      {
        kind: "action",
        group: { kind: "header", title: "", icon: Codicon.warning },
        item: {
          level: ChatPermissionLevel.AutoApprove,
          label: localize("permissions.autoApprove", "Bypass Approvals"),
          icon: Codicon.warning,
          checked: this._currentLevel === ChatPermissionLevel.AutoApprove
        },
        label: localize("permissions.autoApprove", "Bypass Approvals"),
        description: localize("permissions.autoApprove.subtext", "All tool calls are auto-approved"),
        disabled: policyRestricted
      }
    ];
    if (isAutopilotEnabled) {
      items.push({
        kind: "action",
        group: { kind: "header", title: "", icon: Codicon.rocket },
        item: {
          level: ChatPermissionLevel.Autopilot,
          label: localize("permissions.autopilot", "Autopilot (Preview)"),
          icon: Codicon.rocket,
          checked: this._currentLevel === ChatPermissionLevel.Autopilot
        },
        label: localize("permissions.autopilot", "Autopilot (Preview)"),
        description: localize("permissions.autopilot.subtext", "Autonomously iterates from start to finish"),
        disabled: policyRestricted
      });
    }
    const triggerElement = this._triggerElement;
    const delegate = {
      onSelect: /* @__PURE__ */ __name(async (item) => {
        this.actionWidgetService.hide();
        await this._selectLevel(item.level);
      }, "onSelect"),
      onHide: /* @__PURE__ */ __name(() => {
        triggerElement.focus();
      }, "onHide")
    };
    this.actionWidgetService.show("permissionPicker", false, items, delegate, this._triggerElement, void 0, [], {
      getAriaLabel: /* @__PURE__ */ __name((item) => item.label ?? "", "getAriaLabel"),
      getWidgetAriaLabel: /* @__PURE__ */ __name(() => localize("permissionPicker.ariaLabel", "Permission Picker"), "getWidgetAriaLabel")
    });
  }
  async _selectLevel(level) {
    if (level === ChatPermissionLevel.AutoApprove && !shownWarnings.has(ChatPermissionLevel.AutoApprove)) {
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
    if (level === ChatPermissionLevel.Autopilot && !shownWarnings.has(ChatPermissionLevel.Autopilot)) {
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
    this._currentLevel = level;
    this._updateTriggerLabel(this._triggerElement);
    this._onDidChangeLevel.fire(level);
  }
  _updateTriggerLabel(trigger) {
    if (!trigger) {
      return;
    }
    dom.clearNode(trigger);
    let icon;
    let label;
    switch (this._currentLevel) {
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
    dom.append(trigger, renderIcon(icon));
    const labelSpan = dom.append(trigger, dom.$("span.sessions-chat-dropdown-label"));
    labelSpan.textContent = label;
    dom.append(trigger, renderIcon(Codicon.chevronDown));
  }
};
NewChatPermissionPicker = __decorate([
  __param(0, IActionWidgetService),
  __param(1, IConfigurationService),
  __param(2, IDialogService)
], NewChatPermissionPicker);
export {
  NewChatPermissionPicker
};
//# sourceMappingURL=newChatPermissionPicker.js.map
