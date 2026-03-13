var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ExtensionIdentifier } from "../../../../../platform/extensions/common/extensions.js";
import product from "../../../../../platform/product/common/product.js";
import { localize } from "../../../../../nls.js";
const defaultChat = {
  completionsRefreshTokenCommand: product.defaultChatAgent?.completionsRefreshTokenCommand ?? "",
  chatRefreshTokenCommand: product.defaultChatAgent?.chatRefreshTokenCommand ?? "",
  providerExtensionId: product.defaultChatAgent?.providerExtensionId ?? ""
};
var ChatSetupAnonymous;
(function(ChatSetupAnonymous2) {
  ChatSetupAnonymous2[ChatSetupAnonymous2["Disabled"] = 0] = "Disabled";
  ChatSetupAnonymous2[ChatSetupAnonymous2["EnabledWithDialog"] = 1] = "EnabledWithDialog";
  ChatSetupAnonymous2[ChatSetupAnonymous2["EnabledWithoutDialog"] = 2] = "EnabledWithoutDialog";
})(ChatSetupAnonymous || (ChatSetupAnonymous = {}));
var ChatSetupStep;
(function(ChatSetupStep2) {
  ChatSetupStep2[ChatSetupStep2["Initial"] = 1] = "Initial";
  ChatSetupStep2[ChatSetupStep2["SigningIn"] = 2] = "SigningIn";
  ChatSetupStep2[ChatSetupStep2["Installing"] = 3] = "Installing";
})(ChatSetupStep || (ChatSetupStep = {}));
var ChatSetupStrategy;
(function(ChatSetupStrategy2) {
  ChatSetupStrategy2[ChatSetupStrategy2["Canceled"] = 0] = "Canceled";
  ChatSetupStrategy2[ChatSetupStrategy2["DefaultSetup"] = 1] = "DefaultSetup";
  ChatSetupStrategy2[ChatSetupStrategy2["SetupWithoutEnterpriseProvider"] = 2] = "SetupWithoutEnterpriseProvider";
  ChatSetupStrategy2[ChatSetupStrategy2["SetupWithEnterpriseProvider"] = 3] = "SetupWithEnterpriseProvider";
  ChatSetupStrategy2[ChatSetupStrategy2["SetupWithGoogleProvider"] = 4] = "SetupWithGoogleProvider";
  ChatSetupStrategy2[ChatSetupStrategy2["SetupWithAppleProvider"] = 5] = "SetupWithAppleProvider";
})(ChatSetupStrategy || (ChatSetupStrategy = {}));
function refreshTokens(commandService) {
  commandService.executeCommand(defaultChat.completionsRefreshTokenCommand);
  commandService.executeCommand(defaultChat.chatRefreshTokenCommand);
}
__name(refreshTokens, "refreshTokens");
async function maybeEnableAuthExtension(extensionsWorkbenchService, logService) {
  if (!defaultChat.providerExtensionId) {
    return false;
  }
  const providerExtension = extensionsWorkbenchService.local.find((e) => ExtensionIdentifier.equals(e.identifier.id, defaultChat.providerExtensionId));
  if (!providerExtension) {
    return false;
  }
  if (providerExtension.enablementState === 10 || providerExtension.enablementState === 11) {
    logService.info(`[chat setup] auth provider extension '${defaultChat.providerExtensionId}' is disabled, re-enabling it`);
    try {
      await extensionsWorkbenchService.setEnablement(
        [providerExtension],
        12
        /* EnablementState.EnabledGlobally */
      );
      await extensionsWorkbenchService.updateRunningExtensions(localize("enableAuthExtension", "Enabling GitHub Authentication"));
      return true;
    } catch (error) {
      logService.error(`[chat setup] failed to re-enable auth provider extension '${defaultChat.providerExtensionId}'`, error);
      return false;
    }
  }
  return false;
}
__name(maybeEnableAuthExtension, "maybeEnableAuthExtension");
export {
  ChatSetupAnonymous,
  ChatSetupStep,
  ChatSetupStrategy,
  maybeEnableAuthExtension,
  refreshTokens
};
//# sourceMappingURL=chatSetup.js.map
