import { localize, localize2 } from "../../../../nls.js";
import { registerAction2 } from "../../../../platform/actions/common/actions.js";
import { ContextKeyExpr } from "../../../../platform/contextkey/common/contextkey.js";
import { SyncDescriptor } from "../../../../platform/instantiation/common/descriptors.js";
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import * as jsonContributionRegistry from "../../../../platform/jsonschemas/common/jsonContributionRegistry.js";
import { Extensions as QuickAccessExtensions } from "../../../../platform/quickinput/common/quickAccess.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { EditorPaneDescriptor } from "../../../browser/editor.js";
import { registerWorkbenchContribution2 } from "../../../common/contributions.js";
import { EditorExtensions } from "../../../common/editor.js";
import { Extensions as ViewExtensions } from "../../../common/views.js";
import { mcpSchemaId } from "../../../services/configuration/common/configuration.js";
import { VIEW_CONTAINER } from "../../extensions/browser/extensions.contribution.js";
import { DefaultViewsContext, SearchMcpServersContext } from "../../extensions/common/extensions.js";
import { ConfigMcpDiscovery } from "../common/discovery/configMcpDiscovery.js";
import { ExtensionMcpDiscovery } from "../common/discovery/extensionMcpDiscovery.js";
import { mcpDiscoveryRegistry } from "../common/discovery/mcpDiscovery.js";
import { RemoteNativeMpcDiscovery } from "../common/discovery/nativeMcpRemoteDiscovery.js";
import { CursorWorkspaceMcpDiscoveryAdapter } from "../common/discovery/workspaceMcpDiscoveryAdapter.js";
import { IMcpConfigPathsService, McpConfigPathsService } from "../common/mcpConfigPathsService.js";
import { mcpServerSchema } from "../common/mcpConfiguration.js";
import { McpContextKeysController } from "../common/mcpContextKeys.js";
import { IMcpDevModeDebugging, McpDevModeDebugging } from "../common/mcpDevMode.js";
import { McpRegistry } from "../common/mcpRegistry.js";
import { IMcpRegistry } from "../common/mcpRegistryTypes.js";
import { McpResourceFilesystem } from "../common/mcpResourceFilesystem.js";
import { McpSamplingService } from "../common/mcpSamplingService.js";
import { McpService } from "../common/mcpService.js";
import { HasInstalledMcpServersContext, IMcpElicitationService, IMcpSamplingService, IMcpService, IMcpWorkbenchService, InstalledMcpServersViewId, McpServersGalleryEnabledContext } from "../common/mcpTypes.js";
import { McpAddContextContribution } from "./mcpAddContextContribution.js";
import { AddConfigurationAction, EditStoredInput, InstallFromActivation, ListMcpServerCommand, McpBrowseCommand, McpBrowseResourcesCommand, McpConfigureSamplingModels, MCPServerActionRendering, McpServerOptionsCommand, McpStartPromptingServerCommand, RemoveStoredInput, ResetMcpCachedTools, ResetMcpTrustCommand, RestartServer, ShowConfiguration, ShowOutput, StartServer, StopServer } from "./mcpCommands.js";
import { McpDiscovery } from "./mcpDiscovery.js";
import { McpElicitationService } from "./mcpElicitationService.js";
import { McpLanguageFeatures } from "./mcpLanguageFeatures.js";
import { McpResourceQuickAccess } from "./mcpResourceQuickAccess.js";
import { McpServerEditor } from "./mcpServerEditor.js";
import { McpServerEditorInput } from "./mcpServerEditorInput.js";
import { McpServersListView } from "./mcpServersView.js";
import { McpUrlHandler } from "./mcpUrlHandler.js";
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
  IMcpConfigPathsService,
  McpConfigPathsService,
  1
  /* InstantiationType.Delayed */
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
mcpDiscoveryRegistry.register(new SyncDescriptor(ConfigMcpDiscovery));
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
  "mcpUrlHandler",
  McpUrlHandler,
  2
  /* WorkbenchPhase.BlockRestore */
);
registerWorkbenchContribution2(
  "mcpResourceFilesystem",
  McpResourceFilesystem,
  2
  /* WorkbenchPhase.BlockRestore */
);
registerAction2(ListMcpServerCommand);
registerAction2(McpServerOptionsCommand);
registerAction2(ResetMcpTrustCommand);
registerAction2(ResetMcpCachedTools);
registerAction2(AddConfigurationAction);
registerAction2(RemoveStoredInput);
registerAction2(EditStoredInput);
registerAction2(StartServer);
registerAction2(StopServer);
registerAction2(ShowOutput);
registerAction2(InstallFromActivation);
registerAction2(RestartServer);
registerAction2(ShowConfiguration);
registerAction2(McpBrowseCommand);
registerAction2(McpBrowseResourcesCommand);
registerAction2(McpConfigureSamplingModels);
registerAction2(McpStartPromptingServerCommand);
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
const jsonRegistry = Registry.as(jsonContributionRegistry.Extensions.JSONContribution);
jsonRegistry.registerSchema(mcpSchemaId, mcpServerSchema);
Registry.as(ViewExtensions.ViewsRegistry).registerViews([
  {
    id: InstalledMcpServersViewId,
    name: localize2("mcp-installed", "MCP Servers - Installed"),
    ctorDescriptor: new SyncDescriptor(McpServersListView),
    when: ContextKeyExpr.and(DefaultViewsContext, HasInstalledMcpServersContext, McpServersGalleryEnabledContext),
    weight: 40,
    order: 4,
    canToggleVisibility: true
  },
  {
    id: "workbench.views.mcp.marketplace",
    name: localize2("mcp", "MCP Servers"),
    ctorDescriptor: new SyncDescriptor(McpServersListView),
    when: ContextKeyExpr.and(SearchMcpServersContext, McpServersGalleryEnabledContext)
  }
], VIEW_CONTAINER);
Registry.as(EditorExtensions.EditorPane).registerEditorPane(EditorPaneDescriptor.create(McpServerEditor, McpServerEditor.ID, localize("mcpServer", "MCP Server")), [
  new SyncDescriptor(McpServerEditorInput)
]);
Registry.as(QuickAccessExtensions.Quickaccess).registerQuickAccessProvider({
  ctor: McpResourceQuickAccess,
  prefix: McpResourceQuickAccess.PREFIX,
  placeholder: localize("mcp.quickaccess.placeholder", "Filter to an MCP resource"),
  helpEntries: [{
    description: localize("mcp.quickaccess.add", "MCP Server Resources"),
    commandId: "workbench.mcp.addConfiguration"
    /* McpCommandIds.AddConfiguration */
  }]
});
//# sourceMappingURL=mcp.contribution.js.map
