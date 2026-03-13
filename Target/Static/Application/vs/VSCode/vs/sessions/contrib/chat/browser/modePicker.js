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
import { renderIcon } from "../../../../base/browser/ui/iconLabel/iconLabels.js";
import { ChatMode, IChatModeService } from "../../../../workbench/contrib/chat/common/chatModes.js";
import { IChatSessionsService } from "../../../../workbench/contrib/chat/common/chatSessionsService.js";
import { AgentSessionProviders } from "../../../../workbench/contrib/chat/browser/agentSessions/agentSessions.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { Target } from "../../../../workbench/contrib/chat/common/promptSyntax/promptTypes.js";
import { AICustomizationManagementCommands } from "../../../../workbench/contrib/chat/browser/aiCustomization/aiCustomizationManagement.js";
let ModePicker = class ModePicker2 extends Disposable {
  static {
    __name(this, "ModePicker");
  }
  get selectedMode() {
    return this._selectedMode;
  }
  constructor(actionWidgetService, chatModeService, chatSessionsService, commandService) {
    super();
    this.actionWidgetService = actionWidgetService;
    this.chatModeService = chatModeService;
    this.chatSessionsService = chatSessionsService;
    this.commandService = commandService;
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this._renderDisposables = this._register(new DisposableStore());
    this._selectedMode = ChatMode.Agent;
    this._register(this.chatModeService.onDidChangeChatModes(() => {
      if (this._triggerElement) {
        this._updateTriggerLabel();
      }
    }));
  }
  /**
   * Sets the git repository. When the repository changes, resets the selected mode
   * back to the default Agent mode.
   */
  setRepository(repository) {
    this._selectedMode = ChatMode.Agent;
    this._updateTriggerLabel();
  }
  /**
   * Renders the mode picker trigger button into the given container.
   */
  render(container) {
    this._renderDisposables.clear();
    const slot = dom.append(container, dom.$(".sessions-chat-picker-slot"));
    this._slotElement = slot;
    this._renderDisposables.add({ dispose: /* @__PURE__ */ __name(() => slot.remove(), "dispose") });
    const trigger = dom.append(slot, dom.$("a.action-label"));
    trigger.tabIndex = 0;
    trigger.role = "button";
    trigger.setAttribute("aria-label", localize("sessions.modePicker.ariaLabel", "Select chat mode"));
    this._triggerElement = trigger;
    this._updateTriggerLabel();
    this._renderDisposables.add(dom.addDisposableListener(trigger, dom.EventType.CLICK, (e) => {
      dom.EventHelper.stop(e, true);
      this._showPicker();
    }));
    this._renderDisposables.add(dom.addDisposableListener(trigger, dom.EventType.KEY_DOWN, (e) => {
      if (e.key === "Enter" || e.key === " ") {
        dom.EventHelper.stop(e, true);
        this._showPicker();
      }
    }));
    return slot;
  }
  /**
   * Shows or hides the picker.
   */
  setVisible(visible) {
    if (this._slotElement) {
      this._slotElement.style.display = visible ? "" : "none";
    }
  }
  _getAvailableModes() {
    const customAgentTarget = this.chatSessionsService.getCustomAgentTargetForSessionType(AgentSessionProviders.Background);
    const effectiveTarget = customAgentTarget && customAgentTarget !== Target.Undefined ? customAgentTarget : Target.GitHubCopilot;
    const modes = this.chatModeService.getModes();
    const result = [ChatMode.Agent];
    for (const mode of modes.custom) {
      const target = mode.target.get();
      if (target === effectiveTarget || target === Target.Undefined) {
        const visibility = mode.visibility?.get();
        if (visibility && !visibility.userInvocable) {
          continue;
        }
        result.push(mode);
      }
    }
    return result;
  }
  _showPicker() {
    if (!this._triggerElement || this.actionWidgetService.isVisible) {
      return;
    }
    const modes = this._getAvailableModes();
    const items = this._buildItems(modes);
    const triggerElement = this._triggerElement;
    const delegate = {
      onSelect: /* @__PURE__ */ __name((item) => {
        this.actionWidgetService.hide();
        if (item.kind === "mode") {
          this._selectMode(item.mode);
        } else {
          this.commandService.executeCommand(AICustomizationManagementCommands.OpenEditor);
        }
      }, "onSelect"),
      onHide: /* @__PURE__ */ __name(() => {
        triggerElement.focus();
      }, "onHide")
    };
    this.actionWidgetService.show("localModePicker", false, items, delegate, this._triggerElement, void 0, [], {
      getAriaLabel: /* @__PURE__ */ __name((item) => item.label ?? "", "getAriaLabel"),
      getWidgetAriaLabel: /* @__PURE__ */ __name(() => localize("modePicker.ariaLabel", "Mode Picker"), "getWidgetAriaLabel")
    });
  }
  _buildItems(modes) {
    const items = [];
    const agentMode = modes[0];
    items.push({
      kind: "action",
      label: agentMode.label.get(),
      group: { title: "", icon: this._selectedMode.id === agentMode.id ? Codicon.check : Codicon.blank },
      item: { kind: "mode", mode: agentMode }
    });
    const customModes = modes.slice(1);
    if (customModes.length > 0) {
      items.push({ kind: "separator", label: "" });
      for (const mode of customModes) {
        items.push({
          kind: "action",
          label: mode.label.get(),
          group: { title: "", icon: this._selectedMode.id === mode.id ? Codicon.check : Codicon.blank },
          item: { kind: "mode", mode }
        });
      }
    }
    items.push({ kind: "separator", label: "" });
    items.push({
      kind: "action",
      label: localize("configureCustomAgents", "Configure Custom Agents..."),
      group: { title: "", icon: Codicon.blank },
      item: { kind: "configure" }
    });
    return items;
  }
  _selectMode(mode) {
    this._selectedMode = mode;
    this._updateTriggerLabel();
    this._onDidChange.fire(mode);
  }
  _updateTriggerLabel() {
    if (!this._triggerElement) {
      return;
    }
    dom.clearNode(this._triggerElement);
    const icon = this._selectedMode.icon.get();
    if (icon) {
      dom.append(this._triggerElement, renderIcon(icon));
    }
    const labelSpan = dom.append(this._triggerElement, dom.$("span.sessions-chat-dropdown-label"));
    labelSpan.textContent = this._selectedMode.label.get();
    dom.append(this._triggerElement, renderIcon(Codicon.chevronDown));
    const modes = this._getAvailableModes();
    this._slotElement?.classList.toggle("disabled", modes.length <= 1);
  }
};
ModePicker = __decorate([
  __param(0, IActionWidgetService),
  __param(1, IChatModeService),
  __param(2, IChatSessionsService),
  __param(3, ICommandService)
], ModePicker);
export {
  ModePicker
};
//# sourceMappingURL=modePicker.js.map
