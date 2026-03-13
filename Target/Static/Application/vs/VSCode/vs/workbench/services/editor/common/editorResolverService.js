var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as glob from "../../../../base/common/glob.js";
import { Schemas } from "../../../../base/common/network.js";
import { posix } from "../../../../base/common/path.js";
import { basename } from "../../../../base/common/resources.js";
import { localize } from "../../../../nls.js";
import { workbenchConfigurationNodeBase } from "../../../common/configuration.js";
import { Extensions as ConfigurationExtensions } from "../../../../platform/configuration/common/configurationRegistry.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
const IEditorResolverService = createDecorator("editorResolverService");
const editorsAssociationsSettingId = "workbench.editorAssociations";
const configurationRegistry = Registry.as(ConfigurationExtensions.Configuration);
const editorAssociationsConfigurationNode = {
  ...workbenchConfigurationNodeBase,
  properties: {
    "workbench.editorAssociations": {
      type: "object",
      markdownDescription: localize("editor.editorAssociations", 'Configure [glob patterns](https://aka.ms/vscode-glob-patterns) to editors (for example `"*.hex": "hexEditor.hexedit"`). These have precedence over the default behavior.'),
      additionalProperties: {
        type: "string"
      }
    }
  }
};
configurationRegistry.registerConfiguration(editorAssociationsConfigurationNode);
var RegisteredEditorPriority;
(function(RegisteredEditorPriority2) {
  RegisteredEditorPriority2["builtin"] = "builtin";
  RegisteredEditorPriority2["option"] = "option";
  RegisteredEditorPriority2["exclusive"] = "exclusive";
  RegisteredEditorPriority2["default"] = "default";
})(RegisteredEditorPriority || (RegisteredEditorPriority = {}));
var ResolvedStatus;
(function(ResolvedStatus2) {
  ResolvedStatus2[ResolvedStatus2["ABORT"] = 1] = "ABORT";
  ResolvedStatus2[ResolvedStatus2["NONE"] = 2] = "NONE";
})(ResolvedStatus || (ResolvedStatus = {}));
function priorityToRank(priority) {
  switch (priority) {
    case RegisteredEditorPriority.exclusive:
      return 5;
    case RegisteredEditorPriority.default:
      return 4;
    case RegisteredEditorPriority.builtin:
      return 3;
    // Text editor is priority 2
    case RegisteredEditorPriority.option:
    default:
      return 1;
  }
}
__name(priorityToRank, "priorityToRank");
function globMatchesResource(globPattern, resource) {
  const excludedSchemes = /* @__PURE__ */ new Set([
    Schemas.extension,
    Schemas.webviewPanel,
    Schemas.vscodeWorkspaceTrust,
    Schemas.vscodeSettings
  ]);
  if (excludedSchemes.has(resource.scheme)) {
    return false;
  }
  const matchOnPath = typeof globPattern === "string" && globPattern.indexOf(posix.sep) >= 0;
  const target = matchOnPath ? `${resource.scheme}:${resource.path}` : basename(resource);
  return glob.match(globPattern, target, { ignoreCase: true });
}
__name(globMatchesResource, "globMatchesResource");
export {
  IEditorResolverService,
  RegisteredEditorPriority,
  ResolvedStatus,
  editorsAssociationsSettingId,
  globMatchesResource,
  priorityToRank
};
//# sourceMappingURL=editorResolverService.js.map
