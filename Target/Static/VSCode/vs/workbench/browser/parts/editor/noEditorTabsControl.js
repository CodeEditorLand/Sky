var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import "./media/singleeditortabscontrol.css";
import { EditorInput } from "../../../common/editor/editorInput.js";
import { EditorTabsControl } from "./editorTabsControl.js";
import { Dimension } from "../../../../base/browser/dom.js";
import { IEditorTitleControlDimensions } from "./editorTitleControl.js";
import { IToolbarActions } from "../../../common/editor.js";
class NoEditorTabsControl extends EditorTabsControl {
  static {
    __name(this, "NoEditorTabsControl");
  }
  activeEditor = null;
  prepareEditorActions(editorActions) {
    return {
      primary: [],
      secondary: []
    };
  }
  openEditor(editor) {
    return this.handleOpenedEditors();
  }
  openEditors(editors) {
    return this.handleOpenedEditors();
  }
  handleOpenedEditors() {
    const didChange = this.activeEditorChanged();
    this.activeEditor = this.tabsModel.activeEditor;
    return didChange;
  }
  activeEditorChanged() {
    if (!this.activeEditor && this.tabsModel.activeEditor || // active editor changed from null => editor
    this.activeEditor && !this.tabsModel.activeEditor || // active editor changed from editor => null
    (!this.activeEditor || !this.tabsModel.isActive(this.activeEditor))) {
      return true;
    }
    return false;
  }
  beforeCloseEditor(editor) {
  }
  closeEditor(editor) {
    this.handleClosedEditors();
  }
  closeEditors(editors) {
    this.handleClosedEditors();
  }
  handleClosedEditors() {
    this.activeEditor = this.tabsModel.activeEditor;
  }
  moveEditor(editor, fromIndex, targetIndex) {
  }
  pinEditor(editor) {
  }
  stickEditor(editor) {
  }
  unstickEditor(editor) {
  }
  setActive(isActive) {
  }
  updateEditorSelections() {
  }
  updateEditorLabel(editor) {
  }
  updateEditorDirty(editor) {
  }
  getHeight() {
    return 0;
  }
  layout(dimensions) {
    return new Dimension(dimensions.container.width, this.getHeight());
  }
}
export {
  NoEditorTabsControl
};
//# sourceMappingURL=noEditorTabsControl.js.map
