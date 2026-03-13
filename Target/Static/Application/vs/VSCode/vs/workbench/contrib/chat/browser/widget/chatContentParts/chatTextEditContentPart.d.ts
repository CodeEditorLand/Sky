import { Disposable, IDisposable, IReference } from '../../../../../../base/common/lifecycle.js';
import { IResolvedTextEditorModel } from '../../../../../../editor/common/services/resolverService.js';
import { IChatProgressRenderableResponseContent, IChatTextEditGroup } from '../../../common/model/chatModel.js';
import { IChatResponseViewModel } from '../../../common/model/chatViewModel.js';
import { IChatListItemRendererOptions } from '../../chat.js';
import { DiffEditorPool } from './chatContentCodePools.js';
import { IChatContentPart, IChatContentPartRenderContext } from './chatContentParts.js';
declare const ICodeCompareModelService: import("../../../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ICodeCompareModelService>;
interface ICodeCompareModelService {
    _serviceBrand: undefined;
    createModel(response: IChatResponseViewModel, chatTextEdit: IChatTextEditGroup): Promise<IReference<{
        originalSha1: string;
        original: IResolvedTextEditorModel;
        modified: IResolvedTextEditorModel;
    }>>;
}
export declare class ChatTextEditContentPart extends Disposable implements IChatContentPart {
    private readonly codeCompareModelService;
    readonly domNode: HTMLElement;
    private readonly comparePart;
    constructor(chatTextEdit: IChatTextEditGroup, context: IChatContentPartRenderContext, rendererOptions: IChatListItemRendererOptions, diffEditorPool: DiffEditorPool, currentWidth: number, codeCompareModelService: ICodeCompareModelService);
    layout(width: number): void;
    hasSameContent(other: IChatProgressRenderableResponseContent): boolean;
    addDisposable(disposable: IDisposable): void;
}
export {};
