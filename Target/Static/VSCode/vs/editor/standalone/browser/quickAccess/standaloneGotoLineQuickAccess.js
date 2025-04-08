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
import { AbstractGotoLineQuickAccessProvider } from "../../../contrib/quickAccess/browser/gotoLineQuickAccess.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { IQuickAccessRegistry, Extensions } from "../../../../platform/quickinput/common/quickAccess.js";
import { ICodeEditorService } from "../../../browser/services/codeEditorService.js";
import { GoToLineNLS } from "../../../common/standaloneStrings.js";
import { Event } from "../../../../base/common/event.js";
import { EditorAction, registerEditorAction, ServicesAccessor } from "../../../browser/editorExtensions.js";
import { EditorContextKeys } from "../../../common/editorContextKeys.js";
import { KeyMod, KeyCode } from "../../../../base/common/keyCodes.js";
import { KeybindingWeight } from "../../../../platform/keybinding/common/keybindingsRegistry.js";
import { IQuickInputService } from "../../../../platform/quickinput/common/quickInput.js";
let StandaloneGotoLineQuickAccessProvider = class extends AbstractGotoLineQuickAccessProvider {
  constructor(editorService) {
    super();
    this.editorService = editorService;
  }
  static {
    __name(this, "StandaloneGotoLineQuickAccessProvider");
  }
  onDidActiveTextEditorControlChange = Event.None;
  get activeTextEditorControl() {
    return this.editorService.getFocusedCodeEditor() ?? void 0;
  }
};
StandaloneGotoLineQuickAccessProvider = __decorateClass([
  __decorateParam(0, ICodeEditorService)
], StandaloneGotoLineQuickAccessProvider);
class GotoLineAction extends EditorAction {
  static {
    __name(this, "GotoLineAction");
  }
  static ID = "editor.action.gotoLine";
  constructor() {
    super({
      id: GotoLineAction.ID,
      label: GoToLineNLS.gotoLineActionLabel,
      alias: "Go to Line/Column...",
      precondition: void 0,
      kbOpts: {
        kbExpr: EditorContextKeys.focus,
        primary: KeyMod.CtrlCmd | KeyCode.KeyG,
        mac: { primary: KeyMod.WinCtrl | KeyCode.KeyG },
        weight: KeybindingWeight.EditorContrib
      }
    });
  }
  run(accessor) {
    accessor.get(IQuickInputService).quickAccess.show(StandaloneGotoLineQuickAccessProvider.PREFIX);
  }
}
registerEditorAction(GotoLineAction);
Registry.as(Extensions.Quickaccess).registerQuickAccessProvider({
  ctor: StandaloneGotoLineQuickAccessProvider,
  prefix: StandaloneGotoLineQuickAccessProvider.PREFIX,
  helpEntries: [{ description: GoToLineNLS.gotoLineActionLabel, commandId: GotoLineAction.ID }]
});
export {
  GotoLineAction,
  StandaloneGotoLineQuickAccessProvider
};
//# sourceMappingURL=standaloneGotoLineQuickAccess.js.map
