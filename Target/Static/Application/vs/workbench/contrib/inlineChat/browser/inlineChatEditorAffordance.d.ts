import './media/inlineChatEditorAffordance.css';
import { IDimension } from '../../../../base/browser/dom.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { ICodeEditor, IContentWidget, IContentWidgetPosition } from '../../../../editor/browser/editorBrowser.js';
import { Selection } from '../../../../editor/common/core/selection.js';
import { IObservable } from '../../../../base/common/observable.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
/**
 * Content widget that shows a small sparkle icon at the cursor position.
 * When clicked, it shows the overlay widget for inline chat.
 */
export declare class InlineChatEditorAffordance extends Disposable implements IContentWidget {
    private readonly _editor;
    private static _idPool;
    private readonly _id;
    private readonly _domNode;
    private _position;
    private _isVisible;
    readonly allowEditorOverflow = true;
    readonly suppressMouseDown = false;
    constructor(_editor: ICodeEditor, selection: IObservable<Selection | undefined>, instantiationService: IInstantiationService);
    private _show;
    private _hide;
    getId(): string;
    getDomNode(): HTMLElement;
    getPosition(): IContentWidgetPosition | null;
    beforeRender(): IDimension | null;
    dispose(): void;
}
