var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ExtensionIdentifier } from "../../../../../../platform/extensions/common/extensions.js";
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
export {
  isOrganizationPromptFile
};
//# sourceMappingURL=promptsServiceUtils.js.map
