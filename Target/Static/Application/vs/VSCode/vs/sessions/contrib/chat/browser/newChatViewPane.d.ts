import './media/chatWidget.css';
import './media/chatWelcomePart.css';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
import { IViewDescriptorService } from '../../../../workbench/common/views.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IViewPaneOptions, ViewPane } from '../../../../workbench/browser/parts/views/viewPane.js';
export declare const SessionsViewId = "workbench.view.sessions.chat";
/**
 * A view pane that hosts the new-session welcome widget.
 */
export declare class NewChatViewPane extends ViewPane {
    private readonly workspaceContextService;
    private _widget;
    constructor(options: IViewPaneOptions, keybindingService: IKeybindingService, contextMenuService: IContextMenuService, configurationService: IConfigurationService, contextKeyService: IContextKeyService, viewDescriptorService: IViewDescriptorService, instantiationService: IInstantiationService, openerService: IOpenerService, themeService: IThemeService, hoverService: IHoverService, workspaceContextService: IWorkspaceContextService);
    protected renderBody(container: HTMLElement): void;
    private computeAllowedTargets;
    protected layoutBody(height: number, width: number): void;
    focus(): void;
    setVisible(visible: boolean): void;
    saveState(): void;
    dispose(): void;
}
