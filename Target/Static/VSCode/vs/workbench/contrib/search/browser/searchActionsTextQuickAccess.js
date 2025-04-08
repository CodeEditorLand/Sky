var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as nls from "../../../../nls.js";
import { ServicesAccessor } from "../../../../platform/instantiation/common/instantiation.js";
import * as Constants from "../common/constants.js";
import { Action2, registerAction2 } from "../../../../platform/actions/common/actions.js";
import { category } from "./searchActionsBase.js";
import { IQuickInputService } from "../../../../platform/quickinput/common/quickInput.js";
import { TEXT_SEARCH_QUICK_ACCESS_PREFIX } from "./quickTextSearch/textSearchQuickAccess.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { IEditor } from "../../../../editor/common/editorCommon.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { getSelectionTextFromEditor } from "./searchView.js";
import { RenderableMatch } from "./searchTreeModel/searchTreeCommon.js";
registerAction2(class TextSearchQuickAccessAction extends Action2 {
  static {
    __name(this, "TextSearchQuickAccessAction");
  }
  constructor() {
    super({
      id: Constants.SearchCommandIds.QuickTextSearchActionId,
      title: nls.localize2("quickTextSearch", "Quick Search"),
      category,
      f1: true
    });
  }
  async run(accessor, match) {
    const quickInputService = accessor.get(IQuickInputService);
    const searchText = getSearchText(accessor) ?? "";
    quickInputService.quickAccess.show(TEXT_SEARCH_QUICK_ACCESS_PREFIX + searchText, { preserveValue: !!searchText });
  }
});
function getSearchText(accessor) {
  const editorService = accessor.get(IEditorService);
  const configurationService = accessor.get(IConfigurationService);
  const activeEditor = editorService.activeTextEditorControl;
  if (!activeEditor) {
    return null;
  }
  if (!activeEditor.hasTextFocus()) {
    return null;
  }
  const seedSearchStringFromSelection = configurationService.getValue("editor.find.seedSearchStringFromSelection");
  if (!seedSearchStringFromSelection) {
    return null;
  }
  return getSelectionTextFromEditor(false, activeEditor);
}
__name(getSearchText, "getSearchText");
//# sourceMappingURL=searchActionsTextQuickAccess.js.map
