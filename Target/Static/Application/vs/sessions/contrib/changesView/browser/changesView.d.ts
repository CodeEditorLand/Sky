import './media/changesView.css';
import { IObservable } from '../../../../base/common/observable.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { ILabelService } from '../../../../platform/label/common/label.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { ViewPane, IViewPaneOptions } from '../../../../workbench/browser/parts/views/viewPane.js';
import { ViewPaneContainer } from '../../../../workbench/browser/parts/views/viewPaneContainer.js';
import { IViewDescriptorService } from '../../../../workbench/common/views.js';
import { IAgentSessionsService } from '../../../../workbench/contrib/chat/browser/agentSessions/agentSessionsService.js';
import { IChatEditingService } from '../../../../workbench/contrib/chat/common/editing/chatEditingService.js';
import { IActivityService } from '../../../../workbench/services/activity/common/activity.js';
import { IEditorService } from '../../../../workbench/services/editor/common/editorService.js';
import { IExtensionService } from '../../../../workbench/services/extensions/common/extensions.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IWorkbenchLayoutService } from '../../../../workbench/services/layout/browser/layoutService.js';
import { ISessionsManagementService } from '../../sessions/browser/sessionsManagementService.js';
export declare const CHANGES_VIEW_CONTAINER_ID = "workbench.view.agentSessions.changesContainer";
export declare const CHANGES_VIEW_ID = "workbench.view.agentSessions.changes";
export declare const enum ChangesViewMode {
    List = "list",
    Tree = "tree"
}
export declare class ChangesViewPane extends ViewPane {
    private readonly chatEditingService;
    private readonly editorService;
    private readonly activityService;
    private readonly agentSessionsService;
    private readonly sessionManagementService;
    private readonly labelService;
    private readonly storageService;
    private readonly commandService;
    private bodyContainer;
    private welcomeContainer;
    private contentContainer;
    private overviewContainer;
    private summaryContainer;
    private listContainer;
    private actionsContainer;
    private tree;
    private readonly renderDisposables;
    private currentBodyHeight;
    private currentBodyWidth;
    private readonly viewModeObs;
    private readonly viewModeContextKey;
    get viewMode(): ChangesViewMode;
    set viewMode(mode: ChangesViewMode);
    private readonly activeSession;
    private readonly activeSessionFileCountObs;
    private readonly activeSessionHasChangesObs;
    get activeSessionHasChanges(): IObservable<boolean>;
    private readonly badgeDisposable;
    constructor(options: IViewPaneOptions, keybindingService: IKeybindingService, contextMenuService: IContextMenuService, configurationService: IConfigurationService, contextKeyService: IContextKeyService, viewDescriptorService: IViewDescriptorService, instantiationService: IInstantiationService, openerService: IOpenerService, themeService: IThemeService, hoverService: IHoverService, chatEditingService: IChatEditingService, editorService: IEditorService, activityService: IActivityService, agentSessionsService: IAgentSessionsService, sessionManagementService: ISessionsManagementService, labelService: ILabelService, storageService: IStorageService, commandService: ICommandService);
    private registerBadgeTracking;
    private createActiveSessionFileCountObservable;
    private updateBadge;
    protected renderBody(container: HTMLElement): void;
    private onVisible;
    private layoutTree;
    protected layoutBody(height: number, width: number): void;
    focus(): void;
    dispose(): void;
}
export declare class ChangesViewPaneContainer extends ViewPaneContainer {
    constructor(layoutService: IWorkbenchLayoutService, telemetryService: ITelemetryService, instantiationService: IInstantiationService, contextMenuService: IContextMenuService, themeService: IThemeService, storageService: IStorageService, configurationService: IConfigurationService, extensionService: IExtensionService, contextService: IWorkspaceContextService, viewDescriptorService: IViewDescriptorService, logService: ILogService);
    create(parent: HTMLElement): void;
}
