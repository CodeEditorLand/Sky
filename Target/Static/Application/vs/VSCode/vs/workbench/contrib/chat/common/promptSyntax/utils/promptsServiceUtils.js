var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ExtensionIdentifier } from "../../../../../../platform/extensions/common/extensions.js";
import { PromptsStorage } from "../service/promptsService.js";
function isOrganizationPromptFile(uri, extensionId, productService) {
  const chatExtensionId = productService.defaultChatAgent?.chatExtensionId;
  if (!chatExtensionId) {
    return false;
  }
  const isFromBuiltinChatExtension = ExtensionIdentifier.equals(extensionId, chatExtensionId);
  const pathContainsGithub = uri.path.includes("/github/");
  return isFromBuiltinChatExtension && pathContainsGithub;
}
__name(isOrganizationPromptFile, "isOrganizationPromptFile");
function isBuiltinAgent(source, uri, productService) {
  if (source.storage !== PromptsStorage.extension) {
    return false;
  }
  const chatExtensionId = productService.defaultChatAgent?.chatExtensionId;
  if (!chatExtensionId || !ExtensionIdentifier.equals(source.extensionId, chatExtensionId)) {
    return false;
  }
  return !isOrganizationPromptFile(uri, source.extensionId, productService);
}
__name(isBuiltinAgent, "isBuiltinAgent");
export {
  isBuiltinAgent,
  isOrganizationPromptFile
};
//# sourceMappingURL=promptsServiceUtils.js.map
