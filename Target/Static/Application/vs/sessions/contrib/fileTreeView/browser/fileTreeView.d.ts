import './media/fileTreeView.css';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IViewPaneOptions, ViewPane } from '../../../../workbench/browser/parts/views/viewPane.js';
import { ViewPaneContainer } from '../../../../workbench/browser/parts/views/viewPaneContainer.js';
import { IViewDescriptorService } from '../../../../workbench/common/views.js';
import { IAgentSessionsService } from '../../../../workbench/contrib/chat/browser/agentSessions/agentSessionsService.js';
import { IEditorService } from '../../../../workbench/services/editor/common/editorService.js';
import { IExtensionService } from '../../../../workbench/services/extensions/common/extensions.js';
import { IWorkbenchLayoutService } from '../../../../workbench/services/layout/browser/layoutService.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { ISessionsManagementService } from '../../sessions/browser/sessionsManagementService.js';
export declare const FILE_TREE_VIEW_CONTAINER_ID = "workbench.view.agentSessions.fileTreeContainer";
export declare const FILE_TREE_VIEW_ID = "workbench.view.agentSessions.fileTree";
export declare class FileTreeViewPane extends ViewPane {
    private readonly fileService;
    private readonly editorService;
    private readonly sessionManagementService;
    private readonly agentSessionsService;
    private readonly logService;
    private bodyContainer;
    private welcomeContainer;
    private treeContainer;
    private tree;
    private readonly renderDisposables;
    private readonly treeInputDisposable;
    private currentBodyHeight;
    private currentBodyWidth;
    /**
     * Observable that tracks the root URI for the file tree.
     * - For background sessions: the worktree or repository local path
     * - For cloud sessions: a github-remote-file:// URI derived from the session's repository metadata
     * - For local sessions: the workspace folder
     */
    private readonly treeRootUri;
    constructor(options: IViewPaneOptions, keybindingService: IKeybindingService, contextMenuService: IContextMenuService, configurationService: IConfigurationService, contextKeyService: IContextKeyService, viewDescriptorService: IViewDescriptorService, instantiationService: IInstantiationService, openerService: IOpenerService, themeService: IThemeService, hoverService: IHoverService, fileService: IFileService, editorService: IEditorService, sessionManagementService: ISessionsManagementService, agentSessionsService: IAgentSessionsService, logService: ILogService);
    /**
     * Determines the root URI for the file tree based on the active session type.
     * Tries multiple data sources: IActiveSessionItem fields, agent session model metadata,
     * and file change URIs as a last resort.
     */
    private resolveTreeRoot;
    /**
     * Extracts a github-remote-file:// URI from session metadata, trying various known fields.
     */
    private extractRepoUriFromMetadata;
    /**
     * Attempts to infer the repository from the session's file change URIs.
     * Cloud sessions have changes with URIs that reveal the repository.
     */
    private inferRepoFromChanges;
    /**
     * Tries to extract GitHub owner/repo from a file change URI.
     * Handles various URI formats used by cloud sessions.
     */
    private parseRepoFromFileUri;
    private parseGitHubUrl;
    protected renderBody(container: HTMLElement): void;
    private onVisible;
    private layoutTree;
    protected layoutBody(height: number, width: number): void;
    focus(): void;
    dispose(): void;
}
export declare class FileTreeViewPaneContainer extends ViewPaneContainer {
    constructor(layoutService: IWorkbenchLayoutService, telemetryService: ITelemetryService, instantiationService: IInstantiationService, contextMenuService: IContextMenuService, themeService: IThemeService, storageService: IStorageService, configurationService: IConfigurationService, extensionService: IExtensionService, contextService: IWorkspaceContextService, viewDescriptorService: IViewDescriptorService, logService: ILogService);
    create(parent: HTMLElement): void;
}
