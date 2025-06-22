var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { EditorAction, registerEditorAction } from "../../../browser/editorExtensions.js";
import { EditorZoom } from "../../../common/config/editorZoom.js";
import * as nls from "../../../../nls.js";
class EditorFontZoomIn extends EditorAction {
  static {
    __name(this, "EditorFontZoomIn");
  }
  constructor() {
    super({
      id: "editor.action.fontZoomIn",
      label: nls.localize2("EditorFontZoomIn.label", "Increase Editor Font Size"),
      precondition: void 0
    });
  }
  run(accessor, editor) {
    EditorZoom.setZoomLevel(EditorZoom.getZoomLevel() + 1);
  }
}
class EditorFontZoomOut extends EditorAction {
  static {
    __name(this, "EditorFontZoomOut");
  }
  constructor() {
    super({
      id: "editor.action.fontZoomOut",
      label: nls.localize2("EditorFontZoomOut.label", "Decrease Editor Font Size"),
      precondition: void 0
    });
  }
  run(accessor, editor) {
    EditorZoom.setZoomLevel(EditorZoom.getZoomLevel() - 1);
  }
}
class EditorFontZoomReset extends EditorAction {
  static {
    __name(this, "EditorFontZoomReset");
  }
  constructor() {
    super({
      id: "editor.action.fontZoomReset",
      label: nls.localize2("EditorFontZoomReset.label", "Reset Editor Font Size"),
      precondition: void 0
    });
  }
  run(accessor, editor) {
    EditorZoom.setZoomLevel(0);
  }
}
registerEditorAction(EditorFontZoomIn);
registerEditorAction(EditorFontZoomOut);
registerEditorAction(EditorFontZoomReset);
//# sourceMappingURL=fontZoom.js.map
