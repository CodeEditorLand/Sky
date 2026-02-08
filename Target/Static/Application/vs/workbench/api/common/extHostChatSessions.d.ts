import type * as vscode from 'vscode';
import { CancellationToken } from '../../../base/common/cancellation.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { UriComponents } from '../../../base/common/uri.js';
import { IExtensionDescription } from '../../../platform/extensions/common/extensions.js';
import { ILogService } from '../../../platform/log/common/log.js';
import { IChatSessionItem, IChatSessionProviderOptionItem } from '../../contrib/chat/common/chatSessionsService.js';
import { IChatAgentRequest, IChatAgentResult } from '../../contrib/chat/common/participants/chatAgents.js';
import { ChatSessionDto, ExtHostChatSessionsShape, IChatSessionProviderOptions } from './extHost.protocol.js';
import { ExtHostCommands } from './extHostCommands.js';
import { ExtHostLanguageModels } from './extHostLanguageModels.js';
import { IExtHostRpcService } from './extHostRpcService.js';
export declare class ExtHostChatSessions extends Disposable implements ExtHostChatSessionsShape {
    private readonly commands;
    private readonly _languageModels;
    private readonly _extHostRpc;
    private readonly _logService;
    private static _sessionHandlePool;
    private readonly _proxy;
    private _itemProviderHandlePool;
    private readonly _chatSessionItemProviders;
    private _itemControllerHandlePool;
    private readonly _chatSessionItemControllers;
    private _contentProviderHandlePool;
    private readonly _chatSessionContentProviders;
    /**
     * Map of uri -> chat session items
     *
     * TODO: this isn't cleared/updated properly
     */
    private readonly _sessionItems;
    /**
     * Map of uri -> chat sessions infos
     */
    private readonly _extHostChatSessions;
    /**
     * Store option groups with onSearch callbacks per provider handle
     */
    private readonly _providerOptionGroups;
    constructor(commands: ExtHostCommands, _languageModels: ExtHostLanguageModels, _extHostRpc: IExtHostRpcService, _logService: ILogService);
    registerChatSessionItemProvider(extension: IExtensionDescription, chatSessionType: string, provider: vscode.ChatSessionItemProvider): vscode.Disposable;
    createChatSessionItemController(extension: IExtensionDescription, id: string, refreshHandler: (token: vscode.CancellationToken) => Thenable<void>): vscode.ChatSessionItemController;
    registerChatSessionContentProvider(extension: IExtensionDescription, chatSessionScheme: string, chatParticipant: vscode.ChatParticipant, provider: vscode.ChatSessionContentProvider, capabilities?: vscode.ChatSessionCapabilities): vscode.Disposable;
    private convertChatSessionStatus;
    private convertChatSessionItem;
    $provideChatSessionItems(handle: number, token: vscode.CancellationToken): Promise<IChatSessionItem[]>;
    $provideChatSessionContent(handle: number, sessionResourceComponents: UriComponents, token: CancellationToken): Promise<ChatSessionDto>;
    $provideHandleOptionsChange(handle: number, sessionResourceComponents: UriComponents, updates: ReadonlyArray<{
        optionId: string;
        value: string | IChatSessionProviderOptionItem | undefined;
    }>, token: CancellationToken): Promise<void>;
    $provideChatSessionProviderOptions(handle: number, token: CancellationToken): Promise<IChatSessionProviderOptions | undefined>;
    $interruptChatSessionActiveResponse(providerHandle: number, sessionResource: UriComponents, requestId: string): Promise<void>;
    $disposeChatSessionContent(providerHandle: number, sessionResource: UriComponents): Promise<void>;
    $invokeChatSessionRequestHandler(handle: number, sessionResource: UriComponents, request: IChatAgentRequest, history: any[], token: CancellationToken): Promise<IChatAgentResult>;
    private getModelForRequest;
    private convertRequestTurn;
    private convertReferenceToVariable;
    private convertResponseTurn;
    $invokeOptionGroupSearch(providerHandle: number, optionGroupId: string, query: string, token: CancellationToken): Promise<IChatSessionProviderOptionItem[]>;
    $onDidChangeChatSessionItemState(controllerHandle: number, sessionResourceComponents: UriComponents, archived: boolean): void;
}
