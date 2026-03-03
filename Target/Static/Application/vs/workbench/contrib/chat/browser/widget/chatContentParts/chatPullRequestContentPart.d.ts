import './media/chatPullRequestContent.css';
import { Disposable, IDisposable } from '../../../../../../base/common/lifecycle.js';
import { IChatPullRequestContent } from '../../../common/chatService/chatService.js';
import { IChatRendererContent } from '../../../common/model/chatViewModel.js';
import { ChatTreeItem } from '../../chat.js';
import { IChatContentPart } from './chatContentParts.js';
import { ICommandService } from '../../../../../../platform/commands/common/commands.js';
export declare class ChatPullRequestContentPart extends Disposable implements IChatContentPart {
    private readonly pullRequestContent;
    private readonly commandService;
    readonly domNode: HTMLElement;
    constructor(pullRequestContent: IChatPullRequestContent, commandService: ICommandService);
    hasSameContent(other: IChatRendererContent, followingContent: IChatRendererContent[], element: ChatTreeItem): boolean;
    addDisposable(disposable: IDisposable): void;
}
