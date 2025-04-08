var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { localize2 } from "../../../../nls.js";
import { ICodeEditor } from "../../../../editor/browser/editorBrowser.js";
import { ServicesAccessor } from "../../../../editor/browser/editorExtensions.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { Categories } from "../../../../platform/action/common/actionCommonCategories.js";
import { Action2, registerAction2 } from "../../../../platform/actions/common/actions.js";
class InspectKeyMap extends Action2 {
  static {
    __name(this, "InspectKeyMap");
  }
  constructor() {
    super({
      id: "workbench.action.inspectKeyMappings",
      title: localize2("workbench.action.inspectKeyMap", "Inspect Key Mappings"),
      category: Categories.Developer,
      f1: true
    });
  }
  run(accessor, editor) {
    const keybindingService = accessor.get(IKeybindingService);
    const editorService = accessor.get(IEditorService);
    editorService.openEditor({ resource: void 0, contents: keybindingService._dumpDebugInfo(), options: { pinned: true } });
  }
}
registerAction2(InspectKeyMap);
class InspectKeyMapJSON extends Action2 {
  static {
    __name(this, "InspectKeyMapJSON");
  }
  constructor() {
    super({
      id: "workbench.action.inspectKeyMappingsJSON",
      title: localize2("workbench.action.inspectKeyMapJSON", "Inspect Key Mappings (JSON)"),
      category: Categories.Developer,
      f1: true
    });
  }
  async run(accessor) {
    const editorService = accessor.get(IEditorService);
    const keybindingService = accessor.get(IKeybindingService);
    await editorService.openEditor({ resource: void 0, contents: keybindingService._dumpDebugInfoJSON(), options: { pinned: true } });
  }
}
registerAction2(InspectKeyMapJSON);
//# sourceMappingURL=inspectKeybindings.js.map
