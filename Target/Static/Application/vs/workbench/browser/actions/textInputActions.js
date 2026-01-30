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
import { Separator, toAction } from "../../../base/common/actions.js";
import { localize } from "../../../nls.js";
import { IWorkbenchLayoutService } from "../../services/layout/browser/layoutService.js";
import { IContextMenuService } from "../../../platform/contextview/browser/contextView.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import { EventHelper, addDisposableListener, getActiveDocument, getWindow, isHTMLInputElement, isHTMLTextAreaElement } from "../../../base/browser/dom.js";
import { registerWorkbenchContribution2 } from "../../common/contributions.js";
import { IClipboardService } from "../../../platform/clipboard/common/clipboardService.js";
import { StandardMouseEvent } from "../../../base/browser/mouseEvent.js";
import { Event as BaseEvent } from "../../../base/common/event.js";
import { Lazy } from "../../../base/common/lazy.js";
import { ILogService } from "../../../platform/log/common/log.js";
function createTextInputActions(clipboardService, logService) {
  return [
    toAction({ id: "undo", label: localize("undo", "Undo"), run: /* @__PURE__ */ __name(() => getActiveDocument().execCommand("undo"), "run") }),
    toAction({ id: "redo", label: localize("redo", "Redo"), run: /* @__PURE__ */ __name(() => getActiveDocument().execCommand("redo"), "run") }),
    new Separator(),
    toAction({
      id: "editor.action.clipboardCutAction",
      label: localize("cut", "Cut"),
      run: /* @__PURE__ */ __name(() => {
        logService.trace("TextInputActionsProvider#cut");
        getActiveDocument().execCommand("cut");
      }, "run")
    }),
    toAction({
      id: "editor.action.clipboardCopyAction",
      label: localize("copy", "Copy"),
      run: /* @__PURE__ */ __name(() => {
        logService.trace("TextInputActionsProvider#copy");
        getActiveDocument().execCommand("copy");
      }, "run")
    }),
    toAction({
      id: "editor.action.clipboardPasteAction",
      label: localize("paste", "Paste"),
      run: /* @__PURE__ */ __name(async (element) => {
        logService.trace("TextInputActionsProvider#paste");
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
let TextInputActionsProvider = class TextInputActionsProvider2 extends Disposable {
  static {
    __name(this, "TextInputActionsProvider");
  }
  static {
    this.ID = "workbench.contrib.textInputActionsProvider";
  }
  constructor(layoutService, contextMenuService, clipboardService, logService) {
    super();
    this.layoutService = layoutService;
    this.contextMenuService = contextMenuService;
    this.clipboardService = clipboardService;
    this.logService = logService;
    this.textInputActions = new Lazy(() => createTextInputActions(this.clipboardService, this.logService));
    this.registerListeners();
  }
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
TextInputActionsProvider = __decorate([
  __param(0, IWorkbenchLayoutService),
  __param(1, IContextMenuService),
  __param(2, IClipboardService),
  __param(3, ILogService)
], TextInputActionsProvider);
registerWorkbenchContribution2(
  TextInputActionsProvider.ID,
  TextInputActionsProvider,
  2
  /* WorkbenchPhase.BlockRestore */
);
export {
  TextInputActionsProvider,
  createTextInputActions
};
//# sourceMappingURL=textInputActions.js.map
