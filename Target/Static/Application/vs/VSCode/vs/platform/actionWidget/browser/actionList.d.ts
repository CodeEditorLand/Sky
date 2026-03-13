import { StandardMouseEvent } from '../../../base/browser/mouseEvent.js';
import { IAnchor } from '../../../base/browser/ui/contextview/contextview.js';
import { IListAccessibilityProvider } from '../../../base/browser/ui/list/listWidget.js';
import { IAction } from '../../../base/common/actions.js';
import { CancellationToken } from '../../../base/common/cancellation.js';
import { IMarkdownString, MarkdownString } from '../../../base/common/htmlContent.js';
import { ResolvedKeybinding } from '../../../base/common/keybindings.js';
import { AnchorPosition } from '../../../base/common/layout.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { ThemeIcon } from '../../../base/common/themables.js';
import './actionWidget.css';
import { IContextViewService } from '../../contextview/browser/contextView.js';
import { IKeybindingService } from '../../keybinding/common/keybinding.js';
import { IOpenerService } from '../../opener/common/opener.js';
import { ILayoutService } from '../../layout/browser/layoutService.js';
import { IHoverService } from '../../hover/browser/hover.js';
import { IHoverPositionOptions } from '../../../base/browser/ui/hover/hover.js';
export declare const acceptSelectedActionCommand = "acceptSelectedCodeAction";
export declare const previewSelectedActionCommand = "previewSelectedCodeAction";
export interface IActionListDelegate<T> {
    onHide(didCancel?: boolean): void;
    onSelect(action: T, preview?: boolean): void;
    onHover?(action: T, cancellationToken: CancellationToken): Promise<{
        canPreview: boolean;
    } | void>;
    onFocus?(action: T | undefined): void;
}
/**
 * Optional hover configuration shown when focusing/hovering over an action list item.
 */
export interface IActionListItemHover {
    /**
     * Content to display in the hover.
     */
    readonly content?: string | MarkdownString;
    readonly position?: IHoverPositionOptions;
}
export interface IActionListItem<T> {
    readonly item?: T;
    readonly kind: ActionListItemKind;
    readonly group?: {
        kind?: unknown;
        icon?: ThemeIcon;
        title: string;
    };
    readonly disabled?: boolean;
    readonly label?: string;
    readonly description?: string | IMarkdownString;
    /**
     * Optional hover configuration shown when focusing/hovering over the item.
     */
    readonly hover?: IActionListItemHover;
    readonly keybinding?: ResolvedKeybinding;
    canPreview?: boolean | undefined;
    readonly hideIcon?: boolean;
    readonly tooltip?: string;
    /**
     * Optional toolbar actions shown when the item is focused or hovered.
     */
    readonly toolbarActions?: IAction[];
    /**
     * Optional section identifier. Items with the same section belong to the same
     * collapsible group. Only meaningful when the ActionList is created with
     * collapsible sections.
     */
    readonly section?: string;
    /**
     * When true, clicking this item toggles the section's collapsed state
     * instead of selecting it.
     */
    readonly isSectionToggle?: boolean;
    /**
     * Optional CSS class name to add to the row container.
     */
    readonly className?: string;
    /**
     * Optional badge text to display after the label (e.g., "New").
     */
    readonly badge?: string;
    /**
     * When true, this item is always shown when filtering produces no other results.
     */
    readonly showAlways?: boolean;
    /**
     * Optional callback invoked when the item is removed via the built-in remove button.
     * When set, a close button is automatically added to the item toolbar.
     */
    readonly onRemove?: () => void;
}
export declare const enum ActionListItemKind {
    Action = "action",
    Header = "header",
    Separator = "separator"
}
/**
 * Options for configuring the action list.
 */
export interface IActionListOptions {
    /**
     * When true, shows a filter input.
     */
    readonly showFilter?: boolean;
    /**
     * Placeholder text for the filter input.
     */
    readonly filterPlaceholder?: string;
    /**
     * Optional actions shown in the filter row, to the right of the input.
     */
    readonly filterActions?: readonly IAction[];
    /**
     * Section IDs that should be collapsed by default.
     */
    readonly collapsedByDefault?: ReadonlySet<string>;
    /**
     * Minimum width for the action list.
     */
    readonly minWidth?: number;
    /**
     * When true, descriptions are rendered as subtext below the title
     * instead of inline to the right.
     */
    readonly descriptionBelow?: boolean;
    /**
     * When true and filtering is enabled, focuses the filter input when the list opens.
     */
    readonly focusFilterOnOpen?: boolean;
}
export declare class ActionList<T> extends Disposable {
    private readonly _delegate;
    private readonly _options;
    private readonly _anchor;
    private readonly _contextViewService;
    private readonly _keybindingService;
    private readonly _layoutService;
    private readonly _hoverService;
    private readonly _openerService;
    readonly domNode: HTMLElement;
    private readonly _list;
    private readonly _actionLineHeight;
    private readonly _headerLineHeight;
    private readonly _separatorLineHeight;
    private _allMenuItems;
    private readonly cts;
    private _hover;
    private readonly _collapsedSections;
    private _filterText;
    private _suppressHover;
    private readonly _filterInput;
    private readonly _filterContainer;
    private _lastMinWidth;
    private _cachedMaxWidth;
    private _hasLaidOut;
    private _showAbove;
    /**
     * Returns the resolved anchor position after the first layout.
     * Used by the context view delegate to lock the dropdown direction.
     */
    get anchorPosition(): AnchorPosition | undefined;
    constructor(user: string, preview: boolean, items: readonly IActionListItem<T>[], _delegate: IActionListDelegate<T>, accessibilityProvider: Partial<IListAccessibilityProvider<IActionListItem<T>>> | undefined, _options: IActionListOptions | undefined, _anchor: HTMLElement | StandardMouseEvent | IAnchor, _contextViewService: IContextViewService, _keybindingService: IKeybindingService, _layoutService: ILayoutService, _hoverService: IHoverService, _openerService: IOpenerService);
    private _toggleSection;
    private _applyFilter;
    /**
     * Returns the filter container element, if filter is enabled.
     * The caller is responsible for appending it to the widget DOM.
     */
    get filterContainer(): HTMLElement | undefined;
    get filterInput(): HTMLInputElement | undefined;
    private focusCondition;
    focus(): void;
    private _focusCheckedOrFirst;
    hide(didCancel?: boolean): void;
    clearFilter(): boolean;
    private hasDynamicHeight;
    private computeHeight;
    private computeMaxWidth;
    layout(minWidth: number): number;
    focusPrevious(): void;
    focusNext(): void;
    collapseFocusedSection(): void;
    expandFocusedSection(): void;
    toggleFocusedSection(): boolean;
    private _getFocusedSection;
    acceptSelected(preview?: boolean): void;
    private onListSelection;
    private onFocus;
    private _removeItem;
    private _computeToolbarWidth;
    private _getRowElement;
    private _showHoverForElement;
    private onListHover;
    private onListClick;
}
