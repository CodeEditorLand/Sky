var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Codicon } from "../../../../base/common/codicons.js";
import { Schemas } from "../../../../base/common/network.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { URI } from "../../../../base/common/uri.js";
import { localize } from "../../../../nls.js";
import { registerIcon } from "../../../../platform/theme/common/iconRegistry.js";
import { EditorInputCapabilities, IUntypedEditorInput } from "../../../common/editor.js";
import { EditorInput } from "../../../common/editor/editorInput.js";
const WorkspaceTrustEditorIcon = registerIcon("workspace-trust-editor-label-icon", Codicon.shield, localize("workspaceTrustEditorLabelIcon", "Icon of the workspace trust editor label."));
class WorkspaceTrustEditorInput extends EditorInput {
  static {
    __name(this, "WorkspaceTrustEditorInput");
  }
  static ID = "workbench.input.workspaceTrust";
  get capabilities() {
    return EditorInputCapabilities.Readonly | EditorInputCapabilities.Singleton;
  }
  get typeId() {
    return WorkspaceTrustEditorInput.ID;
  }
  resource = URI.from({
    scheme: Schemas.vscodeWorkspaceTrust,
    path: `workspaceTrustEditor`
  });
  matches(otherInput) {
    return super.matches(otherInput) || otherInput instanceof WorkspaceTrustEditorInput;
  }
  getName() {
    return localize("workspaceTrustEditorInputName", "Workspace Trust");
  }
  getIcon() {
    return WorkspaceTrustEditorIcon;
  }
}
export {
  WorkspaceTrustEditorInput
};
//# sourceMappingURL=workspaceTrustEditorInput.js.map
