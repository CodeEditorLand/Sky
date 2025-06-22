var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Separator } from "../../../../base/common/actions.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { isMacintosh } from "../../../../base/common/platform.js";
import { registerEditorContribution } from "../../../../editor/browser/editorExtensions.js";
import { IMenuService, MenuId } from "../../../../platform/actions/common/actions.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
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
class GutterActionsRegistryImpl {
  static {
    __name(this, "GutterActionsRegistryImpl");
  }
  constructor() {
    this._registeredGutterActionsGenerators = /* @__PURE__ */ new Set();
  }
  /**
   *
   * This exists solely to allow the debug and test contributions to add actions to the gutter context menu
   * which cannot be trivially expressed using when clauses and therefore cannot be statically registered.
   * If you want an action to show up in the gutter context menu, you should generally use MenuId.EditorLineNumberMenu instead.
   */
  registerGutterActionsGenerator(gutterActionsGenerator) {
    this._registeredGutterActionsGenerators.add(gutterActionsGenerator);
    return {
      dispose: /* @__PURE__ */ __name(() => {
        this._registeredGutterActionsGenerators.delete(gutterActionsGenerator);
      }, "dispose")
    };
  }
  getGutterActionsGenerators() {
    return Array.from(this._registeredGutterActionsGenerators.values());
  }
}
Registry.add("gutterActionsRegistry", new GutterActionsRegistryImpl());
const GutterActionsRegistry = Registry.as("gutterActionsRegistry");
let EditorLineNumberContextMenu = class EditorLineNumberContextMenu2 extends Disposable {
  static {
    __name(this, "EditorLineNumberContextMenu");
  }
  static {
    this.ID = "workbench.contrib.editorLineNumberContextMenu";
  }
  constructor(editor, contextMenuService, menuService, contextKeyService, instantiationService) {
    super();
    this.editor = editor;
    this.contextMenuService = contextMenuService;
    this.menuService = menuService;
    this.contextKeyService = contextKeyService;
    this.instantiationService = instantiationService;
    this._register(this.editor.onMouseDown((e) => this.doShow(e, false)));
  }
  show(e) {
    this.doShow(e, true);
  }
  doShow(e, force) {
    const model = this.editor.getModel();
    if (!e.event.rightButton && !(isMacintosh && e.event.leftButton && e.event.ctrlKey) && !force || e.target.type !== 3 && e.target.type !== 2 || !e.target.position || !model) {
      return;
    }
    const lineNumber = e.target.position.lineNumber;
    const contextKeyService = this.contextKeyService.createOverlay([["editorLineNumber", lineNumber]]);
    const menu = this.menuService.createMenu(MenuId.EditorLineNumberContext, contextKeyService);
    const allActions = [];
    this.instantiationService.invokeFunction((accessor) => {
      for (const generator of GutterActionsRegistry.getGutterActionsGenerators()) {
        const collectedActions = /* @__PURE__ */ new Map();
        generator({ lineNumber, editor: this.editor, accessor }, {
          push: /* @__PURE__ */ __name((action, group = "navigation") => {
            const actions = collectedActions.get(group) ?? [];
            actions.push(action);
            collectedActions.set(group, actions);
          }, "push")
        });
        for (const [group, actions] of collectedActions.entries()) {
          allActions.push([group, actions]);
        }
      }
      allActions.sort((a, b) => a[0].localeCompare(b[0]));
      const menuActions = menu.getActions({ arg: { lineNumber, uri: model.uri }, shouldForwardArgs: true });
      allActions.push(...menuActions);
      if (e.target.type === 3) {
        const currentSelections = this.editor.getSelections();
        const lineRange = {
          startLineNumber: lineNumber,
          endLineNumber: lineNumber,
          startColumn: 1,
          endColumn: model.getLineLength(lineNumber) + 1
        };
        const containsSelection = currentSelections?.some((selection) => !selection.isEmpty() && selection.intersectRanges(lineRange) !== null);
        if (!containsSelection) {
          this.editor.setSelection(
            lineRange,
            "api"
            /* TextEditorSelectionSource.PROGRAMMATIC */
          );
        }
      }
      this.contextMenuService.showContextMenu({
        getAnchor: /* @__PURE__ */ __name(() => e.event, "getAnchor"),
        getActions: /* @__PURE__ */ __name(() => Separator.join(...allActions.map((a) => a[1])), "getActions"),
        onHide: /* @__PURE__ */ __name(() => menu.dispose(), "onHide")
      });
    });
  }
};
EditorLineNumberContextMenu = __decorate([
  __param(1, IContextMenuService),
  __param(2, IMenuService),
  __param(3, IContextKeyService),
  __param(4, IInstantiationService)
], EditorLineNumberContextMenu);
registerEditorContribution(
  EditorLineNumberContextMenu.ID,
  EditorLineNumberContextMenu,
  1
  /* EditorContributionInstantiation.AfterFirstRender */
);
export {
  EditorLineNumberContextMenu,
  GutterActionsRegistry,
  GutterActionsRegistryImpl
};
//# sourceMappingURL=editorLineNumberMenu.js.map
