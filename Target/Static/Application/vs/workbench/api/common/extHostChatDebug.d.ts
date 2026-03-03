import type * as vscode from 'vscode';
import { CancellationToken } from '../../../base/common/cancellation.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { UriComponents } from '../../../base/common/uri.js';
import { ExtHostChatDebugShape, IChatDebugEventDto, IChatDebugResolvedEventContentDto } from './extHost.protocol.js';
import { IExtHostRpcService } from './extHostRpcService.js';
export declare class ExtHostChatDebug extends Disposable implements ExtHostChatDebugShape {
    _serviceBrand: undefined;
    private readonly _proxy;
    private _provider;
    private _nextHandle;
    /** Progress pipelines keyed by `${handle}:${sessionResource}` so multiple sessions can stream concurrently. */
    private readonly _activeProgress;
    constructor(extHostRpc: IExtHostRpcService);
    private _progressKey;
    private _cleanupProgress;
    registerChatDebugLogProvider(provider: vscode.ChatDebugLogProvider): vscode.Disposable;
    $provideChatDebugLog(handle: number, sessionResource: UriComponents, token: CancellationToken): Promise<IChatDebugEventDto[] | undefined>;
    private _serializeEvent;
    $resolveChatDebugLogEvent(_handle: number, eventId: string, token: CancellationToken): Promise<IChatDebugResolvedEventContentDto | undefined>;
    dispose(): void;
}
