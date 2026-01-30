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
import { h } from "../../../../base/browser/dom.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { autorun, constObservable, observableFromEvent } from "../../../../base/common/observable.js";
import { MenuEntryActionViewItem } from "../../../../platform/actions/browser/menuEntryActionViewItem.js";
import { MenuWorkbenchToolBar } from "../../../../platform/actions/browser/toolbar.js";
import { IMenuService, MenuId, MenuItemAction } from "../../../../platform/actions/common/actions.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { observableCodeEditor } from "../../../browser/observableCodeEditor.js";
let FloatingEditorToolbar = class FloatingEditorToolbar2 extends Disposable {
  static {
    __name(this, "FloatingEditorToolbar");
  }
  static {
    this.ID = "editor.contrib.floatingToolbar";
  }
  constructor(editor, instantiationService, keybindingService, menuService) {
    super();
    const editorObs = this._register(observableCodeEditor(editor));
    const menu = this._register(menuService.createMenu(MenuId.EditorContent, editor.contextKeyService));
    const menuIsEmptyObs = observableFromEvent(this, menu.onDidChange, () => menu.getActions().length === 0);
    this._register(autorun((reader) => {
      const menuIsEmpty = menuIsEmptyObs.read(reader);
      if (menuIsEmpty) {
        return;
      }
      const container = h("div.floating-menu-overlay-widget");
      container.root.style.height = "28px";
      const toolbar = instantiationService.createInstance(MenuWorkbenchToolBar, container.root, MenuId.EditorContent, {
        actionViewItemProvider: /* @__PURE__ */ __name((action, options) => {
          if (!(action instanceof MenuItemAction)) {
            return void 0;
          }
          const keybinding = keybindingService.lookupKeybinding(action.id);
          if (!keybinding) {
            return void 0;
          }
          return instantiationService.createInstance(class extends MenuEntryActionViewItem {
            updateLabel() {
              if (this.options.label && this.label) {
                this.label.textContent = `${this._commandAction.label} (${keybinding.getLabel()})`;
              }
            }
          }, action, { ...options, keybindingNotRenderedWithLabel: true });
        }, "actionViewItemProvider"),
        hiddenItemStrategy: 0,
        menuOptions: {
          shouldForwardArgs: true
        },
        telemetrySource: "editor.overlayToolbar",
        toolbarOptions: {
          primaryGroup: /* @__PURE__ */ __name(() => true, "primaryGroup"),
          useSeparatorsInPrimaryActions: true
        }
      });
      reader.store.add(toolbar);
      reader.store.add(autorun((reader2) => {
        const model = editorObs.model.read(reader2);
        toolbar.context = model?.uri;
      }));
      reader.store.add(editorObs.createOverlayWidget({
        allowEditorOverflow: false,
        domNode: container.root,
        minContentWidthInPx: constObservable(0),
        position: constObservable({
          preference: 1
          /* OverlayWidgetPositionPreference.BOTTOM_RIGHT_CORNER */
        })
      }));
    }));
  }
};
FloatingEditorToolbar = __decorate([
  __param(1, IInstantiationService),
  __param(2, IKeybindingService),
  __param(3, IMenuService)
], FloatingEditorToolbar);
export {
  FloatingEditorToolbar
};
//# sourceMappingURL=floatingMenu.js.map
