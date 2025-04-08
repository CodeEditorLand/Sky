var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Schemas } from "../../../../base/common/network.js";
import { URI } from "../../../../base/common/uri.js";
import { localize } from "../../../../nls.js";
import { EditorInputCapabilities, IUntypedEditorInput } from "../../../common/editor.js";
import { EditorInput } from "../../../common/editor/editorInput.js";
import { ExtensionEditorTab, IExtension } from "./extensions.js";
import { areSameExtensions } from "../../../../platform/extensionManagement/common/extensionManagementUtil.js";
import { join } from "../../../../base/common/path.js";
import { IEditorOptions } from "../../../../platform/editor/common/editor.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { registerIcon } from "../../../../platform/theme/common/iconRegistry.js";
const ExtensionEditorIcon = registerIcon("extensions-editor-label-icon", Codicon.extensions, localize("extensionsEditorLabelIcon", "Icon of the extensions editor label."));
class ExtensionsInput extends EditorInput {
  constructor(_extension) {
    super();
    this._extension = _extension;
  }
  static {
    __name(this, "ExtensionsInput");
  }
  static ID = "workbench.extensions.input2";
  get typeId() {
    return ExtensionsInput.ID;
  }
  get capabilities() {
    return EditorInputCapabilities.Readonly | EditorInputCapabilities.Singleton;
  }
  get resource() {
    return URI.from({
      scheme: Schemas.extension,
      path: join(this._extension.identifier.id, "extension")
    });
  }
  get extension() {
    return this._extension;
  }
  getName() {
    return localize("extensionsInputName", "Extension: {0}", this._extension.displayName);
  }
  getIcon() {
    return ExtensionEditorIcon;
  }
  matches(other) {
    if (super.matches(other)) {
      return true;
    }
    return other instanceof ExtensionsInput && areSameExtensions(this._extension.identifier, other._extension.identifier);
  }
}
export {
  ExtensionsInput
};
//# sourceMappingURL=extensionsInput.js.map
