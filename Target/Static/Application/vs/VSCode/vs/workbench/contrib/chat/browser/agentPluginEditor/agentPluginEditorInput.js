var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Codicon } from "../../../../../base/common/codicons.js";
import { Schemas } from "../../../../../base/common/network.js";
import { URI } from "../../../../../base/common/uri.js";
import { localize } from "../../../../../nls.js";
import { registerIcon } from "../../../../../platform/theme/common/iconRegistry.js";
import { EditorInput } from "../../../../common/editor/editorInput.js";
const AgentPluginEditorIcon = registerIcon("agent-plugin-editor-icon", Codicon.extensions, localize("agentPluginEditorLabelIcon", "Icon of the Agent Plugin editor."));
function getPluginId(item) {
  if (item.kind === "installed") {
    return item.plugin.uri.toString();
  }
  return `${item.marketplaceReference.canonicalId}/${item.source}`;
}
__name(getPluginId, "getPluginId");
class AgentPluginEditorInput extends EditorInput {
  static {
    __name(this, "AgentPluginEditorInput");
  }
  static {
    this.ID = "workbench.agentPlugin.input";
  }
  get typeId() {
    return AgentPluginEditorInput.ID;
  }
  get capabilities() {
    return 2 | 8;
  }
  get resource() {
    return URI.from({
      scheme: Schemas.extension,
      path: `/agentPlugin/${encodeURIComponent(getPluginId(this._item))}`
    });
  }
  constructor(_item) {
    super();
    this._item = _item;
  }
  get item() {
    return this._item;
  }
  getName() {
    return localize("agentPluginInputName", "Plugin: {0}", this._item.name);
  }
  getIcon() {
    return AgentPluginEditorIcon;
  }
  matches(other) {
    if (super.matches(other)) {
      return true;
    }
    return other instanceof AgentPluginEditorInput && getPluginId(this._item) === getPluginId(other._item);
  }
}
export {
  AgentPluginEditorInput
};
//# sourceMappingURL=agentPluginEditorInput.js.map
