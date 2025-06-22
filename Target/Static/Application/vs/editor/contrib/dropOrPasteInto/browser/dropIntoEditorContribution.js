import { EditorCommand, registerEditorCommand, registerEditorContribution } from "../../../browser/editorExtensions.js";
import { registerEditorFeature } from "../../../common/editorFeatures.js";
import { DefaultDropProvidersFeature } from "./defaultProviders.js";
import { DropIntoEditorController, changeDropTypeCommandId, dropWidgetVisibleCtx } from "./dropIntoEditorController.js";
registerEditorContribution(
  DropIntoEditorController.ID,
  DropIntoEditorController,
  2
  /* EditorContributionInstantiation.BeforeFirstInteraction */
);
registerEditorFeature(DefaultDropProvidersFeature);
registerEditorCommand(new class extends EditorCommand {
  constructor() {
    super({
      id: changeDropTypeCommandId,
      precondition: dropWidgetVisibleCtx,
      kbOpts: {
        weight: 100,
        primary: 2048 | 89
      }
    });
  }
  runEditorCommand(_accessor, editor, _args) {
    DropIntoEditorController.get(editor)?.changeDropType();
  }
}());
registerEditorCommand(new class extends EditorCommand {
  constructor() {
    super({
      id: "editor.hideDropWidget",
      precondition: dropWidgetVisibleCtx,
      kbOpts: {
        weight: 100,
        primary: 9
      }
    });
  }
  runEditorCommand(_accessor, editor, _args) {
    DropIntoEditorController.get(editor)?.clearWidgets();
  }
}());
//# sourceMappingURL=dropIntoEditorContribution.js.map
