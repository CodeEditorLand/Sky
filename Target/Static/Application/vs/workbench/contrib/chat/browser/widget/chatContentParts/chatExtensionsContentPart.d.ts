import './media/chatExtensionsContent.css';
import { Disposable, IDisposable } from '../../../../../../base/common/lifecycle.js';
import { IInstantiationService } from '../../../../../../platform/instantiation/common/instantiation.js';
import { IExtensionsWorkbenchService } from '../../../../extensions/common/extensions.js';
import { IChatExtensionsContent } from '../../../common/chatService/chatService.js';
import { IChatRendererContent } from '../../../common/model/chatViewModel.js';
import { ChatTreeItem, IChatCodeBlockInfo } from '../../chat.js';
import { IChatContentPart } from './chatContentParts.js';
export declare class ChatExtensionsContentPart extends Disposable implements IChatContentPart {
    private readonly extensionsContent;
    readonly domNode: HTMLElement;
    get codeblocks(): IChatCodeBlockInfo[];
    get codeblocksPartId(): string | undefined;
    constructor(extensionsContent: IChatExtensionsContent, extensionsWorkbenchService: IExtensionsWorkbenchService, instantiationService: IInstantiationService);
    hasSameContent(other: IChatRendererContent, followingContent: IChatRendererContent[], element: ChatTreeItem): boolean;
    addDisposable(disposable: IDisposable): void;
}
