var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { MarkdownString } from "../../../../../base/common/htmlContent.js";
import { IJSONSchema } from "../../../../../base/common/jsonSchema.js";
import { Disposable, DisposableMap } from "../../../../../base/common/lifecycle.js";
import { joinPath } from "../../../../../base/common/resources.js";
import { ThemeIcon } from "../../../../../base/common/themables.js";
import { localize } from "../../../../../nls.js";
import { ContextKeyExpr } from "../../../../../platform/contextkey/common/contextkey.js";
import { ExtensionIdentifier, IExtensionManifest } from "../../../../../platform/extensions/common/extensions.js";
import { SyncDescriptor } from "../../../../../platform/instantiation/common/descriptors.js";
import { ILogService } from "../../../../../platform/log/common/log.js";
import { IProductService } from "../../../../../platform/product/common/productService.js";
import { Registry } from "../../../../../platform/registry/common/platform.js";
import { IWorkbenchContribution } from "../../../../common/contributions.js";
import { Extensions, IExtensionFeaturesRegistry, IExtensionFeatureTableRenderer, IRenderedData, IRowData, ITableData } from "../../../../services/extensionManagement/common/extensionFeatures.js";
import { isProposedApiEnabled } from "../../../../services/extensions/common/extensions.js";
import * as extensionsRegistry from "../../../../services/extensions/common/extensionsRegistry.js";
import { ILanguageModelToolsService, IToolData } from "../languageModelToolsService.js";
import { toolsParametersSchemaSchemaId } from "./languageModelToolsParametersSchema.js";
const languageModelToolsExtensionPoint = extensionsRegistry.ExtensionsRegistry.registerExtensionPoint({
  extensionPoint: "languageModelTools",
  activationEventsGenerator: /* @__PURE__ */ __name((contributions, result) => {
    for (const contrib of contributions) {
      result.push(`onLanguageModelTool:${contrib.name}`);
    }
  }, "activationEventsGenerator"),
  jsonSchema: {
    description: localize("vscode.extension.contributes.tools", "Contributes a tool that can be invoked by a language model in a chat session, or from a standalone command. Registered tools can be used by all extensions."),
    type: "array",
    items: {
      additionalProperties: false,
      type: "object",
      defaultSnippets: [{
        body: {
          name: "${1}",
          modelDescription: "${2}",
          inputSchema: {
            type: "object",
            properties: {
              "${3:name}": {
                type: "string",
                description: "${4:description}"
              }
            }
          }
        }
      }],
      required: ["name", "displayName", "modelDescription"],
      properties: {
        name: {
          description: localize("toolName", "A unique name for this tool. This name must be a globally unique identifier, and is also used as a name when presenting this tool to a language model."),
          type: "string",
          // [\\w-]+ is OpenAI's requirement for tool names
          pattern: "^(?!copilot_|vscode_)[\\w-]+$"
        },
        toolReferenceName: {
          markdownDescription: localize("toolName2", "If {0} is enabled for this tool, the user may use '#' with this name to invoke the tool in a query. Otherwise, the name is not required. Name must not contain whitespace.", "`canBeReferencedInPrompt`"),
          type: "string",
          pattern: "^[\\w-]+$"
        },
        displayName: {
          description: localize("toolDisplayName", "A human-readable name for this tool that may be used to describe it in the UI."),
          type: "string"
        },
        userDescription: {
          description: localize("toolUserDescription", "A description of this tool that may be shown to the user."),
          type: "string"
        },
        modelDescription: {
          description: localize("toolModelDescription", "A description of this tool that may be used by a language model to select it."),
          type: "string"
        },
        inputSchema: {
          description: localize("parametersSchema", "A JSON schema for the input this tool accepts. The input must be an object at the top level. A particular language model may not support all JSON schema features. See the documentation for the language model family you are using for more information."),
          $ref: toolsParametersSchemaSchemaId
        },
        canBeReferencedInPrompt: {
          markdownDescription: localize("canBeReferencedInPrompt", "If true, this tool shows up as an attachment that the user can add manually to their request. Chat participants will receive the tool in {0}.", "`ChatRequest#toolReferences`"),
          type: "boolean"
        },
        icon: {
          markdownDescription: localize("icon", "An icon that represents this tool. Either a file path, an object with file paths for dark and light themes, or a theme icon reference, like `$(zap)`"),
          anyOf: [
            {
              type: "string"
            },
            {
              type: "object",
              properties: {
                light: {
                  description: localize("icon.light", "Icon path when a light theme is used"),
                  type: "string"
                },
                dark: {
                  description: localize("icon.dark", "Icon path when a dark theme is used"),
                  type: "string"
                }
              }
            }
          ]
        },
        when: {
          markdownDescription: localize("condition", "Condition which must be true for this tool to be enabled. Note that a tool may still be invoked by another extension even when its `when` condition is false."),
          type: "string"
        },
        tags: {
          description: localize("toolTags", "A set of tags that roughly describe the tool's capabilities. A tool user may use these to filter the set of tools to just ones that are relevant for the task at hand, or they may want to pick a tag that can be used to identify just the tools contributed by this extension."),
          type: "array",
          items: {
            type: "string",
            pattern: "^(?!copilot_|vscode_)"
          }
        }
      }
    }
  }
});
function toToolKey(extensionIdentifier, toolName) {
  return `${extensionIdentifier.value}/${toolName}`;
}
__name(toToolKey, "toToolKey");
const CopilotAgentModeTag = "vscode_editing";
let LanguageModelToolsExtensionPointHandler = class {
  static {
    __name(this, "LanguageModelToolsExtensionPointHandler");
  }
  static ID = "workbench.contrib.toolsExtensionPointHandler";
  _registrationDisposables = new DisposableMap();
  constructor(languageModelToolsService, logService, productService) {
    languageModelToolsExtensionPoint.setHandler((extensions, delta) => {
      for (const extension of delta.added) {
        for (const rawTool of extension.value) {
          if (!rawTool.name || !rawTool.modelDescription || !rawTool.displayName) {
            logService.error(`Extension '${extension.description.identifier.value}' CANNOT register tool without name, modelDescription, and displayName: ${JSON.stringify(rawTool)}`);
            continue;
          }
          if (!rawTool.name.match(/^[\w-]+$/)) {
            logService.error(`Extension '${extension.description.identifier.value}' CANNOT register tool with invalid id: ${rawTool.name}. The id must match /^[\\w-]+$/.`);
            continue;
          }
          if (rawTool.canBeReferencedInPrompt && !rawTool.toolReferenceName) {
            logService.error(`Extension '${extension.description.identifier.value}' CANNOT register tool with 'canBeReferencedInPrompt' set without a 'toolReferenceName': ${JSON.stringify(rawTool)}`);
            continue;
          }
          if ((rawTool.name.startsWith("copilot_") || rawTool.name.startsWith("vscode_")) && !isProposedApiEnabled(extension.description, "chatParticipantPrivate")) {
            logService.error(`Extension '${extension.description.identifier.value}' CANNOT register tool with name starting with "vscode_" or "copilot_"`);
            continue;
          }
          if (rawTool.tags?.includes(CopilotAgentModeTag)) {
            if (!isProposedApiEnabled(extension.description, "languageModelToolsForAgent") && !isProposedApiEnabled(extension.description, "chatParticipantPrivate")) {
              logService.error(`Extension '${extension.description.identifier.value}' CANNOT register tool with tag "${CopilotAgentModeTag}" without enabling 'languageModelToolsForAgent' proposal`);
              continue;
            }
          }
          if (rawTool.tags?.some((tag) => tag !== CopilotAgentModeTag && (tag.startsWith("copilot_") || tag.startsWith("vscode_"))) && !isProposedApiEnabled(extension.description, "chatParticipantPrivate")) {
            logService.error(`Extension '${extension.description.identifier.value}' CANNOT register tool with tags starting with "vscode_" or "copilot_"`);
            continue;
          }
          const rawIcon = rawTool.icon;
          let icon;
          if (typeof rawIcon === "string") {
            icon = ThemeIcon.fromString(rawIcon) ?? {
              dark: joinPath(extension.description.extensionLocation, rawIcon),
              light: joinPath(extension.description.extensionLocation, rawIcon)
            };
          } else if (rawIcon) {
            icon = {
              dark: joinPath(extension.description.extensionLocation, rawIcon.dark),
              light: joinPath(extension.description.extensionLocation, rawIcon.light)
            };
          }
          const isBuiltinTool = productService.defaultChatAgent?.chatExtensionId ? ExtensionIdentifier.equals(extension.description.identifier, productService.defaultChatAgent.chatExtensionId) : isProposedApiEnabled(extension.description, "chatParticipantPrivate");
          const tool = {
            ...rawTool,
            source: { type: "extension", extensionId: extension.description.identifier, isExternalTool: !isBuiltinTool },
            inputSchema: rawTool.inputSchema,
            id: rawTool.name,
            icon,
            when: rawTool.when ? ContextKeyExpr.deserialize(rawTool.when) : void 0,
            requiresConfirmation: !isBuiltinTool,
            alwaysDisplayInputOutput: !isBuiltinTool,
            supportsToolPicker: isBuiltinTool ? false : rawTool.canBeReferencedInPrompt
          };
          const disposable = languageModelToolsService.registerToolData(tool);
          this._registrationDisposables.set(toToolKey(extension.description.identifier, rawTool.name), disposable);
        }
      }
      for (const extension of delta.removed) {
        for (const tool of extension.value) {
          this._registrationDisposables.deleteAndDispose(toToolKey(extension.description.identifier, tool.name));
        }
      }
    });
  }
};
LanguageModelToolsExtensionPointHandler = __decorateClass([
  __decorateParam(0, ILanguageModelToolsService),
  __decorateParam(1, ILogService),
  __decorateParam(2, IProductService)
], LanguageModelToolsExtensionPointHandler);
class LanguageModelToolDataRenderer extends Disposable {
  static {
    __name(this, "LanguageModelToolDataRenderer");
  }
  type = "table";
  shouldRender(manifest) {
    return !!manifest.contributes?.languageModelTools;
  }
  render(manifest) {
    const contribs = manifest.contributes?.languageModelTools ?? [];
    if (!contribs.length) {
      return { data: { headers: [], rows: [] }, dispose: /* @__PURE__ */ __name(() => {
      }, "dispose") };
    }
    const headers = [
      localize("toolTableName", "Name"),
      localize("toolTableDisplayName", "Display Name"),
      localize("toolTableDescription", "Description")
    ];
    const rows = contribs.map((t) => {
      return [
        new MarkdownString(`\`${t.name}\``),
        t.displayName,
        t.userDescription ?? t.modelDescription
      ];
    });
    return {
      data: {
        headers,
        rows
      },
      dispose: /* @__PURE__ */ __name(() => {
      }, "dispose")
    };
  }
}
Registry.as(Extensions.ExtensionFeaturesRegistry).registerExtensionFeature({
  id: "languageModelTools",
  label: localize("langModelTools", "Language Model Tools"),
  access: {
    canToggle: false
  },
  renderer: new SyncDescriptor(LanguageModelToolDataRenderer)
});
export {
  LanguageModelToolsExtensionPointHandler
};
//# sourceMappingURL=languageModelToolsContribution.js.map
