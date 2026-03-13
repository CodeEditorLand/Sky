import { Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { IActiveCodeEditor } from '../../../../editor/browser/editorBrowser.js';
import { ICodeEditorService } from '../../../../editor/browser/services/codeEditorService.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IChatAgentService } from '../../chat/common/participants/chatAgents.js';
import { IChatService } from '../../chat/common/chatService/chatService.js';
import { ILanguageModelToolsService } from '../../chat/common/tools/languageModelToolsService.js';
import { IInlineChatSession2, IInlineChatSessionService } from './inlineChatSessionService.js';
export declare class InlineChatError extends Error {
    static readonly code = "InlineChatError";
    constructor(message: string);
}
export declare class InlineChatSessionServiceImpl implements IInlineChatSessionService {
    private readonly _chatService;
    _serviceBrand: undefined;
    private readonly _store;
    private readonly _sessions;
    private readonly _onWillStartSession;
    readonly onWillStartSession: Event<IActiveCodeEditor>;
    private readonly _onDidChangeSessions;
    readonly onDidChangeSessions: Event<this>;
    constructor(_chatService: IChatService, chatAgentService: IChatAgentService);
    dispose(): void;
    createSession(editor: IActiveCodeEditor): IInlineChatSession2;
    getSessionByTextModel(uri: URI): IInlineChatSession2 | undefined;
    getSessionBySessionUri(sessionResource: URI): IInlineChatSession2 | undefined;
}
export declare class InlineChatEnabler {
    static Id: string;
    private readonly _ctxHasProvider2;
    private readonly _ctxHasNotebookProvider;
    private readonly _ctxPossible;
    private readonly _store;
    constructor(contextKeyService: IContextKeyService, chatAgentService: IChatAgentService, editorService: IEditorService, configService: IConfigurationService);
    dispose(): void;
}
export declare class InlineChatEscapeToolContribution extends Disposable {
    static readonly Id = "inlineChat.escapeTool";
    static readonly DONT_ASK_AGAIN_KEY = "inlineChat.dontAskMoveToPanelChat";
    private static readonly _data;
    constructor(lmTools: ILanguageModelToolsService, inlineChatSessionService: IInlineChatSessionService, dialogService: IDialogService, codeEditorService: ICodeEditorService, configurationService: IConfigurationService, chatService: IChatService, logService: ILogService, storageService: IStorageService, instaService: IInstantiationService);
}
