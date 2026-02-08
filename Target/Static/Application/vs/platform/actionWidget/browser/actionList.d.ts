import { IListAccessibilityProvider } from '../../../base/browser/ui/list/listWidget.js';
import { IAction } from '../../../base/common/actions.js';
import { CancellationToken } from '../../../base/common/cancellation.js';
import { ResolvedKeybinding } from '../../../base/common/keybindings.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { ThemeIcon } from '../../../base/common/themables.js';
import './actionWidget.css';
import { IContextViewService } from '../../contextview/browser/contextView.js';
import { IKeybindingService } from '../../keybinding/common/keybinding.js';
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
    readonly content?: string;
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
    readonly description?: string;
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
}
export declare const enum ActionListItemKind {
    Action = "action",
    Header = "header",
    Separator = "separator"
}
export declare class ActionList<T> extends Disposable {
    private readonly _delegate;
    private readonly _contextViewService;
    private readonly _keybindingService;
    private readonly _layoutService;
    private readonly _hoverService;
    readonly domNode: HTMLElement;
    private readonly _list;
    private readonly _actionLineHeight;
    private readonly _headerLineHeight;
    private readonly _separatorLineHeight;
    private readonly _allMenuItems;
    private readonly cts;
    private _hover;
    constructor(user: string, preview: boolean, items: readonly IActionListItem<T>[], _delegate: IActionListDelegate<T>, accessibilityProvider: Partial<IListAccessibilityProvider<IActionListItem<T>>> | undefined, _contextViewService: IContextViewService, _keybindingService: IKeybindingService, _layoutService: ILayoutService, _hoverService: IHoverService);
    private focusCondition;
    hide(didCancel?: boolean): void;
    layout(minWidth: number): number;
    focusPrevious(): void;
    focusNext(): void;
    acceptSelected(preview?: boolean): void;
    private onListSelection;
    private onFocus;
    private _getRowElement;
    private _showHoverForElement;
    private onListHover;
    private onListClick;
}
