import { URI } from '../../../../base/common/uri.js';
import { HookTypeValue, IChatRequestHooks, IHookCommand } from './promptSyntax/hookSchema.js';
import { IDisposable } from '../../../../base/common/lifecycle.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { IOutputService } from '../../../services/output/common/output.js';
export declare const hooksOutputChannelId = "hooksExecution";
export declare const enum HookResultKind {
    Success = 1,
    Error = 2
}
export interface IHookResult {
    readonly kind: HookResultKind;
    readonly result: string | object;
}
export interface IHooksExecutionOptions {
    readonly input?: unknown;
    readonly token?: CancellationToken;
}
/**
 * Callback interface for hook execution proxies.
 * MainThreadHooks implements this to forward calls to the extension host.
 */
export interface IHooksExecutionProxy {
    runHookCommand(hookCommand: IHookCommand, input: unknown, token: CancellationToken): Promise<IHookResult>;
}
export declare const IHooksExecutionService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IHooksExecutionService>;
export interface IHooksExecutionService {
    _serviceBrand: undefined;
    /**
     * Called by mainThreadHooks when extension host is ready
     */
    setProxy(proxy: IHooksExecutionProxy): void;
    /**
     * Register hooks for a session. Returns a disposable that unregisters them.
     */
    registerHooks(sessionResource: URI, hooks: IChatRequestHooks): IDisposable;
    /**
     * Get hooks registered for a session.
     */
    getHooksForSession(sessionResource: URI): IChatRequestHooks | undefined;
    /**
     * Execute hooks of the given type for the given session
     */
    executeHook(hookType: HookTypeValue, sessionResource: URI, options?: IHooksExecutionOptions): Promise<IHookResult[]>;
}
export declare class HooksExecutionService implements IHooksExecutionService {
    private readonly _logService;
    private readonly _outputService;
    readonly _serviceBrand: undefined;
    private _proxy;
    private readonly _sessionHooks;
    private _channelRegistered;
    private _requestCounter;
    constructor(_logService: ILogService, _outputService: IOutputService);
    setProxy(proxy: IHooksExecutionProxy): void;
    private _ensureOutputChannel;
    private _log;
    private _runSingleHook;
    private _logResult;
    registerHooks(sessionResource: URI, hooks: IChatRequestHooks): IDisposable;
    getHooksForSession(sessionResource: URI): IChatRequestHooks | undefined;
    executeHook(hookType: HookTypeValue, sessionResource: URI, options?: IHooksExecutionOptions): Promise<IHookResult[]>;
}
