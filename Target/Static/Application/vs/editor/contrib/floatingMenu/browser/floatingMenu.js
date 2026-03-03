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
import { Disposable, toDisposable } from "../../../../base/common/lifecycle.js";
import { getActionBarActions, MenuEntryActionViewItem } from "../../../../platform/actions/browser/menuEntryActionViewItem.js";
import { autorun, constObservable, derived, observableFromEvent } from "../../../../base/common/observable.js";
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
    const editorUriObs = derived((reader) => editorObs.model.read(reader)?.uri);
    const widget = this._register(instantiationService.createInstance(FloatingEditorToolbarWidget, MenuId.EditorContent, editor.contextKeyService, editorUriObs));
    this._register(autorun((reader) => {
      const hasActions = widget.hasActions.read(reader);
      if (!hasActions) {
        return;
      }
      reader.store.add(editorObs.createOverlayWidget({
        allowEditorOverflow: false,
        domNode: widget.element,
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
let FloatingEditorToolbarWidget = class FloatingEditorToolbarWidget2 extends Disposable {
  static {
    __name(this, "FloatingEditorToolbarWidget");
  }
  constructor(_menuId, _scopedContextKeyService, _toolbarContext, instantiationService, keybindingService, menuService) {
    super();
    const menu = this._register(menuService.createMenu(_menuId, _scopedContextKeyService));
    const menuGroupsObs = observableFromEvent(this, menu.onDidChange, () => menu.getActions());
    const menuPrimaryActionIdObs = derived((reader) => {
      const menuGroups = menuGroupsObs.read(reader);
      const { primary } = getActionBarActions(menuGroups, () => true);
      return primary.length > 0 ? primary[0].id : void 0;
    });
    this.hasActions = derived((reader) => menuGroupsObs.read(reader).length > 0);
    this.element = h("div.floating-menu-overlay-widget").root;
    this._register(toDisposable(() => this.element.remove()));
    this.element.style.height = "26px";
    this._register(autorun((reader) => {
      const hasActions = this.hasActions.read(reader);
      const menuPrimaryActionId = menuPrimaryActionIdObs.read(reader);
      if (!hasActions) {
        return;
      }
      const toolbar = instantiationService.createInstance(MenuWorkbenchToolBar, this.element, _menuId, {
        actionViewItemProvider: /* @__PURE__ */ __name((action, options) => {
          if (!(action instanceof MenuItemAction)) {
            return void 0;
          }
          return instantiationService.createInstance(class extends MenuEntryActionViewItem {
            render(container) {
              super.render(container);
              if (action.id === menuPrimaryActionId) {
                this.element?.classList.add("primary");
              }
            }
            updateLabel() {
              const keybinding = keybindingService.lookupKeybinding(action.id);
              const keybindingLabel = keybinding ? keybinding.getLabel() : void 0;
              if (this.options.label && this.label) {
                this.label.textContent = keybindingLabel ? `${this._commandAction.label} (${keybindingLabel})` : this._commandAction.label;
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
        const context = _toolbarContext.read(reader2);
        toolbar.context = context;
      }));
    }));
  }
};
FloatingEditorToolbarWidget = __decorate([
  __param(3, IInstantiationService),
  __param(4, IKeybindingService),
  __param(5, IMenuService)
], FloatingEditorToolbarWidget);
export {
  FloatingEditorToolbar,
  FloatingEditorToolbarWidget
};
//# sourceMappingURL=floatingMenu.js.map
