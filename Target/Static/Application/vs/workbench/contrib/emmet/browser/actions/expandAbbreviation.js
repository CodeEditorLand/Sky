var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as nls from "../../../../../nls.js";
import { EmmetEditorAction } from "../emmetActions.js";
import { registerEditorAction } from "../../../../../editor/browser/editorExtensions.js";
import { EditorContextKeys } from "../../../../../editor/common/editorContextKeys.js";
import { ContextKeyExpr } from "../../../../../platform/contextkey/common/contextkey.js";
import { MenuId } from "../../../../../platform/actions/common/actions.js";
class ExpandAbbreviationAction extends EmmetEditorAction {
  static {
    __name(this, "ExpandAbbreviationAction");
  }
  constructor() {
    super({
      id: "editor.emmet.action.expandAbbreviation",
      label: nls.localize2("expandAbbreviationAction", "Emmet: Expand Abbreviation"),
      precondition: EditorContextKeys.writable,
      actionName: "expand_abbreviation",
      kbOpts: {
        primary: 2,
        kbExpr: ContextKeyExpr.and(EditorContextKeys.editorTextFocus, EditorContextKeys.tabDoesNotMoveFocus, ContextKeyExpr.has("config.emmet.triggerExpansionOnTab")),
        weight: 100
        /* KeybindingWeight.EditorContrib */
      },
      menuOpts: {
        menuId: MenuId.MenubarEditMenu,
        group: "5_insert",
        title: nls.localize({ key: "miEmmetExpandAbbreviation", comment: ["&& denotes a mnemonic"] }, "Emmet: E&&xpand Abbreviation"),
        order: 3
      }
    });
  }
}
registerEditorAction(ExpandAbbreviationAction);
//# sourceMappingURL=expandAbbreviation.js.map
