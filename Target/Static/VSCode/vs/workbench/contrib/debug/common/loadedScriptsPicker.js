var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as nls from "../../../../nls.js";
import { matchesFuzzy } from "../../../../base/common/filters.js";
import { Source } from "./debugSource.js";
import { IQuickInputService, IQuickPickItem, IQuickPickSeparator } from "../../../../platform/quickinput/common/quickInput.js";
import { IDebugService, IDebugSession } from "./debug.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { getIconClasses } from "../../../../editor/common/services/getIconClasses.js";
import { IModelService } from "../../../../editor/common/services/model.js";
import { ILanguageService } from "../../../../editor/common/languages/language.js";
import { DisposableStore } from "../../../../base/common/lifecycle.js";
import { dirname } from "../../../../base/common/resources.js";
import { ServicesAccessor } from "../../../../platform/instantiation/common/instantiation.js";
import { ILabelService } from "../../../../platform/label/common/label.js";
async function showLoadedScriptMenu(accessor) {
  const quickInputService = accessor.get(IQuickInputService);
  const debugService = accessor.get(IDebugService);
  const editorService = accessor.get(IEditorService);
  const sessions = debugService.getModel().getSessions(false);
  const modelService = accessor.get(IModelService);
  const languageService = accessor.get(ILanguageService);
  const labelService = accessor.get(ILabelService);
  const localDisposableStore = new DisposableStore();
  const quickPick = quickInputService.createQuickPick({ useSeparators: true });
  localDisposableStore.add(quickPick);
  quickPick.matchOnLabel = quickPick.matchOnDescription = quickPick.matchOnDetail = quickPick.sortByLabel = false;
  quickPick.placeholder = nls.localize("moveFocusedView.selectView", "Search loaded scripts by name");
  quickPick.items = await _getPicks(quickPick.value, sessions, editorService, modelService, languageService, labelService);
  localDisposableStore.add(quickPick.onDidChangeValue(async () => {
    quickPick.items = await _getPicks(quickPick.value, sessions, editorService, modelService, languageService, labelService);
  }));
  localDisposableStore.add(quickPick.onDidAccept(() => {
    const selectedItem = quickPick.selectedItems[0];
    selectedItem.accept();
    quickPick.hide();
    localDisposableStore.dispose();
  }));
  quickPick.show();
}
__name(showLoadedScriptMenu, "showLoadedScriptMenu");
async function _getPicksFromSession(session, filter, editorService, modelService, languageService, labelService) {
  const items = [];
  items.push({ type: "separator", label: session.name });
  const sources = await session.getLoadedSources();
  sources.forEach((element) => {
    const pick = _createPick(element, filter, editorService, modelService, languageService, labelService);
    if (pick) {
      items.push(pick);
    }
  });
  return items;
}
__name(_getPicksFromSession, "_getPicksFromSession");
async function _getPicks(filter, sessions, editorService, modelService, languageService, labelService) {
  const loadedScriptPicks = [];
  const picks = await Promise.all(
    sessions.map((session) => _getPicksFromSession(session, filter, editorService, modelService, languageService, labelService))
  );
  for (const row of picks) {
    for (const elem of row) {
      loadedScriptPicks.push(elem);
    }
  }
  return loadedScriptPicks;
}
__name(_getPicks, "_getPicks");
function _createPick(source, filter, editorService, modelService, languageService, labelService) {
  const label = labelService.getUriBasenameLabel(source.uri);
  const desc = labelService.getUriLabel(dirname(source.uri));
  const labelHighlights = matchesFuzzy(filter, label, true);
  const descHighlights = matchesFuzzy(filter, desc, true);
  if (labelHighlights || descHighlights) {
    return {
      label,
      description: desc === "." ? void 0 : desc,
      highlights: { label: labelHighlights ?? void 0, description: descHighlights ?? void 0 },
      iconClasses: getIconClasses(modelService, languageService, source.uri),
      accept: /* @__PURE__ */ __name(() => {
        if (source.available) {
          source.openInEditor(editorService, { startLineNumber: 0, startColumn: 0, endLineNumber: 0, endColumn: 0 });
        }
      }, "accept")
    };
  }
  return void 0;
}
__name(_createPick, "_createPick");
export {
  showLoadedScriptMenu
};
//# sourceMappingURL=loadedScriptsPicker.js.map
