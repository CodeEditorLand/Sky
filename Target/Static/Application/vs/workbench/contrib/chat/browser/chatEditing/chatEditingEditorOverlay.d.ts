import './media/chatEditingEditorOverlay.css';
import { IObservable } from '../../../../../base/common/observable.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IModifiedFileEntry } from '../../common/editing/chatEditingService.js';
import { ActionViewItem, IBaseActionViewItemOptions } from '../../../../../base/browser/ui/actionbar/actionViewItems.js';
import { IAction, IActionRunner } from '../../../../../base/common/actions.js';
import { IWorkbenchContribution } from '../../../../common/contributions.js';
import { IEditorGroupsService } from '../../../../services/editor/common/editorGroupsService.js';
import { IKeybindingService } from '../../../../../platform/keybinding/common/keybinding.js';
export declare class ChatEditingAcceptRejectActionViewItem extends ActionViewItem {
    private readonly _entry;
    private readonly _editor;
    private readonly _keybindingService;
    private readonly _primaryActionIds;
    private readonly _reveal;
    constructor(action: IAction, options: IBaseActionViewItemOptions, _entry: IObservable<IModifiedFileEntry | undefined>, _editor: {
        focus(): void;
    } | undefined, _keybindingService: IKeybindingService, _primaryActionIds?: readonly string[]);
    render(container: HTMLElement): void;
    set actionRunner(actionRunner: IActionRunner);
    get actionRunner(): IActionRunner;
    protected getTooltip(): string | undefined;
}
export declare class ChatEditingEditorOverlay implements IWorkbenchContribution {
    static readonly ID = "chat.edits.editorOverlay";
    private readonly _store;
    constructor(editorGroupsService: IEditorGroupsService, instantiationService: IInstantiationService);
    dispose(): void;
}
