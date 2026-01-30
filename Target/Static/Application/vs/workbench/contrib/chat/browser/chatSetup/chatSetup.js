var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import product from "../../../../../platform/product/common/product.js";
const defaultChat = {
  completionsRefreshTokenCommand: product.defaultChatAgent?.completionsRefreshTokenCommand ?? "",
  chatRefreshTokenCommand: product.defaultChatAgent?.chatRefreshTokenCommand ?? ""
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
export {
  ChatSetupAnonymous,
  ChatSetupStep,
  ChatSetupStrategy,
  refreshTokens
};
//# sourceMappingURL=chatSetup.js.map
