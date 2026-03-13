import '../../../browser/media/sidebarActionButton.css';
import './media/customizationsToolbar.css';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IPromptsService } from '../../../../workbench/contrib/chat/common/promptSyntax/service/promptsService.js';
import { IMcpService } from '../../../../workbench/contrib/mcp/common/mcpTypes.js';
import { IAICustomizationWorkspaceService } from '../../../../workbench/contrib/chat/common/aiCustomizationWorkspaceService.js';
import { IAgentPluginService } from '../../../../workbench/contrib/chat/common/plugins/agentPluginService.js';
export interface IAICustomizationShortcutsWidgetOptions {
    readonly onDidToggleCollapse?: () => void;
}
export declare class AICustomizationShortcutsWidget extends Disposable {
    private readonly instantiationService;
    private readonly storageService;
    private readonly promptsService;
    private readonly mcpService;
    private readonly workspaceContextService;
    private readonly workspaceService;
    private readonly agentPluginService;
    constructor(container: HTMLElement, options: IAICustomizationShortcutsWidgetOptions | undefined, instantiationService: IInstantiationService, storageService: IStorageService, promptsService: IPromptsService, mcpService: IMcpService, workspaceContextService: IWorkspaceContextService, workspaceService: IAICustomizationWorkspaceService, agentPluginService: IAgentPluginService);
    private _render;
}
