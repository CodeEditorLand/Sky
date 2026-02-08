var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { localize } from "../../../../nls.js";
import { registerAction2 } from "../../../../platform/actions/common/actions.js";
import { SyncDescriptor } from "../../../../platform/instantiation/common/descriptors.js";
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import * as jsonContributionRegistry from "../../../../platform/jsonschemas/common/jsonContributionRegistry.js";
import { mcpAccessConfig } from "../../../../platform/mcp/common/mcpManagement.js";
import { Extensions as QuickAccessExtensions } from "../../../../platform/quickinput/common/quickAccess.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { EditorPaneDescriptor } from "../../../browser/editor.js";
import { Extensions as ConfigurationMigrationExtensions } from "../../../common/configuration.js";
import { registerWorkbenchContribution2 } from "../../../common/contributions.js";
import { EditorExtensions } from "../../../common/editor.js";
import { mcpSchemaId } from "../../../services/configuration/common/configuration.js";
import { ChatContextKeys } from "../../chat/common/actions/chatContextKeys.js";
import { ExtensionMcpDiscovery } from "../common/discovery/extensionMcpDiscovery.js";
import { InstalledMcpServersDiscovery } from "../common/discovery/installedMcpServersDiscovery.js";
import { mcpDiscoveryRegistry } from "../common/discovery/mcpDiscovery.js";
import { RemoteNativeMpcDiscovery } from "../common/discovery/nativeMcpRemoteDiscovery.js";
import { CursorWorkspaceMcpDiscoveryAdapter } from "../common/discovery/workspaceMcpDiscoveryAdapter.js";
import { mcpServerSchema } from "../common/mcpConfiguration.js";
import { McpContextKeysController } from "../common/mcpContextKeys.js";
import { IMcpDevModeDebugging, McpDevModeDebugging } from "../common/mcpDevMode.js";
import { McpLanguageModelToolContribution } from "../common/mcpLanguageModelToolContribution.js";
import { McpRegistry } from "../common/mcpRegistry.js";
import { IMcpRegistry } from "../common/mcpRegistryTypes.js";
import { McpResourceFilesystem } from "../common/mcpResourceFilesystem.js";
import { McpSamplingService } from "../common/mcpSamplingService.js";
import { McpService } from "../common/mcpService.js";
import { IMcpElicitationService, IMcpSamplingService, IMcpService, IMcpWorkbenchService } from "../common/mcpTypes.js";
import { McpAddContextContribution } from "./mcpAddContextContribution.js";
import { AddConfigurationAction, EditStoredInput, InstallFromManifestAction, ListMcpServerCommand, McpBrowseCommand, McpBrowseResourcesCommand, McpConfigureSamplingModels, McpConfirmationServerOptionsCommand, MCPServerActionRendering, McpServerOptionsCommand, McpSkipCurrentAutostartCommand, McpStartPromptingServerCommand, OpenRemoteUserMcpResourceCommand, OpenUserMcpResourceCommand, OpenWorkspaceFolderMcpResourceCommand, OpenWorkspaceMcpResourceCommand, RemoveStoredInput, ResetMcpCachedTools, ResetMcpTrustCommand, RestartServer, ShowConfiguration, ShowInstalledMcpServersCommand, ShowOutput, StartServer, StopServer } from "./mcpCommands.js";
import { McpDiscovery } from "./mcpDiscovery.js";
import { McpElicitationService } from "./mcpElicitationService.js";
import { McpLanguageFeatures } from "./mcpLanguageFeatures.js";
import { McpConfigMigrationContribution } from "./mcpMigration.js";
import { McpResourceQuickAccess } from "./mcpResourceQuickAccess.js";
import { McpServerEditor } from "./mcpServerEditor.js";
import { McpServerEditorInput } from "./mcpServerEditorInput.js";
import { McpServersViewsContribution } from "./mcpServersView.js";
import { MCPContextsInitialisation, McpWorkbenchService } from "./mcpWorkbenchService.js";
registerSingleton(
  IMcpRegistry,
  McpRegistry,
  1
  /* InstantiationType.Delayed */
);
registerSingleton(
  IMcpService,
  McpService,
  1
  /* InstantiationType.Delayed */
);
registerSingleton(
  IMcpWorkbenchService,
  McpWorkbenchService,
  0
  /* InstantiationType.Eager */
);
registerSingleton(
  IMcpDevModeDebugging,
  McpDevModeDebugging,
  1
  /* InstantiationType.Delayed */
);
registerSingleton(
  IMcpSamplingService,
  McpSamplingService,
  1
  /* InstantiationType.Delayed */
);
registerSingleton(
  IMcpElicitationService,
  McpElicitationService,
  1
  /* InstantiationType.Delayed */
);
mcpDiscoveryRegistry.register(new SyncDescriptor(RemoteNativeMpcDiscovery));
mcpDiscoveryRegistry.register(new SyncDescriptor(InstalledMcpServersDiscovery));
mcpDiscoveryRegistry.register(new SyncDescriptor(ExtensionMcpDiscovery));
mcpDiscoveryRegistry.register(new SyncDescriptor(CursorWorkspaceMcpDiscoveryAdapter));
registerWorkbenchContribution2(
  "mcpDiscovery",
  McpDiscovery,
  3
  /* WorkbenchPhase.AfterRestored */
);
registerWorkbenchContribution2(
  "mcpContextKeys",
  McpContextKeysController,
  2
  /* WorkbenchPhase.BlockRestore */
);
registerWorkbenchContribution2(
  "mcpLanguageFeatures",
  McpLanguageFeatures,
  4
  /* WorkbenchPhase.Eventually */
);
registerWorkbenchContribution2(
  "mcpResourceFilesystem",
  McpResourceFilesystem,
  2
  /* WorkbenchPhase.BlockRestore */
);
registerWorkbenchContribution2(
  McpLanguageModelToolContribution.ID,
  McpLanguageModelToolContribution,
  3
  /* WorkbenchPhase.AfterRestored */
);
registerAction2(ListMcpServerCommand);
registerAction2(McpServerOptionsCommand);
registerAction2(McpConfirmationServerOptionsCommand);
registerAction2(ResetMcpTrustCommand);
registerAction2(ResetMcpCachedTools);
registerAction2(AddConfigurationAction);
registerAction2(InstallFromManifestAction);
registerAction2(RemoveStoredInput);
registerAction2(EditStoredInput);
registerAction2(StartServer);
registerAction2(StopServer);
registerAction2(ShowOutput);
registerAction2(RestartServer);
registerAction2(ShowConfiguration);
registerAction2(McpBrowseCommand);
registerAction2(OpenUserMcpResourceCommand);
registerAction2(OpenRemoteUserMcpResourceCommand);
registerAction2(OpenWorkspaceMcpResourceCommand);
registerAction2(OpenWorkspaceFolderMcpResourceCommand);
registerAction2(ShowInstalledMcpServersCommand);
registerAction2(McpBrowseResourcesCommand);
registerAction2(McpConfigureSamplingModels);
registerAction2(McpStartPromptingServerCommand);
registerAction2(McpSkipCurrentAutostartCommand);
registerWorkbenchContribution2(
  "mcpActionRendering",
  MCPServerActionRendering,
  2
  /* WorkbenchPhase.BlockRestore */
);
registerWorkbenchContribution2(
  "mcpAddContext",
  McpAddContextContribution,
  4
  /* WorkbenchPhase.Eventually */
);
registerWorkbenchContribution2(
  MCPContextsInitialisation.ID,
  MCPContextsInitialisation,
  3
  /* WorkbenchPhase.AfterRestored */
);
registerWorkbenchContribution2(
  McpConfigMigrationContribution.ID,
  McpConfigMigrationContribution,
  4
  /* WorkbenchPhase.Eventually */
);
registerWorkbenchContribution2(
  McpServersViewsContribution.ID,
  McpServersViewsContribution,
  3
  /* WorkbenchPhase.AfterRestored */
);
const jsonRegistry = Registry.as(jsonContributionRegistry.Extensions.JSONContribution);
jsonRegistry.registerSchema(mcpSchemaId, mcpServerSchema);
Registry.as(EditorExtensions.EditorPane).registerEditorPane(EditorPaneDescriptor.create(McpServerEditor, McpServerEditor.ID, localize("mcpServer", "MCP Server")), [
  new SyncDescriptor(McpServerEditorInput)
]);
Registry.as(QuickAccessExtensions.Quickaccess).registerQuickAccessProvider({
  ctor: McpResourceQuickAccess,
  prefix: McpResourceQuickAccess.PREFIX,
  when: ChatContextKeys.enabled,
  placeholder: localize("mcp.quickaccess.placeholder", "Filter to an MCP resource"),
  helpEntries: [{
    description: localize("mcp.quickaccess.add", "MCP Server Resources"),
    commandId: "workbench.mcp.addConfiguration"
    /* McpCommandIds.AddConfiguration */
  }]
});
Registry.as(ConfigurationMigrationExtensions.ConfigurationMigration).registerConfigurationMigrations([{
  key: "chat.mcp.enabled",
  migrateFn: /* @__PURE__ */ __name((value, accessor) => {
    const result = [["chat.mcp.enabled", { value: void 0 }]];
    if (value === true) {
      result.push([mcpAccessConfig, {
        value: "all"
        /* McpAccessValue.All */
      }]);
    }
    if (value === false) {
      result.push([mcpAccessConfig, {
        value: "none"
        /* McpAccessValue.None */
      }]);
    }
    return result;
  }, "migrateFn")
}]);
//# sourceMappingURL=mcp.contribution.js.map
