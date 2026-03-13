import { Disposable, DisposableStore } from '../../../../../base/common/lifecycle.js';
import { IChatService } from '../../common/chatService/chatService.js';
import { IChatRequestViewModel, IChatViewModel } from '../../common/model/chatViewModel.js';
/**
 * Manages drag-and-drop reordering for pending (steering/queued) chat messages.
 * Attaches drag handles to pending request rows and uses event delegation on
 * the list container to handle drop targets, keeping logic isolated from the
 * renderer itself.
 */
export declare class ChatPendingDragController extends Disposable {
    private readonly _getViewModel;
    private readonly _chatService;
    private _dragState;
    private readonly _insertIndicator;
    constructor(listContainer: HTMLElement, _getViewModel: () => IChatViewModel | undefined, _chatService: IChatService);
    /**
     * Called by the renderer to wire up a drag handle for a pending request row.
     */
    attachDragHandle(element: IChatRequestViewModel, handleEl: HTMLElement, rowContainer: HTMLElement, disposables: DisposableStore): void;
    private _onDragOver;
    private _onDrop;
    private _onDragEnd;
    private _showIndicator;
    private _hideIndicator;
    private _findDropTarget;
    private _reorder;
}
