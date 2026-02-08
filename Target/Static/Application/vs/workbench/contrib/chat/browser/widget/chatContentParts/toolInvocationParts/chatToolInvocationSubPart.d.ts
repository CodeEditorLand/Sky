import { Emitter } from '../../../../../../../base/common/event.js';
import { Disposable } from '../../../../../../../base/common/lifecycle.js';
import { ThemeIcon } from '../../../../../../../base/common/themables.js';
import { IChatToolInvocation, IChatToolInvocationSerialized } from '../../../../common/chatService/chatService.js';
import { IChatCodeBlockInfo } from '../../../chat.js';
export declare abstract class BaseChatToolInvocationSubPart extends Disposable {
    protected readonly toolInvocation: IChatToolInvocation | IChatToolInvocationSerialized;
    protected static idPool: number;
    abstract readonly domNode: HTMLElement;
    protected _onNeedsRerender: Emitter<void>;
    readonly onNeedsRerender: import("../../../../../../../base/common/event.js").Event<void>;
    abstract codeblocks: IChatCodeBlockInfo[];
    private readonly _codeBlocksPartId;
    get codeblocksPartId(): string;
    constructor(toolInvocation: IChatToolInvocation | IChatToolInvocationSerialized);
    protected getIcon(): ThemeIcon;
}
