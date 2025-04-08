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
import { IAction, Separator, toAction } from "../../../base/common/actions.js";
import { localize } from "../../../nls.js";
import { IWorkbenchLayoutService } from "../../services/layout/browser/layoutService.js";
import { IContextMenuService } from "../../../platform/contextview/browser/contextView.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import { EventHelper, addDisposableListener, getActiveDocument, getWindow, isHTMLInputElement, isHTMLTextAreaElement } from "../../../base/browser/dom.js";
import { IWorkbenchContribution, WorkbenchPhase, registerWorkbenchContribution2 } from "../../common/contributions.js";
import { IClipboardService } from "../../../platform/clipboard/common/clipboardService.js";
import { StandardMouseEvent } from "../../../base/browser/mouseEvent.js";
import { Event as BaseEvent } from "../../../base/common/event.js";
import { Lazy } from "../../../base/common/lazy.js";
function createTextInputActions(clipboardService) {
  return [
    toAction({ id: "undo", label: localize("undo", "Undo"), run: /* @__PURE__ */ __name(() => getActiveDocument().execCommand("undo"), "run") }),
    toAction({ id: "redo", label: localize("redo", "Redo"), run: /* @__PURE__ */ __name(() => getActiveDocument().execCommand("redo"), "run") }),
    new Separator(),
    toAction({ id: "editor.action.clipboardCutAction", label: localize("cut", "Cut"), run: /* @__PURE__ */ __name(() => getActiveDocument().execCommand("cut"), "run") }),
    toAction({ id: "editor.action.clipboardCopyAction", label: localize("copy", "Copy"), run: /* @__PURE__ */ __name(() => getActiveDocument().execCommand("copy"), "run") }),
    toAction({
      id: "editor.action.clipboardPasteAction",
      label: localize("paste", "Paste"),
      run: /* @__PURE__ */ __name(async (element) => {
        const clipboardText = await clipboardService.readText();
        if (isHTMLTextAreaElement(element) || isHTMLInputElement(element)) {
          const selectionStart = element.selectionStart || 0;
          const selectionEnd = element.selectionEnd || 0;
          element.value = `${element.value.substring(0, selectionStart)}${clipboardText}${element.value.substring(selectionEnd, element.value.length)}`;
          element.selectionStart = selectionStart + clipboardText.length;
          element.selectionEnd = element.selectionStart;
          element.dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));
        }
      }, "run")
    }),
    new Separator(),
    toAction({ id: "editor.action.selectAll", label: localize("selectAll", "Select All"), run: /* @__PURE__ */ __name(() => getActiveDocument().execCommand("selectAll"), "run") })
  ];
}
__name(createTextInputActions, "createTextInputActions");
let TextInputActionsProvider = class extends Disposable {
  constructor(layoutService, contextMenuService, clipboardService) {
    super();
    this.layoutService = layoutService;
    this.contextMenuService = contextMenuService;
    this.clipboardService = clipboardService;
    this.registerListeners();
  }
  static {
    __name(this, "TextInputActionsProvider");
  }
  static ID = "workbench.contrib.textInputActionsProvider";
  textInputActions = new Lazy(() => createTextInputActions(this.clipboardService));
  registerListeners() {
    this._register(BaseEvent.runAndSubscribe(this.layoutService.onDidAddContainer, ({ container, disposables }) => {
      disposables.add(addDisposableListener(container, "contextmenu", (e) => this.onContextMenu(getWindow(container), e)));
    }, { container: this.layoutService.mainContainer, disposables: this._store }));
  }
  onContextMenu(targetWindow, e) {
    if (e.defaultPrevented) {
      return;
    }
    const target = e.target;
    if (!isHTMLTextAreaElement(target) && !isHTMLInputElement(target)) {
      return;
    }
    EventHelper.stop(e, true);
    const event = new StandardMouseEvent(targetWindow, e);
    this.contextMenuService.showContextMenu({
      getAnchor: /* @__PURE__ */ __name(() => event, "getAnchor"),
      getActions: /* @__PURE__ */ __name(() => this.textInputActions.value, "getActions"),
      getActionsContext: /* @__PURE__ */ __name(() => target, "getActionsContext")
    });
  }
};
TextInputActionsProvider = __decorateClass([
  __decorateParam(0, IWorkbenchLayoutService),
  __decorateParam(1, IContextMenuService),
  __decorateParam(2, IClipboardService)
], TextInputActionsProvider);
registerWorkbenchContribution2(
  TextInputActionsProvider.ID,
  TextInputActionsProvider,
  WorkbenchPhase.BlockRestore
  // Block to allow right-click into input fields before restore finished
);
export {
  TextInputActionsProvider,
  createTextInputActions
};
//# sourceMappingURL=textInputActions.js.map
