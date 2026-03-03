import { BaseActionViewItem } from '../../../../../../base/browser/ui/actionbar/actionViewItems.js';
import { IAction } from '../../../../../../base/common/actions.js';
import { IContextKeyService } from '../../../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../../../../platform/keybinding/common/keybinding.js';
import { IChatInputPickerOptions } from './chatInputPickerActionItem.js';
import { IModelPickerDelegate } from './modelPickerActionItem.js';
/**
 * Enhanced action view item for selecting a language model in the chat interface.
 *
 * Wraps a {@link ModelPickerWidget} and adapts it for use in an action bar,
 * providing curated model suggestions, upgrade prompts, and grouped layout.
 */
export declare class EnhancedModelPickerActionItem extends BaseActionViewItem {
    private readonly pickerOptions;
    private readonly _contextKeyService;
    private readonly keybindingService;
    private readonly _pickerWidget;
    private readonly _managedHover;
    constructor(action: IAction, delegate: IModelPickerDelegate, pickerOptions: IChatInputPickerOptions, instantiationService: IInstantiationService, _contextKeyService: IContextKeyService, keybindingService: IKeybindingService);
    render(container: HTMLElement): void;
    private _getAnchorElement;
    openModelPicker(): void;
    show(): void;
    private _showPicker;
    private _updateTooltip;
    private _getHoverContents;
}
