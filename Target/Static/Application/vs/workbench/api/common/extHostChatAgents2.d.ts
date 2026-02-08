import type * as vscode from 'vscode';
import { DeferredPromise } from '../../../base/common/async.js';
import { CancellationToken } from '../../../base/common/cancellation.js';
import { Disposable, DisposableStore } from '../../../base/common/lifecycle.js';
import { UriComponents } from '../../../base/common/uri.js';
import { IExtensionDescription } from '../../../platform/extensions/common/extensions.js';
import { ILogService } from '../../../platform/log/common/log.js';
import { IChatAgentRequest, IChatAgentResult, IChatAgentResultTimings, UserSelectedTools } from '../../contrib/chat/common/participants/chatAgents.js';
import { IChatFollowup, IChatUserActionEvent, IChatVoteAction } from '../../contrib/chat/common/chatService/chatService.js';
import { ChatAgentLocation } from '../../contrib/chat/common/constants.js';
import { Dto } from '../../services/extensions/common/proxyIdentifier.js';
import { ExtHostChatAgentsShape2, IChatAgentCompletionItem, IChatAgentHistoryEntryDto, IChatAgentProgressShape, IChatSessionContextDto, IMainContext } from './extHost.protocol.js';
import { CommandsConverter, ExtHostCommands } from './extHostCommands.js';
import { ExtHostDiagnostics } from './extHostDiagnostics.js';
import { ExtHostDocuments } from './extHostDocuments.js';
import { ExtHostLanguageModels } from './extHostLanguageModels.js';
import { ExtHostLanguageModelTools } from './extHostLanguageModelTools.js';
import { IPromptFileContext, IPromptFileResource } from '../../contrib/chat/common/promptSyntax/service/promptsService.js';
import { PromptsType } from '../../contrib/chat/common/promptSyntax/promptTypes.js';
import { ExtHostDocumentsAndEditors } from './extHostDocumentsAndEditors.js';
export declare class ChatAgentResponseStream {
    private readonly _extension;
    private readonly _request;
    private readonly _proxy;
    private readonly _commandsConverter;
    private readonly _sessionDisposables;
    private readonly _pendingCarouselResolvers;
    private readonly _token;
    private _stopWatch;
    private _isClosed;
    private _firstProgress;
    private _apiObject;
    constructor(_extension: IExtensionDescription, _request: IChatAgentRequest, _proxy: IChatAgentProgressShape, _commandsConverter: CommandsConverter, _sessionDisposables: DisposableStore, _pendingCarouselResolvers: Map</* requestId */ string, Map</* resolveId */ string, DeferredPromise<Record<string, unknown> | undefined>>>, _token: CancellationToken);
    close(): void;
    get timings(): IChatAgentResultTimings;
    get apiObject(): vscode.ChatResponseStream;
}
export declare class ExtHostChatAgents2 extends Disposable implements ExtHostChatAgentsShape2 {
    private readonly _logService;
    private readonly _commands;
    private readonly _documents;
    private readonly _editorsAndDocuments;
    private readonly _languageModels;
    private readonly _diagnostics;
    private readonly _tools;
    private static _idPool;
    private readonly _agents;
    private readonly _proxy;
    private static _participantDetectionProviderIdPool;
    private readonly _participantDetectionProviders;
    private static _contributionsProviderIdPool;
    private readonly _promptFileProviders;
    private readonly _sessionDisposables;
    private readonly _completionDisposables;
    private readonly _inFlightRequests;
    private readonly _pendingCarouselResolvers;
    private readonly _onDidChangeChatRequestTools;
    readonly onDidChangeChatRequestTools: import("../../../base/common/event.js").Event<vscode.ChatRequest>;
    private readonly _onDidDisposeChatSession;
    readonly onDidDisposeChatSession: import("../../../base/common/event.js").Event<string>;
    constructor(mainContext: IMainContext, _logService: ILogService, _commands: ExtHostCommands, _documents: ExtHostDocuments, _editorsAndDocuments: ExtHostDocumentsAndEditors, _languageModels: ExtHostLanguageModels, _diagnostics: ExtHostDiagnostics, _tools: ExtHostLanguageModelTools);
    transferActiveChat(newWorkspace: vscode.Uri): Promise<void>;
    createChatAgent(extension: IExtensionDescription, id: string, handler: vscode.ChatExtendedRequestHandler): vscode.ChatParticipant;
    createDynamicChatAgent(extension: IExtensionDescription, id: string, dynamicProps: vscode.DynamicChatParticipantProps, handler: vscode.ChatExtendedRequestHandler): vscode.ChatParticipant;
    registerChatParticipantDetectionProvider(extension: IExtensionDescription, provider: vscode.ChatParticipantDetectionProvider): vscode.Disposable;
    /**
     * Internal method that handles all prompt file provider types.
     * Routes custom agents, instructions, prompt files, and skills to the unified internal implementation.
     */
    registerPromptFileProvider(extension: IExtensionDescription, type: PromptsType, provider: vscode.ChatCustomAgentProvider | vscode.ChatInstructionsProvider | vscode.ChatPromptFileProvider | vscode.ChatSkillProvider): vscode.Disposable;
    $providePromptFiles(handle: number, type: PromptsType, context: IPromptFileContext, token: CancellationToken): Promise<IPromptFileResource[] | undefined>;
    $detectChatParticipant(handle: number, requestDto: Dto<IChatAgentRequest>, context: {
        history: IChatAgentHistoryEntryDto[];
    }, options: {
        location: ChatAgentLocation;
        participants?: vscode.ChatParticipantMetadata[];
    }, token: CancellationToken): Promise<vscode.ChatParticipantDetectionResult | null | undefined>;
    private _createRequest;
    private getModelForRequest;
    $setRequestTools(requestId: string, tools: UserSelectedTools): Promise<void>;
    $invokeAgent(handle: number, requestDto: Dto<IChatAgentRequest>, context: {
        history: IChatAgentHistoryEntryDto[];
        chatSessionContext?: IChatSessionContextDto;
    }, token: CancellationToken): Promise<IChatAgentResult | undefined>;
    private getDiagnosticsWhenEnabled;
    private getToolsForRequest;
    private prepareHistoryTurns;
    $releaseSession(sessionResourceDto: UriComponents): void;
    $provideFollowups(requestDto: Dto<IChatAgentRequest>, handle: number, result: IChatAgentResult, context: {
        history: IChatAgentHistoryEntryDto[];
    }, token: CancellationToken): Promise<IChatFollowup[]>;
    $acceptFeedback(handle: number, result: IChatAgentResult, voteAction: IChatVoteAction): void;
    $handleQuestionCarouselAnswer(requestId: string, resolveId: string, answers: Record<string, unknown> | undefined): void;
    $acceptAction(handle: number, result: IChatAgentResult, event: IChatUserActionEvent): void;
    $invokeCompletionProvider(handle: number, query: string, token: CancellationToken): Promise<IChatAgentCompletionItem[]>;
    $provideChatTitle(handle: number, context: IChatAgentHistoryEntryDto[], token: CancellationToken): Promise<string | undefined>;
    $provideChatSummary(handle: number, context: IChatAgentHistoryEntryDto[], token: CancellationToken): Promise<string | undefined>;
}
