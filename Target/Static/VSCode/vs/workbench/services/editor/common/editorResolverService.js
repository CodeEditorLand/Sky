var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as glob from "../../../../base/common/glob.js";
import { Event } from "../../../../base/common/event.js";
import { IDisposable } from "../../../../base/common/lifecycle.js";
import { Schemas } from "../../../../base/common/network.js";
import { posix } from "../../../../base/common/path.js";
import { basename } from "../../../../base/common/resources.js";
import { URI } from "../../../../base/common/uri.js";
import { localize } from "../../../../nls.js";
import { workbenchConfigurationNodeBase } from "../../../common/configuration.js";
import { Extensions as ConfigurationExtensions, IConfigurationNode, IConfigurationRegistry } from "../../../../platform/configuration/common/configurationRegistry.js";
import { IResourceEditorInput, ITextResourceEditorInput } from "../../../../platform/editor/common/editor.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { EditorInputWithOptions, EditorInputWithOptionsAndGroup, IResourceDiffEditorInput, IResourceMultiDiffEditorInput, IResourceMergeEditorInput, IUntitledTextResourceEditorInput, IUntypedEditorInput } from "../../../common/editor.js";
import { IEditorGroup } from "./editorGroupsService.js";
import { PreferredGroup } from "./editorService.js";
import { AtLeastOne } from "../../../../base/common/types.js";
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
var RegisteredEditorPriority = /* @__PURE__ */ ((RegisteredEditorPriority2) => {
  RegisteredEditorPriority2["builtin"] = "builtin";
  RegisteredEditorPriority2["option"] = "option";
  RegisteredEditorPriority2["exclusive"] = "exclusive";
  RegisteredEditorPriority2["default"] = "default";
  return RegisteredEditorPriority2;
})(RegisteredEditorPriority || {});
var ResolvedStatus = /* @__PURE__ */ ((ResolvedStatus2) => {
  ResolvedStatus2[ResolvedStatus2["ABORT"] = 1] = "ABORT";
  ResolvedStatus2[ResolvedStatus2["NONE"] = 2] = "NONE";
  return ResolvedStatus2;
})(ResolvedStatus || {});
function priorityToRank(priority) {
  switch (priority) {
    case "exclusive" /* exclusive */:
      return 5;
    case "default" /* default */:
      return 4;
    case "builtin" /* builtin */:
      return 3;
    // Text editor is priority 2
    case "option" /* option */:
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
  return glob.match(typeof globPattern === "string" ? globPattern.toLowerCase() : globPattern, target.toLowerCase());
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
