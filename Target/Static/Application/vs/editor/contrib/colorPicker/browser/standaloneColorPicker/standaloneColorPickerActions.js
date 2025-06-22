var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { EditorAction, EditorAction2 } from "../../../../browser/editorExtensions.js";
import { localize, localize2 } from "../../../../../nls.js";
import { EditorContextKeys } from "../../../../common/editorContextKeys.js";
import { MenuId } from "../../../../../platform/actions/common/actions.js";
import { StandaloneColorPickerController } from "./standaloneColorPickerController.js";
class ShowOrFocusStandaloneColorPicker extends EditorAction2 {
  static {
    __name(this, "ShowOrFocusStandaloneColorPicker");
  }
  constructor() {
    super({
      id: "editor.action.showOrFocusStandaloneColorPicker",
      title: {
        ...localize2("showOrFocusStandaloneColorPicker", "Show or Focus Standalone Color Picker"),
        mnemonicTitle: localize({ key: "mishowOrFocusStandaloneColorPicker", comment: ["&& denotes a mnemonic"] }, "&&Show or Focus Standalone Color Picker")
      },
      precondition: void 0,
      menu: [
        { id: MenuId.CommandPalette }
      ],
      metadata: {
        description: localize2("showOrFocusStandaloneColorPickerDescription", "Show or focus a standalone color picker which uses the default color provider. It displays hex/rgb/hsl colors.")
      }
    });
  }
  runEditorCommand(_accessor, editor) {
    StandaloneColorPickerController.get(editor)?.showOrFocus();
  }
}
class HideStandaloneColorPicker extends EditorAction {
  static {
    __name(this, "HideStandaloneColorPicker");
  }
  constructor() {
    super({
      id: "editor.action.hideColorPicker",
      label: localize2({
        key: "hideColorPicker",
        comment: [
          "Action that hides the color picker"
        ]
      }, "Hide the Color Picker"),
      precondition: EditorContextKeys.standaloneColorPickerVisible.isEqualTo(true),
      kbOpts: {
        primary: 9,
        weight: 100
        /* KeybindingWeight.EditorContrib */
      },
      metadata: {
        description: localize2("hideColorPickerDescription", "Hide the standalone color picker.")
      }
    });
  }
  run(_accessor, editor) {
    StandaloneColorPickerController.get(editor)?.hide();
  }
}
class InsertColorWithStandaloneColorPicker extends EditorAction {
  static {
    __name(this, "InsertColorWithStandaloneColorPicker");
  }
  constructor() {
    super({
      id: "editor.action.insertColorWithStandaloneColorPicker",
      label: localize2({
        key: "insertColorWithStandaloneColorPicker",
        comment: [
          "Action that inserts color with standalone color picker"
        ]
      }, "Insert Color with Standalone Color Picker"),
      precondition: EditorContextKeys.standaloneColorPickerFocused.isEqualTo(true),
      kbOpts: {
        primary: 3,
        weight: 100
        /* KeybindingWeight.EditorContrib */
      },
      metadata: {
        description: localize2("insertColorWithStandaloneColorPickerDescription", "Insert hex/rgb/hsl colors with the focused standalone color picker.")
      }
    });
  }
  run(_accessor, editor) {
    StandaloneColorPickerController.get(editor)?.insertColor();
  }
}
export {
  HideStandaloneColorPicker,
  InsertColorWithStandaloneColorPicker,
  ShowOrFocusStandaloneColorPicker
};
//# sourceMappingURL=standaloneColorPickerActions.js.map
