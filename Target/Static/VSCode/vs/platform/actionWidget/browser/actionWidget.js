var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import * as dom from "../../../base/browser/dom.js";
import { ActionBar } from "../../../base/browser/ui/actionbar/actionbar.js";
import { IAnchor } from "../../../base/browser/ui/contextview/contextview.js";
import { IAction } from "../../../base/common/actions.js";
import { KeyCode, KeyMod } from "../../../base/common/keyCodes.js";
import { Disposable, DisposableStore, IDisposable, MutableDisposable } from "../../../base/common/lifecycle.js";
import "./actionWidget.css";
import { localize, localize2 } from "../../../nls.js";
import { acceptSelectedActionCommand, ActionList, IActionListDelegate, IActionListItem, previewSelectedActionCommand } from "./actionList.js";
import { Action2, registerAction2 } from "../../actions/common/actions.js";
import { IContextKeyService, RawContextKey } from "../../contextkey/common/contextkey.js";
import { IContextViewService } from "../../contextview/browser/contextView.js";
import { InstantiationType, registerSingleton } from "../../instantiation/common/extensions.js";
import { createDecorator, IInstantiationService, ServicesAccessor } from "../../instantiation/common/instantiation.js";
import { KeybindingWeight } from "../../keybinding/common/keybindingsRegistry.js";
import { inputActiveOptionBackground, registerColor } from "../../theme/common/colorRegistry.js";
registerColor(
  "actionBar.toggledBackground",
  inputActiveOptionBackground,
  localize("actionBar.toggledBackground", "Background color for toggled action items in action bar.")
);
const ActionWidgetContextKeys = {
  Visible: new RawContextKey("codeActionMenuVisible", false, localize("codeActionMenuVisible", "Whether the action widget list is visible"))
};
const IActionWidgetService = createDecorator("actionWidgetService");
let ActionWidgetService = class extends Disposable {
  constructor(_contextViewService, _contextKeyService, _instantiationService) {
    super();
    this._contextViewService = _contextViewService;
    this._contextKeyService = _contextKeyService;
    this._instantiationService = _instantiationService;
  }
  static {
    __name(this, "ActionWidgetService");
  }
  get isVisible() {
    return ActionWidgetContextKeys.Visible.getValue(this._contextKeyService) || false;
  }
  _list = this._register(new MutableDisposable());
  show(user, supportsPreview, items, delegate, anchor, container, actionBarActions) {
    const visibleContext = ActionWidgetContextKeys.Visible.bindTo(this._contextKeyService);
    const list = this._instantiationService.createInstance(ActionList, user, supportsPreview, items, delegate);
    this._contextViewService.showContextView({
      getAnchor: /* @__PURE__ */ __name(() => anchor, "getAnchor"),
      render: /* @__PURE__ */ __name((container2) => {
        visibleContext.set(true);
        return this._renderWidget(container2, list, actionBarActions ?? []);
      }, "render"),
      onHide: /* @__PURE__ */ __name((didCancel) => {
        visibleContext.reset();
        this._onWidgetClosed(didCancel);
      }, "onHide")
    }, container, false);
  }
  acceptSelected(preview) {
    this._list.value?.acceptSelected(preview);
  }
  focusPrevious() {
    this._list?.value?.focusPrevious();
  }
  focusNext() {
    this._list?.value?.focusNext();
  }
  hide(didCancel) {
    this._list.value?.hide(didCancel);
    this._list.clear();
  }
  clear() {
    this._list.clear();
  }
  _renderWidget(element, list, actionBarActions) {
    const widget = document.createElement("div");
    widget.classList.add("action-widget");
    element.appendChild(widget);
    this._list.value = list;
    if (this._list.value) {
      widget.appendChild(this._list.value.domNode);
    } else {
      throw new Error("List has no value");
    }
    const renderDisposables = new DisposableStore();
    const menuBlock = document.createElement("div");
    const block = element.appendChild(menuBlock);
    block.classList.add("context-view-block");
    renderDisposables.add(dom.addDisposableListener(block, dom.EventType.MOUSE_DOWN, (e) => e.stopPropagation()));
    const pointerBlockDiv = document.createElement("div");
    const pointerBlock = element.appendChild(pointerBlockDiv);
    pointerBlock.classList.add("context-view-pointerBlock");
    renderDisposables.add(dom.addDisposableListener(pointerBlock, dom.EventType.POINTER_MOVE, () => pointerBlock.remove()));
    renderDisposables.add(dom.addDisposableListener(pointerBlock, dom.EventType.MOUSE_DOWN, () => pointerBlock.remove()));
    let actionBarWidth = 0;
    if (actionBarActions.length) {
      const actionBar = this._createActionBar(".action-widget-action-bar", actionBarActions);
      if (actionBar) {
        widget.appendChild(actionBar.getContainer().parentElement);
        renderDisposables.add(actionBar);
        actionBarWidth = actionBar.getContainer().offsetWidth;
      }
    }
    const width = this._list.value?.layout(actionBarWidth);
    widget.style.width = `${width}px`;
    const focusTracker = renderDisposables.add(dom.trackFocus(element));
    renderDisposables.add(focusTracker.onDidBlur(() => this.hide(true)));
    return renderDisposables;
  }
  _createActionBar(className, actions) {
    if (!actions.length) {
      return void 0;
    }
    const container = dom.$(className);
    const actionBar = new ActionBar(container);
    actionBar.push(actions, { icon: false, label: true });
    return actionBar;
  }
  _onWidgetClosed(didCancel) {
    this._list.value?.hide(didCancel);
  }
};
ActionWidgetService = __decorateClass([
  __decorateParam(0, IContextViewService),
  __decorateParam(1, IContextKeyService),
  __decorateParam(2, IInstantiationService)
], ActionWidgetService);
registerSingleton(IActionWidgetService, ActionWidgetService, InstantiationType.Delayed);
const weight = KeybindingWeight.EditorContrib + 1e3;
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "hideCodeActionWidget",
      title: localize2("hideCodeActionWidget.title", "Hide action widget"),
      precondition: ActionWidgetContextKeys.Visible,
      keybinding: {
        weight,
        primary: KeyCode.Escape,
        secondary: [KeyMod.Shift | KeyCode.Escape]
      }
    });
  }
  run(accessor) {
    accessor.get(IActionWidgetService).hide(true);
  }
});
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "selectPrevCodeAction",
      title: localize2("selectPrevCodeAction.title", "Select previous action"),
      precondition: ActionWidgetContextKeys.Visible,
      keybinding: {
        weight,
        primary: KeyCode.UpArrow,
        secondary: [KeyMod.CtrlCmd | KeyCode.UpArrow],
        mac: { primary: KeyCode.UpArrow, secondary: [KeyMod.CtrlCmd | KeyCode.UpArrow, KeyMod.WinCtrl | KeyCode.KeyP] }
      }
    });
  }
  run(accessor) {
    const widgetService = accessor.get(IActionWidgetService);
    if (widgetService instanceof ActionWidgetService) {
      widgetService.focusPrevious();
    }
  }
});
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "selectNextCodeAction",
      title: localize2("selectNextCodeAction.title", "Select next action"),
      precondition: ActionWidgetContextKeys.Visible,
      keybinding: {
        weight,
        primary: KeyCode.DownArrow,
        secondary: [KeyMod.CtrlCmd | KeyCode.DownArrow],
        mac: { primary: KeyCode.DownArrow, secondary: [KeyMod.CtrlCmd | KeyCode.DownArrow, KeyMod.WinCtrl | KeyCode.KeyN] }
      }
    });
  }
  run(accessor) {
    const widgetService = accessor.get(IActionWidgetService);
    if (widgetService instanceof ActionWidgetService) {
      widgetService.focusNext();
    }
  }
});
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: acceptSelectedActionCommand,
      title: localize2("acceptSelected.title", "Accept selected action"),
      precondition: ActionWidgetContextKeys.Visible,
      keybinding: {
        weight,
        primary: KeyCode.Enter,
        secondary: [KeyMod.CtrlCmd | KeyCode.Period]
      }
    });
  }
  run(accessor) {
    const widgetService = accessor.get(IActionWidgetService);
    if (widgetService instanceof ActionWidgetService) {
      widgetService.acceptSelected();
    }
  }
});
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: previewSelectedActionCommand,
      title: localize2("previewSelected.title", "Preview selected action"),
      precondition: ActionWidgetContextKeys.Visible,
      keybinding: {
        weight,
        primary: KeyMod.CtrlCmd | KeyCode.Enter
      }
    });
  }
  run(accessor) {
    const widgetService = accessor.get(IActionWidgetService);
    if (widgetService instanceof ActionWidgetService) {
      widgetService.acceptSelected(true);
    }
  }
});
export {
  IActionWidgetService
};
//# sourceMappingURL=actionWidget.js.map
