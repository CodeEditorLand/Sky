import { IRange } from '../../../../editor/common/core/range.js';
import { IMenuService } from '../../../../platform/actions/common/actions.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { ViewPane } from '../../../browser/parts/views/viewPane.js';
import { IViewletViewOptions } from '../../../browser/parts/views/viewsViewlet.js';
import { IViewDescriptorService } from '../../../common/views.js';
import { IDebugService, IDebugSession, IStackFrame, IThread } from '../common/debug.js';
import { ThreadAndSessionIds } from '../common/debugModel.js';
type CallStackItem = IStackFrame | IThread | IDebugSession | string | ThreadAndSessionIds | IStackFrame[];
interface ICallStackItemContext {
    sessionId: string;
    threadId?: string;
    frameId?: string;
    frameName?: string;
    frameLocation?: {
        range: IRange;
        source: DebugProtocol.Source;
    };
}
export declare function getContext(element: CallStackItem | null): ICallStackItemContext | undefined;
export declare function getContextForContributedActions(element: CallStackItem | null): string | number;
export declare function getSpecificSourceName(stackFrame: IStackFrame): string;
export declare class CallStackView extends ViewPane {
    private options;
    private readonly debugService;
    private readonly menuService;
    private stateMessage;
    private stateMessageLabel;
    private stateMessageLabelHover;
    private onCallStackChangeScheduler;
    private needsRefresh;
    private ignoreSelectionChangedEvent;
    private ignoreFocusStackFrameEvent;
    private dataSource;
    private tree;
    private autoExpandedSessions;
    private selectionNeedsUpdate;
    constructor(options: IViewletViewOptions, contextMenuService: IContextMenuService, debugService: IDebugService, keybindingService: IKeybindingService, instantiationService: IInstantiationService, viewDescriptorService: IViewDescriptorService, configurationService: IConfigurationService, contextKeyService: IContextKeyService, openerService: IOpenerService, themeService: IThemeService, hoverService: IHoverService, menuService: IMenuService);
    protected renderHeaderTitle(container: HTMLElement): void;
    protected renderBody(container: HTMLElement): void;
    protected layoutBody(height: number, width: number): void;
    focus(): void;
    collapseAll(): void;
    private updateTreeSelection;
    private onContextMenu;
}
export {};
