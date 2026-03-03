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
const FILTER_THRESHOLD = 10;
let CloudModelPicker = class CloudModelPicker2 extends Disposable {
  static {
    __name(this, "CloudModelPicker");
  }
  get selectedModel() {
    return this._selectedModel;
  }
  constructor(actionWidgetService) {
    super();
    this.actionWidgetService = actionWidgetService;
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this._renderDisposables = this._register(new DisposableStore());
    this._sessionDisposables = this._register(new DisposableStore());
    this._models = [];
  }
  /**
   * Sets the remote session and loads the available models from it.
   */
  setSession(session) {
    this._session = session;
    this._sessionDisposables.clear();
    this._loadModels(session);
    if (this._selectedModel) {
      session.setModelId(this._selectedModel.id);
      session.setOptionValue("models", { id: this._selectedModel.id, name: this._selectedModel.name });
    }
    this._sessionDisposables.add(session.onDidChangeOptionGroups(() => {
      this._loadModels(session);
    }));
  }
  /**
   * Renders the model picker trigger button into the given container.
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
  _loadModels(session) {
    const modelOption = session.getModelOptionGroup();
    if (modelOption?.group.items.length) {
      this._models = modelOption.group.items.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description
      }));
      if (!this._selectedModel || !this._models.some((m) => m.id === this._selectedModel.id)) {
        const value = modelOption.value;
        this._selectedModel = value ? { id: value.id, name: value.name, description: value.description } : this._models[0];
      }
    } else {
      this._models = [];
    }
    this._updateTriggerLabel();
  }
  _showPicker() {
    if (!this._triggerElement || this.actionWidgetService.isVisible || this._models.length === 0) {
      return;
    }
    const items = this._buildItems();
    const showFilter = items.filter(
      (i) => i.kind === "action"
      /* ActionListItemKind.Action */
    ).length > FILTER_THRESHOLD;
    const triggerElement = this._triggerElement;
    const delegate = {
      onSelect: /* @__PURE__ */ __name((item) => {
        this.actionWidgetService.hide();
        this._selectModel(item);
      }, "onSelect"),
      onHide: /* @__PURE__ */ __name(() => {
        triggerElement.focus();
      }, "onHide")
    };
    this.actionWidgetService.show("remoteModelPicker", false, items, delegate, this._triggerElement, void 0, [], {
      getAriaLabel: /* @__PURE__ */ __name((item) => item.label ?? "", "getAriaLabel"),
      getWidgetAriaLabel: /* @__PURE__ */ __name(() => localize("modelPicker.ariaLabel", "Model Picker"), "getWidgetAriaLabel")
    }, showFilter ? { showFilter: true, filterPlaceholder: localize("modelPicker.filter", "Filter models...") } : void 0);
  }
  _buildItems() {
    return this._models.map((model) => ({
      kind: "action",
      label: model.name,
      group: { title: "", icon: this._selectedModel?.id === model.id ? Codicon.check : Codicon.blank },
      item: model
    }));
  }
  _selectModel(item) {
    this._selectedModel = item;
    this._updateTriggerLabel();
    if (this._session) {
      this._session.setModelId(item.id);
      this._session.setOptionValue("models", { id: item.id, name: item.name });
    }
    this._onDidChange.fire({ id: item.id, name: item.name, description: item.description });
  }
  _updateTriggerLabel() {
    if (!this._triggerElement) {
      return;
    }
    dom.clearNode(this._triggerElement);
    const label = this._selectedModel?.name ?? localize("modelPicker.auto", "Auto");
    const labelSpan = dom.append(this._triggerElement, dom.$("span.sessions-chat-dropdown-label"));
    labelSpan.textContent = label;
    dom.append(this._triggerElement, renderIcon(Codicon.chevronDown));
    this._slotElement?.classList.toggle("disabled", this._models.length === 0);
  }
};
CloudModelPicker = __decorate([
  __param(0, IActionWidgetService)
], CloudModelPicker);
export {
  CloudModelPicker
};
//# sourceMappingURL=modelPicker.js.map
