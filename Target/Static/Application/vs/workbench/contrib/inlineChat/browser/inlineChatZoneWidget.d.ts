import { ICodeEditor } from '../../../../editor/browser/editorBrowser.js';
import { Position } from '../../../../editor/common/core/position.js';
import { Range } from '../../../../editor/common/core/range.js';
import { ZoneWidget } from '../../../../editor/contrib/zoneWidget/browser/zoneWidget.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IChatWidgetViewOptions } from '../../chat/browser/chat.js';
import { IChatWidgetLocationOptions } from '../../chat/browser/widget/chatWidget.js';
import { INotebookEditor } from '../../notebook/browser/notebookBrowser.js';
import { EditorBasedInlineChatWidget } from './inlineChatWidget.js';
export declare class InlineChatZoneWidget extends ZoneWidget {
    private readonly _instaService;
    private _logService;
    private static readonly _options;
    readonly widget: EditorBasedInlineChatWidget;
    private readonly _ctxCursorPosition;
    private _dimension?;
    private notebookEditor?;
    constructor(location: IChatWidgetLocationOptions, options: IChatWidgetViewOptions | undefined, editors: {
        editor: ICodeEditor;
        notebookEditor?: INotebookEditor;
    }, 
    /** @deprecated should go away with inline2 */
    clearDelegate: () => Promise<void>, _instaService: IInstantiationService, _logService: ILogService, contextKeyService: IContextKeyService);
    protected _fillContainer(container: HTMLElement): void;
    protected _doLayout(heightInPixel: number): void;
    private _computeHeight;
    protected _getResizeBounds(): {
        minLines: number;
        maxLines: number;
    };
    protected _onWidth(_widthInPixel: number): void;
    show(position: Position): void;
    private _updatePadding;
    reveal(position: Position): void;
    updatePositionAndHeight(position: Position): void;
    private _createZoneAndScrollRestoreFn;
    protected revealRange(range: Range, isLastLine: boolean): void;
    hide(): void;
}
