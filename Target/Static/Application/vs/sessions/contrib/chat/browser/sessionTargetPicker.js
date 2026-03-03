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
import { Radio } from "../../../../base/browser/ui/radio/radio.js";
import { Emitter } from "../../../../base/common/event.js";
import { Disposable, DisposableStore } from "../../../../base/common/lifecycle.js";
import { renderIcon } from "../../../../base/browser/ui/iconLabel/iconLabels.js";
import { localize } from "../../../../nls.js";
import { IActionWidgetService } from "../../../../platform/actionWidget/browser/actionWidget.js";
import { AgentSessionProviders } from "../../../../workbench/contrib/chat/browser/agentSessions/agentSessions.js";
class SessionTargetPicker extends Disposable {
  static {
    __name(this, "SessionTargetPicker");
  }
  get selectedTarget() {
    return this._selectedTarget;
  }
  constructor(allowedTargets, defaultTarget) {
    super();
    this._onDidChangeTarget = this._register(new Emitter());
    this.onDidChangeTarget = this._onDidChangeTarget.event;
    this._renderDisposables = this._register(new DisposableStore());
    this._allowedTargets = allowedTargets;
    this._selectedTarget = allowedTargets.includes(defaultTarget) ? defaultTarget : allowedTargets[0];
  }
  /**
   * Renders the target radio (Local / Cloud) into the given container.
   */
  render(container) {
    this._container = container;
    this._renderRadio();
  }
  updateAllowedTargets(targets) {
    if (targets.length === 0) {
      return;
    }
    this._allowedTargets = targets;
    if (!targets.includes(this._selectedTarget)) {
      this._selectedTarget = targets[0];
      this._onDidChangeTarget.fire(this._selectedTarget);
    }
    if (this._container) {
      this._renderRadio();
    }
  }
  _renderRadio() {
    if (!this._container) {
      return;
    }
    this._renderDisposables.clear();
    dom.clearNode(this._container);
    if (this._allowedTargets.length === 0) {
      return;
    }
    const targets = [AgentSessionProviders.Background, AgentSessionProviders.Cloud].filter((t) => this._allowedTargets.includes(t));
    const activeIndex = targets.indexOf(this._selectedTarget);
    const radio = new Radio({
      items: targets.map((target) => ({
        text: getTargetLabel(target),
        isActive: target === this._selectedTarget
      }))
    });
    this._renderDisposables.add(radio);
    this._container.appendChild(radio.domNode);
    if (activeIndex >= 0) {
      radio.setActiveItem(activeIndex);
    }
    this._renderDisposables.add(radio.onDidSelect((index) => {
      const target = targets[index];
      if (this._selectedTarget !== target) {
        this._selectedTarget = target;
        this._onDidChangeTarget.fire(target);
      }
    }));
  }
}
function getTargetLabel(provider) {
  switch (provider) {
    case AgentSessionProviders.Local:
    case AgentSessionProviders.Background:
      return localize("chat.session.providerLabel.local", "Local");
    case AgentSessionProviders.Cloud:
      return localize("chat.session.providerLabel.cloud", "Cloud");
    case AgentSessionProviders.Claude:
      return "Claude";
    case AgentSessionProviders.Codex:
      return "Codex";
    case AgentSessionProviders.Growth:
      return "Growth";
  }
}
__name(getTargetLabel, "getTargetLabel");
let IsolationModePicker = class IsolationModePicker2 extends Disposable {
  static {
    __name(this, "IsolationModePicker");
  }
  get isolationMode() {
    return this._isolationMode;
  }
  constructor(actionWidgetService) {
    super();
    this.actionWidgetService = actionWidgetService;
    this._isolationMode = "worktree";
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this._renderDisposables = this._register(new DisposableStore());
  }
  /**
   * Sets the pending session that this picker writes to.
   */
  setNewSession(session) {
    this._newSession = session;
  }
  /**
   * Sets the git repository. When undefined, worktree option is hidden
   * and isolation mode falls back to 'workspace'.
   */
  setRepository(repository) {
    this._repository = repository;
    if (repository) {
      this._setMode("worktree");
    } else if (this._isolationMode === "worktree") {
      this._setMode("workspace");
    }
    this._updateTriggerLabel();
  }
  /**
   * Renders the isolation mode picker into the given container.
   */
  render(container) {
    this._renderDisposables.clear();
    const slot = dom.append(container, dom.$(".sessions-chat-picker-slot"));
    this._slotElement = slot;
    this._renderDisposables.add({ dispose: /* @__PURE__ */ __name(() => slot.remove(), "dispose") });
    const trigger = dom.append(slot, dom.$("a.action-label"));
    trigger.tabIndex = 0;
    trigger.role = "button";
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
  }
  /**
   * Shows or hides the picker.
   */
  setVisible(visible) {
    if (this._slotElement) {
      this._slotElement.style.display = visible ? "" : "none";
    }
  }
  _showPicker() {
    if (!this._triggerElement || this.actionWidgetService.isVisible || !this._repository) {
      return;
    }
    const items = [
      {
        kind: "action",
        label: localize("isolationMode.folder", "Folder"),
        group: { title: "", icon: Codicon.folder },
        item: "workspace"
      },
      {
        kind: "action",
        label: localize("isolationMode.worktree", "Worktree"),
        group: { title: "", icon: Codicon.worktree },
        item: "worktree"
      }
    ];
    const triggerElement = this._triggerElement;
    const delegate = {
      onSelect: /* @__PURE__ */ __name((mode) => {
        this.actionWidgetService.hide();
        this._setMode(mode);
      }, "onSelect"),
      onHide: /* @__PURE__ */ __name(() => {
        triggerElement.focus();
      }, "onHide")
    };
    this.actionWidgetService.show("isolationModePicker", false, items, delegate, this._triggerElement, void 0, [], {
      getAriaLabel: /* @__PURE__ */ __name((item) => item.label ?? "", "getAriaLabel"),
      getWidgetAriaLabel: /* @__PURE__ */ __name(() => localize("isolationModePicker.ariaLabel", "Isolation Mode"), "getWidgetAriaLabel")
    });
  }
  _setMode(mode) {
    if (this._isolationMode !== mode) {
      this._isolationMode = mode;
      this._newSession?.setIsolationMode(mode);
      this._onDidChange.fire(mode);
      this._updateTriggerLabel();
    }
  }
  _updateTriggerLabel() {
    if (!this._triggerElement) {
      return;
    }
    dom.clearNode(this._triggerElement);
    const isDisabled = !this._repository;
    const modeIcon = this._isolationMode === "worktree" ? Codicon.worktree : Codicon.folder;
    const modeLabel = this._isolationMode === "worktree" ? localize("isolationMode.worktree", "Worktree") : localize("isolationMode.folder", "Folder");
    dom.append(this._triggerElement, renderIcon(modeIcon));
    const labelSpan = dom.append(this._triggerElement, dom.$("span.sessions-chat-dropdown-label"));
    labelSpan.textContent = modeLabel;
    dom.append(this._triggerElement, renderIcon(Codicon.chevronDown));
    this._slotElement?.classList.toggle("disabled", isDisabled);
  }
};
IsolationModePicker = __decorate([
  __param(0, IActionWidgetService)
], IsolationModePicker);
export {
  IsolationModePicker,
  SessionTargetPicker
};
//# sourceMappingURL=sessionTargetPicker.js.map
