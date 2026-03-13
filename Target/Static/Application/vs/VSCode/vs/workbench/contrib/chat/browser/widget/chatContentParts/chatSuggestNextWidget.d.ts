import { Event } from '../../../../../../base/common/event.js';
import { Disposable } from '../../../../../../base/common/lifecycle.js';
import { IConfigurationService } from '../../../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../../../platform/contextkey/common/contextkey.js';
import { IContextMenuService } from '../../../../../../platform/contextview/browser/contextView.js';
import { IChatMode } from '../../../common/chatModes.js';
import { IChatSessionsService } from '../../../common/chatSessionsService.js';
import { IHandOff } from '../../../common/promptSyntax/promptFileParser.js';
export interface INextPromptSelection {
    readonly handoff: IHandOff;
    readonly agentId?: string;
    readonly withAutopilot?: boolean;
}
export declare class ChatSuggestNextWidget extends Disposable {
    private readonly configurationService;
    private readonly contextMenuService;
    private readonly chatSessionsService;
    private readonly contextKeyService;
    readonly domNode: HTMLElement;
    private readonly _onDidChangeHeight;
    readonly onDidChangeHeight: Event<void>;
    private readonly _onDidSelectPrompt;
    readonly onDidSelectPrompt: Event<INextPromptSelection>;
    private promptsContainer;
    private titleElement;
    private _currentMode;
    private buttonDisposables;
    constructor(configurationService: IConfigurationService, contextMenuService: IContextMenuService, chatSessionsService: IChatSessionsService, contextKeyService: IContextKeyService);
    get height(): number;
    getCurrentMode(): IChatMode | undefined;
    private createSuggestNextWidget;
    render(mode: IChatMode): void;
    private createPromptButton;
    private createAutopilotButton;
    hide(): void;
    dispose(): void;
}
