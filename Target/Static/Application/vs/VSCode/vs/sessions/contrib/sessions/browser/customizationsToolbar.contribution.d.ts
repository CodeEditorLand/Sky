import '../../../browser/media/sidebarActionButton.css';
import './media/customizationsToolbar.css';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
import { IActionViewItemService } from '../../../../platform/actions/browser/actionViewItemService.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IWorkbenchContribution } from '../../../../workbench/common/contributions.js';
import { AICustomizationManagementSection } from '../../../../workbench/contrib/chat/browser/aiCustomization/aiCustomizationManagement.js';
import { IPromptsService } from '../../../../workbench/contrib/chat/common/promptSyntax/service/promptsService.js';
import { PromptsType } from '../../../../workbench/contrib/chat/common/promptSyntax/promptTypes.js';
import { ILanguageModelsService } from '../../../../workbench/contrib/chat/common/languageModels.js';
import { IMcpService } from '../../../../workbench/contrib/mcp/common/mcpTypes.js';
import { ActionViewItem, IBaseActionViewItemOptions } from '../../../../base/browser/ui/actionbar/actionViewItems.js';
import { IAction } from '../../../../base/common/actions.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { ISessionsManagementService } from './sessionsManagementService.js';
import { IAICustomizationWorkspaceService } from '../../../../workbench/contrib/chat/common/aiCustomizationWorkspaceService.js';
import { IAgentPluginService } from '../../../../workbench/contrib/chat/common/plugins/agentPluginService.js';
export interface ICustomizationItemConfig {
    readonly id: string;
    readonly label: string;
    readonly icon: ThemeIcon;
    readonly section: AICustomizationManagementSection;
    readonly promptType?: PromptsType;
    readonly isMcp?: boolean;
    readonly isPlugins?: boolean;
}
export declare const CUSTOMIZATION_ITEMS: ICustomizationItemConfig[];
/**
 * Custom ActionViewItem for each customization link in the toolbar.
 * Renders icon + label + source count badges, matching the sidebar footer style.
 */
export declare class CustomizationLinkViewItem extends ActionViewItem {
    private readonly _config;
    private readonly _promptsService;
    private readonly _languageModelsService;
    private readonly _mcpService;
    private readonly _workspaceContextService;
    private readonly _activeSessionService;
    private readonly _workspaceService;
    private readonly _fileService;
    private readonly _agentPluginService;
    private readonly _viewItemDisposables;
    private _button;
    private _countContainer;
    constructor(action: IAction, options: IBaseActionViewItemOptions, _config: ICustomizationItemConfig, _promptsService: IPromptsService, _languageModelsService: ILanguageModelsService, _mcpService: IMcpService, _workspaceContextService: IWorkspaceContextService, _activeSessionService: ISessionsManagementService, _workspaceService: IAICustomizationWorkspaceService, _fileService: IFileService, _agentPluginService: IAgentPluginService);
    protected getTooltip(): string | undefined;
    render(container: HTMLElement): void;
    private _updateCountsRequestId;
    private _updateCounts;
    private _renderTotalCount;
}
export declare class CustomizationsToolbarContribution extends Disposable implements IWorkbenchContribution {
    static readonly ID = "workbench.contrib.sessionsCustomizationsToolbar";
    constructor(actionViewItemService: IActionViewItemService, instantiationService: IInstantiationService);
}
