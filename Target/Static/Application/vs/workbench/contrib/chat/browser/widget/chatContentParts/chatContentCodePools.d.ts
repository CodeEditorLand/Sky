import { Disposable } from '../../../../../../base/common/lifecycle.js';
import { IInstantiationService } from '../../../../../../platform/instantiation/common/instantiation.js';
import { IChatRendererDelegate } from '../chatListRenderer.js';
import { ChatEditorOptions } from '../chatOptions.js';
import { CodeBlockPart, CodeCompareBlockPart } from './codeBlockPart.js';
import { IDisposableReference } from './chatCollections.js';
export declare class EditorPool extends Disposable {
    private readonly isSimpleWidget;
    private readonly _pool;
    inUse(): Iterable<CodeBlockPart>;
    constructor(options: ChatEditorOptions, delegate: IChatRendererDelegate, overflowWidgetsDomNode: HTMLElement | undefined, isSimpleWidget: boolean | undefined, instantiationService: IInstantiationService);
    get(): IDisposableReference<CodeBlockPart>;
}
export declare class DiffEditorPool extends Disposable {
    private readonly isSimpleWidget;
    private readonly _pool;
    inUse(): Iterable<CodeCompareBlockPart>;
    constructor(options: ChatEditorOptions, delegate: IChatRendererDelegate, overflowWidgetsDomNode: HTMLElement | undefined, isSimpleWidget: boolean | undefined, instantiationService: IInstantiationService);
    get(): IDisposableReference<CodeCompareBlockPart>;
}
