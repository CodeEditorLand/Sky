import './media/chatPullRequestContent.css';
import { Disposable, IDisposable } from '../../../../../../base/common/lifecycle.js';
import { IChatPullRequestContent } from '../../../common/chatService/chatService.js';
import { IChatRendererContent } from '../../../common/model/chatViewModel.js';
import { ChatTreeItem } from '../../chat.js';
import { IChatContentPart } from './chatContentParts.js';
import { IOpenerService } from '../../../../../../platform/opener/common/opener.js';
export declare class ChatPullRequestContentPart extends Disposable implements IChatContentPart {
    private readonly pullRequestContent;
    private readonly openerService;
    readonly domNode: HTMLElement;
    private _onDidChangeHeight;
    readonly onDidChangeHeight: import("../../../../../../base/common/event.js").Event<void>;
    constructor(pullRequestContent: IChatPullRequestContent, openerService: IOpenerService);
    hasSameContent(other: IChatRendererContent, followingContent: IChatRendererContent[], element: ChatTreeItem): boolean;
    addDisposable(disposable: IDisposable): void;
}
