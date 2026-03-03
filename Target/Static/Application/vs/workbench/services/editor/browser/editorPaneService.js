var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IEditorPaneService } from "../common/editorPaneService.js";
import { EditorPaneDescriptor } from "../../../browser/editor.js";
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
class EditorPaneService {
  static {
    __name(this, "EditorPaneService");
  }
  constructor() {
    this.onWillInstantiateEditorPane = EditorPaneDescriptor.onWillInstantiateEditorPane;
  }
  didInstantiateEditorPane(typeId) {
    return EditorPaneDescriptor.didInstantiateEditorPane(typeId);
  }
}
registerSingleton(
  IEditorPaneService,
  EditorPaneService,
  1
  /* InstantiationType.Delayed */
);
export {
  EditorPaneService
};
//# sourceMappingURL=editorPaneService.js.map
