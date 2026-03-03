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
const COPILOT_WORKTREE_PATTERN = "copilot-worktree-";
const FILTER_THRESHOLD = 10;
let BranchPicker = class BranchPicker2 extends Disposable {
  static {
    __name(this, "BranchPicker");
  }
  get selectedBranch() {
    return this._selectedBranch;
  }
  constructor(actionWidgetService) {
    super();
    this.actionWidgetService = actionWidgetService;
    this._branches = [];
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this._onDidChangeLoading = this._register(new Emitter());
    this.onDidChangeLoading = this._onDidChangeLoading.event;
    this._renderDisposables = this._register(new DisposableStore());
  }
  /**
   * Sets the new session that this picker writes to.
   */
  setNewSession(session) {
    this._newSession = session;
  }
  /**
   * Sets the git repository and loads its branches.
   * When undefined, the picker is shown disabled.
   */
  async setRepository(repository) {
    this._branches = [];
    this._selectedBranch = void 0;
    if (!repository) {
      this._newSession?.setBranch(void 0);
      this._setLoading(false);
      this._updateTriggerLabel();
      return;
    }
    this._setLoading(true);
    try {
      const refs = await repository.getRefs({ pattern: "refs/heads" });
      this._branches = refs.map((ref) => ref.name).filter((name) => !!name).filter((name) => !name.includes(COPILOT_WORKTREE_PATTERN));
      const defaultBranch = this._branches.find((b) => b === repository.state.get().HEAD?.name) ?? this._branches.find((b) => b === "main") ?? this._branches.find((b) => b === "master") ?? this._branches[0];
      if (defaultBranch) {
        this._selectBranch(defaultBranch);
      }
    } finally {
      this._setLoading(false);
      this._updateTriggerLabel();
    }
  }
  /**
   * Renders the branch picker trigger into the given container.
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
      this.showPicker();
    }));
    this._renderDisposables.add(dom.addDisposableListener(trigger, dom.EventType.KEY_DOWN, (e) => {
      if (e.key === "Enter" || e.key === " ") {
        dom.EventHelper.stop(e, true);
        this.showPicker();
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
  /**
   * Shows the branch picker dropdown anchored to the trigger element.
   */
  showPicker() {
    if (!this._triggerElement || this.actionWidgetService.isVisible || this._branches.length === 0) {
      return;
    }
    const items = this._buildItems();
    const triggerElement = this._triggerElement;
    const delegate = {
      onSelect: /* @__PURE__ */ __name((item) => {
        this.actionWidgetService.hide();
        this._selectBranch(item.name);
      }, "onSelect"),
      onHide: /* @__PURE__ */ __name(() => {
        triggerElement.focus();
      }, "onHide")
    };
    const totalActions = items.filter(
      (i) => i.kind === "action"
      /* ActionListItemKind.Action */
    ).length;
    this.actionWidgetService.show("branchPicker", false, items, delegate, this._triggerElement, void 0, [], {
      getAriaLabel: /* @__PURE__ */ __name((item) => item.label ?? "", "getAriaLabel"),
      getWidgetAriaLabel: /* @__PURE__ */ __name(() => localize("branchPicker.ariaLabel", "Branch Picker"), "getWidgetAriaLabel")
    }, totalActions > FILTER_THRESHOLD ? { showFilter: true, filterPlaceholder: localize("branchPicker.filter", "Filter branches...") } : void 0);
  }
  _buildItems() {
    return this._branches.map((branch) => ({
      kind: "action",
      label: branch,
      group: { title: "", icon: Codicon.gitBranch },
      item: { name: branch }
    }));
  }
  _selectBranch(branch) {
    if (this._selectedBranch !== branch) {
      this._selectedBranch = branch;
      this._newSession?.setBranch(branch);
      this._onDidChange.fire(branch);
      this._updateTriggerLabel();
    }
  }
  _updateTriggerLabel() {
    if (!this._triggerElement) {
      return;
    }
    dom.clearNode(this._triggerElement);
    const isDisabled = this._branches.length === 0;
    const label = this._selectedBranch ?? localize("branchPicker.select", "Branch");
    dom.append(this._triggerElement, renderIcon(Codicon.gitBranch));
    const labelSpan = dom.append(this._triggerElement, dom.$("span.sessions-chat-dropdown-label"));
    labelSpan.textContent = label;
    dom.append(this._triggerElement, renderIcon(Codicon.chevronDown));
    this._slotElement?.classList.toggle("disabled", isDisabled);
  }
  _setLoading(loading) {
    this._onDidChangeLoading.fire(loading);
  }
};
BranchPicker = __decorate([
  __param(0, IActionWidgetService)
], BranchPicker);
export {
  BranchPicker
};
//# sourceMappingURL=branchPicker.js.map
