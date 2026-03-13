import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IClipboardService } from '../../../../../platform/clipboard/common/clipboardService.js';
import { IHoverService } from '../../../../../platform/hover/browser/hover.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IOpenerService } from '../../../../../platform/opener/common/opener.js';
import { IEditorService } from '../../../../services/editor/common/editorService.js';
import { IChatDebugEvent, IChatDebugService } from '../../common/chatDebugService.js';
/**
 * Reusable detail panel that resolves and displays the content of a
 * single {@link IChatDebugEvent}. Used by both the logs view and the
 * flow chart view.
 */
export declare class ChatDebugDetailPanel extends Disposable {
    private readonly chatDebugService;
    private readonly instantiationService;
    private readonly editorService;
    private readonly clipboardService;
    private readonly hoverService;
    private readonly openerService;
    private readonly _onDidHide;
    readonly onDidHide: import("../../../../../base/common/event.js").Event<void>;
    readonly element: HTMLElement;
    private readonly contentContainer;
    private readonly detailDisposables;
    private currentDetailText;
    private currentDetailEventId;
    private firstFocusableElement;
    constructor(parent: HTMLElement, chatDebugService: IChatDebugService, instantiationService: IInstantiationService, editorService: IEditorService, clipboardService: IClipboardService, hoverService: IHoverService, openerService: IOpenerService);
    show(event: IChatDebugEvent): Promise<void>;
    get isVisible(): boolean;
    focus(): void;
    hide(): void;
}
