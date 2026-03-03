import './media/aiCustomizationManagement.css';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IViewPaneOptions, ViewPane } from '../../../../workbench/browser/parts/views/viewPane.js';
import { IViewDescriptorService } from '../../../../workbench/common/views.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
import { IPromptsService } from '../../../../workbench/contrib/chat/common/promptSyntax/service/promptsService.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IAICustomizationWorkspaceService } from '../../../../workbench/contrib/chat/common/aiCustomizationWorkspaceService.js';
import { IEditorService } from '../../../../workbench/services/editor/common/editorService.js';
export declare const AI_CUSTOMIZATION_OVERVIEW_VIEW_ID = "workbench.view.aiCustomizationOverview";
/**
 * A compact overview view that shows a snapshot of AI customizations
 * and provides deep-links to the management editor sections.
 */
export declare class AICustomizationOverviewView extends ViewPane {
    private readonly editorService;
    private readonly promptsService;
    private readonly workspaceContextService;
    private readonly workspaceService;
    private bodyElement;
    private container;
    private sectionsContainer;
    private readonly sections;
    private readonly countElements;
    constructor(options: IViewPaneOptions, keybindingService: IKeybindingService, contextMenuService: IContextMenuService, configurationService: IConfigurationService, contextKeyService: IContextKeyService, viewDescriptorService: IViewDescriptorService, instantiationService: IInstantiationService, openerService: IOpenerService, themeService: IThemeService, hoverService: IHoverService, editorService: IEditorService, promptsService: IPromptsService, workspaceContextService: IWorkspaceContextService, workspaceService: IAICustomizationWorkspaceService);
    protected renderBody(container: HTMLElement): void;
    private renderSections;
    private loadCounts;
    private updateCountElements;
    private openSection;
    protected layoutBody(height: number, width: number): void;
}
