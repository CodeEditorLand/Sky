import { IContextKeyService } from '../../../../../platform/contextkey/common/contextkey.js';
import { IContextMenuService } from '../../../../../platform/contextview/browser/contextView.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IAgentSession } from './agentSessionsModel.js';
import { IAgentSessionsFilter, IAgentSessionsSorterOptions } from './agentSessionsViewer.js';
import { IMenuService } from '../../../../../platform/actions/common/actions.js';
import { IChatSessionsService } from '../../common/chatSessionsService.js';
import { ICommandService } from '../../../../../platform/commands/common/commands.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IAgentSessionsService } from './agentSessionsService.js';
import { ITelemetryService } from '../../../../../platform/telemetry/common/telemetry.js';
import { IListStyles } from '../../../../../base/browser/ui/list/listWidget.js';
import { IStyleOverride } from '../../../../../platform/theme/browser/defaultStyles.js';
import { IAgentSessionsControl } from './agentSessions.js';
import { HoverPosition } from '../../../../../base/browser/ui/hover/hoverWidget.js';
import { URI } from '../../../../../base/common/uri.js';
import { IEditorService } from '../../../../services/editor/common/editorService.js';
export interface IAgentSessionsControlOptions extends IAgentSessionsSorterOptions {
    readonly overrideStyles: IStyleOverride<IListStyles>;
    readonly filter: IAgentSessionsFilter;
    readonly source: AgentSessionsControlSource;
    getHoverPosition(): HoverPosition;
    trackActiveEditorSession(): boolean;
}
export declare const enum AgentSessionsControlSource {
    ChatViewPane = "chatViewPane",
    WelcomeView = "welcomeView"
}
export declare class AgentSessionsControl extends Disposable implements IAgentSessionsControl {
    private readonly container;
    private readonly options;
    private readonly contextMenuService;
    private readonly contextKeyService;
    private readonly instantiationService;
    private readonly chatSessionsService;
    private readonly commandService;
    private readonly menuService;
    private readonly agentSessionsService;
    private readonly telemetryService;
    private readonly editorService;
    private sessionsContainer;
    private sessionsList;
    private visible;
    private focusedAgentSessionArchivedContextKey;
    private focusedAgentSessionReadContextKey;
    private focusedAgentSessionTypeContextKey;
    constructor(container: HTMLElement, options: IAgentSessionsControlOptions, contextMenuService: IContextMenuService, contextKeyService: IContextKeyService, instantiationService: IInstantiationService, chatSessionsService: IChatSessionsService, commandService: ICommandService, menuService: IMenuService, agentSessionsService: IAgentSessionsService, telemetryService: ITelemetryService, editorService: IEditorService);
    private registerListeners;
    private revealAndFocusActiveEditorSession;
    private createList;
    private openAgentSession;
    private showContextMenu;
    private showAgentSessionSectionContextMenu;
    private showAgentSessionContextMenu;
    openFind(): void;
    private updateArchivedSectionCollapseState;
    refresh(): Promise<void>;
    update(): Promise<void>;
    setVisible(visible: boolean): void;
    layout(height: number, width: number): void;
    focus(): void;
    clearFocus(): void;
    scrollToTop(): void;
    getFocus(): IAgentSession[];
    reveal(sessionResource: URI): void;
    setGridMarginOffset(offset: number): void;
}
