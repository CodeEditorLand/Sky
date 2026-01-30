import { Event } from '../../../../../../base/common/event.js';
import { Disposable } from '../../../../../../base/common/lifecycle.js';
import { IContextMenuService } from '../../../../../../platform/contextview/browser/contextView.js';
import { IChatMode } from '../../../common/chatModes.js';
import { IChatSessionsService } from '../../../common/chatSessionsService.js';
import { IHandOff } from '../../../common/promptSyntax/promptFileParser.js';
export interface INextPromptSelection {
    readonly handoff: IHandOff;
    readonly agentId?: string;
}
export declare class ChatSuggestNextWidget extends Disposable {
    private readonly contextMenuService;
    private readonly chatSessionsService;
    readonly domNode: HTMLElement;
    private readonly _onDidChangeHeight;
    readonly onDidChangeHeight: Event<void>;
    private readonly _onDidSelectPrompt;
    readonly onDidSelectPrompt: Event<INextPromptSelection>;
    private promptsContainer;
    private titleElement;
    private _currentMode;
    private buttonDisposables;
    constructor(contextMenuService: IContextMenuService, chatSessionsService: IChatSessionsService);
    get height(): number;
    getCurrentMode(): IChatMode | undefined;
    private createSuggestNextWidget;
    render(mode: IChatMode): void;
    private createPromptButton;
    hide(): void;
    dispose(): void;
}
