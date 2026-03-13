var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = function(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
};
import { MarkdownString } from "../../../../base/common/htmlContent.js";
import { localize } from "../../../../nls.js";
import { areSameExtensions } from "../../../../platform/extensionManagement/common/extensionManagementUtil.js";
import { ToolDataSource } from "../../chat/common/tools/languageModelToolsService.js";
import { IExtensionsWorkbenchService } from "./extensions.js";
const InstallExtensionsToolId = "vscode_installExtensions";
const InstallExtensionsToolData = {
  id: InstallExtensionsToolId,
  toolReferenceName: "installExtensions",
  canBeReferencedInPrompt: true,
  displayName: localize("installExtensionsTool.displayName", "Install Extensions"),
  modelDescription: "This is a tool for installing extensions in Visual Studio Code. You should provide the list of extension ids to install. The identifier of an extension is '${ publisher }.${ name }' for example: 'vscode.csharp'.",
  userDescription: localize("installExtensionsTool.userDescription", "Tool for installing extensions"),
  source: ToolDataSource.Internal,
  inputSchema: {
    type: "object",
    properties: {
      ids: {
        type: "array",
        items: {
          type: "string"
        },
        description: "The ids of the extensions to search for. The identifier of an extension is '${ publisher }.${ name }' for example: 'vscode.csharp'."
      }
    }
  }
};
let InstallExtensionsTool = class InstallExtensionsTool2 {
  static {
    __name(this, "InstallExtensionsTool");
  }
  constructor(extensionsWorkbenchService) {
    this.extensionsWorkbenchService = extensionsWorkbenchService;
  }
  async prepareToolInvocation(context, token) {
    const parameters = context.parameters;
    return {
      confirmationMessages: {
        title: localize("installExtensionsTool.confirmationTitle", "Install Extensions"),
        message: new MarkdownString(localize("installExtensionsTool.confirmationMessage", "Review the suggested extensions and click the **Install** button for each extension you wish to add. Once you have finished installing the selected extensions, click **Continue** to proceed."))
      },
      toolSpecificData: {
        kind: "extensions",
        extensions: parameters.ids
      }
    };
  }
  async invoke(invocation, _countTokens, _progress, token) {
    const input = invocation.parameters;
    const installed = this.extensionsWorkbenchService.local.filter((e) => input.ids.some((id) => areSameExtensions({ id }, e.identifier)));
    return {
      content: [{
        kind: "text",
        value: installed.length ? localize("installExtensionsTool.resultMessage", "Following extensions are installed: {0}", installed.map((e) => e.identifier.id).join(", ")) : localize("installExtensionsTool.noResultMessage", "No extensions were installed.")
      }]
    };
  }
};
InstallExtensionsTool = __decorate([
  __param(0, IExtensionsWorkbenchService)
], InstallExtensionsTool);
export {
  InstallExtensionsTool,
  InstallExtensionsToolData,
  InstallExtensionsToolId
};
//# sourceMappingURL=installExtensionsTool.js.map
