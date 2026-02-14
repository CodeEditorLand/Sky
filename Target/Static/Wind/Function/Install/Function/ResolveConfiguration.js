var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
async function ResolveConfiguration() {
  return {
    windowId: 1,
    appRoot: "file:///app",
    userEnv: { PATH: "/usr/bin:/bin", HOME: "/" },
    product: {
      nameShort: "VSCode Wind",
      nameLong: "VSCode Wind",
      applicationName: "vscode-wind",
      version: "0.0.1",
      commit: "dev",
      date: (/* @__PURE__ */ new Date()).toISOString(),
      urlProtocol: "vscode-wind",
      dataFolderName: "vscode-wind",
      serverApplicationName: "vscode-wind-server",
      extensionProperties: {},
      defaultChatAgent: {
        extensionId: "vscode",
        chatExtensionId: "vscode",
        chatExtensionOutputId: "vscode",
        documentationUrl: "https://code.visualstudio.com/docs",
        skusDocumentationUrl: "https://code.visualstudio.com/docs",
        publicCodeMatchesUrl: "https://code.visualstudio.com/docs",
        manageSettingsUrl: "https://code.visualstudio.com/docs",
        managePlanUrl: "https://code.visualstudio.com/docs",
        manageOverageUrl: "https://code.visualstudio.com/docs",
        upgradePlanUrl: "https://code.visualstudio.com/docs",
        signUpUrl: "https://code.visualstudio.com/docs",
        termsStatementUrl: "https://code.visualstudio.com/terms",
        privacyStatementUrl: "https://privacy.microsoft.com",
        provider: {
          default: { id: "default", name: "Default" },
          enterprise: { id: "enterprise", name: "Enterprise" },
          google: { id: "google", name: "Google" },
          apple: { id: "apple", name: "Apple" }
        },
        providerUriSetting: "ai.provider.uri",
        providerScopes: [["read"], ["write"]],
        entitlementUrl: "https://code.visualstudio.com/docs",
        entitlementSignupLimitedUrl: "https://code.visualstudio.com/docs",
        tokenEntitlementUrl: "https://code.visualstudio.com/docs",
        mcpRegistryDataUrl: "https://code.visualstudio.com/docs",
        chatQuotaExceededContext: "",
        completionsQuotaExceededContext: "",
        walkthroughCommand: "",
        completionsMenuCommand: "",
        completionsRefreshTokenCommand: "",
        chatRefreshTokenCommand: "",
        generateCommitMessageCommand: "",
        resolveMergeConflictsCommand: "",
        completionsAdvancedSetting: "",
        completionsEnablementSetting: "",
        nextEditSuggestionsSetting: ""
      }
    },
    zoomLevel: 0,
    nls: { messages: [], language: "en" }
  };
}
__name(ResolveConfiguration, "ResolveConfiguration");
export {
  ResolveConfiguration
};
//# sourceMappingURL=ResolveConfiguration.js.map
