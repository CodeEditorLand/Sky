import './media/agentsessionsviewer.css';
import { IIdentityProvider, IListVirtualDelegate, NotSelectableGroupIdType } from '../../../../../base/browser/ui/list/list.js';
import { AriaRole } from '../../../../../base/browser/ui/aria/aria.js';
import { IListAccessibilityProvider } from '../../../../../base/browser/ui/list/listWidget.js';
import { ITreeCompressionDelegate } from '../../../../../base/browser/ui/tree/asyncDataTree.js';
import { ICompressedTreeNode } from '../../../../../base/browser/ui/tree/compressedObjectTreeModel.js';
import { ICompressibleKeyboardNavigationLabelProvider, ICompressibleTreeRenderer } from '../../../../../base/browser/ui/tree/objectTree.js';
import { ITreeNode, ITreeElementRenderDetails, IAsyncDataSource, ITreeSorter, ITreeDragAndDrop, ITreeDragOverReaction } from '../../../../../base/browser/ui/tree/tree.js';
import { Disposable, DisposableStore, IDisposable } from '../../../../../base/common/lifecycle.js';
import { AgentSessionSection, AgentSessionStatus, IAgentSession, IAgentSessionSection, IAgentSessionsModel } from './agentSessionsModel.js';
import { IconLabel } from '../../../../../base/browser/ui/iconLabel/iconLabel.js';
import { FuzzyScore } from '../../../../../base/common/filters.js';
import { IMarkdownRendererService } from '../../../../../platform/markdown/browser/markdownRenderer.js';
import { IProductService } from '../../../../../platform/product/common/productService.js';
import { IDragAndDropData } from '../../../../../base/browser/dnd.js';
import { ListViewTargetSector } from '../../../../../base/browser/ui/list/listView.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { HoverPosition } from '../../../../../base/browser/ui/hover/hoverWidget.js';
import { IHoverService } from '../../../../../platform/hover/browser/hover.js';
import { MenuWorkbenchToolBar } from '../../../../../platform/actions/browser/toolbar.js';
import { IContextKeyService } from '../../../../../platform/contextkey/common/contextkey.js';
import { Event } from '../../../../../base/common/event.js';
import { AgentSessionsGrouping } from './agentSessionsFilter.js';
export type AgentSessionListItem = IAgentSession | IAgentSessionSection;
interface IAgentSessionItemTemplate {
    readonly element: HTMLElement;
    readonly icon: HTMLElement;
    readonly title: IconLabel;
    readonly statusContainer: HTMLElement;
    readonly statusProviderIcon: HTMLElement;
    readonly statusTime: HTMLElement;
    readonly titleToolbar: MenuWorkbenchToolBar;
    readonly diffContainer: HTMLElement;
    readonly diffAddedSpan: HTMLSpanElement;
    readonly diffRemovedSpan: HTMLSpanElement;
    readonly badge: HTMLElement;
    readonly separator: HTMLElement;
    readonly description: HTMLElement;
    readonly contextKeyService: IContextKeyService;
    readonly elementDisposable: DisposableStore;
    readonly disposables: IDisposable;
}
export interface IAgentSessionRendererOptions {
    readonly disableHover?: boolean;
    getHoverPosition(): HoverPosition;
}
export declare class AgentSessionRenderer extends Disposable implements ICompressibleTreeRenderer<IAgentSession, FuzzyScore, IAgentSessionItemTemplate> {
    private readonly options;
    private readonly markdownRendererService;
    private readonly productService;
    private readonly hoverService;
    private readonly instantiationService;
    private readonly contextKeyService;
    static readonly TEMPLATE_ID = "agent-session";
    readonly templateId = "agent-session";
    private readonly sessionHover;
    constructor(options: IAgentSessionRendererOptions, markdownRendererService: IMarkdownRendererService, productService: IProductService, hoverService: IHoverService, instantiationService: IInstantiationService, contextKeyService: IContextKeyService);
    renderTemplate(container: HTMLElement): IAgentSessionItemTemplate;
    renderElement(session: ITreeNode<IAgentSession, FuzzyScore>, index: number, template: IAgentSessionItemTemplate, details?: ITreeElementRenderDetails): void;
    private renderBadge;
    private renderMarkdownOrText;
    private renderDiff;
    private getIcon;
    private renderDescription;
    private toDuration;
    private renderStatus;
    private renderHover;
    private buildHoverContent;
    renderCompressedElements(node: ITreeNode<ICompressedTreeNode<IAgentSession>, FuzzyScore>, index: number, templateData: IAgentSessionItemTemplate, details?: ITreeElementRenderDetails): void;
    disposeElement(element: ITreeNode<IAgentSession, FuzzyScore>, index: number, template: IAgentSessionItemTemplate, details?: ITreeElementRenderDetails): void;
    disposeTemplate(templateData: IAgentSessionItemTemplate): void;
}
export declare function toStatusLabel(status: AgentSessionStatus): string;
interface IAgentSessionSectionTemplate {
    readonly container: HTMLElement;
    readonly label: HTMLSpanElement;
    readonly toolbar: MenuWorkbenchToolBar;
    readonly contextKeyService: IContextKeyService;
    readonly disposables: IDisposable;
}
export declare class AgentSessionSectionRenderer implements ICompressibleTreeRenderer<IAgentSessionSection, FuzzyScore, IAgentSessionSectionTemplate> {
    private readonly instantiationService;
    private readonly contextKeyService;
    static readonly TEMPLATE_ID = "agent-session-section";
    readonly templateId = "agent-session-section";
    constructor(instantiationService: IInstantiationService, contextKeyService: IContextKeyService);
    renderTemplate(container: HTMLElement): IAgentSessionSectionTemplate;
    renderElement(element: ITreeNode<IAgentSessionSection, FuzzyScore>, index: number, template: IAgentSessionSectionTemplate, details?: ITreeElementRenderDetails): void;
    renderCompressedElements(node: ITreeNode<ICompressedTreeNode<IAgentSessionSection>, FuzzyScore>, index: number, templateData: IAgentSessionSectionTemplate, details?: ITreeElementRenderDetails): void;
    disposeElement(element: ITreeNode<IAgentSessionSection, FuzzyScore>, index: number, template: IAgentSessionSectionTemplate, details?: ITreeElementRenderDetails): void;
    disposeTemplate(templateData: IAgentSessionSectionTemplate): void;
}
export declare class AgentSessionsListDelegate implements IListVirtualDelegate<AgentSessionListItem> {
    static readonly ITEM_HEIGHT = 54;
    static readonly SECTION_HEIGHT = 26;
    getHeight(element: AgentSessionListItem): number;
    getTemplateId(element: AgentSessionListItem): string;
}
export declare class AgentSessionsAccessibilityProvider implements IListAccessibilityProvider<AgentSessionListItem> {
    getWidgetRole(): AriaRole;
    getRole(element: AgentSessionListItem): AriaRole | undefined;
    getWidgetAriaLabel(): string;
    getAriaLabel(element: AgentSessionListItem): string | null;
}
export interface IAgentSessionsFilterExcludes {
    readonly providers: readonly string[];
    readonly states: readonly AgentSessionStatus[];
    readonly archived: boolean;
    readonly read: boolean;
}
export interface IAgentSessionsFilter {
    /**
     * An event that fires when the filter changes and sessions
     * should be re-evaluated.
     */
    readonly onDidChange: Event<void>;
    /**
     * Optional limit on the number of sessions to show.
     */
    readonly limitResults?: () => number | undefined;
    /**
     * Whether to show section headers to group sessions.
     * When undefined, sessions are shown as a flat list.
     */
    readonly groupResults?: () => AgentSessionsGrouping | undefined;
    /**
     * A callback to notify the filter about the number of
     * results after filtering.
     */
    notifyResults?(count: number): void;
    /**
     * The logic to exclude sessions from the view.
     */
    exclude(session: IAgentSession): boolean;
    /**
     * Get the current filter excludes for display in the UI.
     */
    getExcludes(): IAgentSessionsFilterExcludes;
}
export declare class AgentSessionsDataSource implements IAsyncDataSource<IAgentSessionsModel, AgentSessionListItem> {
    private readonly filter;
    private readonly sorter;
    private static readonly CAPPED_SESSIONS_LIMIT;
    constructor(filter: IAgentSessionsFilter | undefined, sorter: ITreeSorter<IAgentSession>);
    hasChildren(element: IAgentSessionsModel | AgentSessionListItem): boolean;
    getChildren(element: IAgentSessionsModel | AgentSessionListItem): Iterable<AgentSessionListItem>;
    private groupSessionsIntoSections;
    private groupSessionsCapped;
    private groupSessionsByDate;
}
export declare const AgentSessionSectionLabels: {
    today: string;
    yesterday: string;
    week: string;
    older: string;
    archived: string;
    more: string;
};
export declare function groupAgentSessionsByDate(sessions: IAgentSession[]): Map<AgentSessionSection, IAgentSessionSection>;
export declare function sessionDateFromNow(sessionTime: number): string;
export declare class AgentSessionsIdentityProvider implements IIdentityProvider<IAgentSessionsModel | AgentSessionListItem> {
    getId(element: IAgentSessionsModel | AgentSessionListItem): string;
    getGroupId(element: IAgentSessionsModel | AgentSessionListItem): number | NotSelectableGroupIdType;
}
export declare class AgentSessionsCompressionDelegate implements ITreeCompressionDelegate<AgentSessionListItem> {
    isIncompressible(element: AgentSessionListItem): boolean;
}
export interface IAgentSessionsSorterOptions {
    overrideCompare?(sessionA: IAgentSession, sessionB: IAgentSession): number | undefined;
}
export declare class AgentSessionsSorter implements ITreeSorter<IAgentSession> {
    private readonly options?;
    constructor(options?: IAgentSessionsSorterOptions | undefined);
    compare(sessionA: IAgentSession, sessionB: IAgentSession): number;
}
export declare class AgentSessionsKeyboardNavigationLabelProvider implements ICompressibleKeyboardNavigationLabelProvider<AgentSessionListItem> {
    getKeyboardNavigationLabel(element: AgentSessionListItem): string;
    getCompressedNodeKeyboardNavigationLabel(elements: AgentSessionListItem[]): {
        toString(): string | undefined;
    } | undefined;
}
export declare class AgentSessionsDragAndDrop extends Disposable implements ITreeDragAndDrop<AgentSessionListItem> {
    private readonly instantiationService;
    constructor(instantiationService: IInstantiationService);
    onDragStart(data: IDragAndDropData, originalEvent: DragEvent): void;
    getDragURI(element: AgentSessionListItem): string | null;
    getDragLabel?(elements: AgentSessionListItem[], originalEvent: DragEvent): string | undefined;
    onDragOver(data: IDragAndDropData, targetElement: AgentSessionListItem | undefined, targetIndex: number | undefined, targetSector: ListViewTargetSector | undefined, originalEvent: DragEvent): boolean | ITreeDragOverReaction;
    drop(data: IDragAndDropData, targetElement: AgentSessionListItem | undefined, targetIndex: number | undefined, targetSector: ListViewTargetSector | undefined, originalEvent: DragEvent): void;
}
export {};
