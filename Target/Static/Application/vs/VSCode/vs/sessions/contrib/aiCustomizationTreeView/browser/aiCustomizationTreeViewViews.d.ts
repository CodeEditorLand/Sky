import './media/aiCustomizationTreeView.css';
import { IMenuService } from '../../../../platform/actions/common/actions.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService, RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IViewPaneOptions, ViewPane } from '../../../../workbench/browser/parts/views/viewPane.js';
import { IViewDescriptorService } from '../../../../workbench/common/views.js';
import { IPromptsService } from '../../../../workbench/contrib/chat/common/promptSyntax/service/promptsService.js';
import { IEditorService } from '../../../../workbench/services/editor/common/editorService.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IAICustomizationWorkspaceService } from '../../../../workbench/contrib/chat/common/aiCustomizationWorkspaceService.js';
/**
 * Context key indicating whether the AI Customization view has no items.
 */
export declare const AICustomizationIsEmptyContextKey: RawContextKey<boolean>;
/**
 * Context key for the current item's prompt type in context menus.
 */
export declare const AICustomizationItemTypeContextKey: RawContextKey<string>;
/**
 * Unified view pane for all AI Customization items (agents, skills, instructions, prompts).
 */
export declare class AICustomizationViewPane extends ViewPane {
    private readonly promptsService;
    private readonly editorService;
    private readonly menuService;
    private readonly logService;
    private readonly workspaceContextService;
    private readonly workspaceService;
    static readonly ID = "aiCustomization.view";
    private tree;
    private dataSource;
    private treeContainer;
    private readonly treeDisposables;
    private readonly isEmptyContextKey;
    private readonly itemTypeContextKey;
    constructor(options: IViewPaneOptions, keybindingService: IKeybindingService, contextMenuService: IContextMenuService, configurationService: IConfigurationService, contextKeyService: IContextKeyService, viewDescriptorService: IViewDescriptorService, instantiationService: IInstantiationService, openerService: IOpenerService, themeService: IThemeService, hoverService: IHoverService, promptsService: IPromptsService, editorService: IEditorService, menuService: IMenuService, logService: ILogService, workspaceContextService: IWorkspaceContextService, workspaceService: IAICustomizationWorkspaceService);
    protected renderBody(container: HTMLElement): void;
    private createTree;
    private autoExpandCategories;
    protected layoutBody(height: number, width: number): void;
    refresh(): void;
    collapseAll(): void;
    expandAll(): void;
    private onContextMenu;
}
