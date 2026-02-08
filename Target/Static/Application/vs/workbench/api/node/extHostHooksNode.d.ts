import type * as vscode from 'vscode';
import { CancellationToken } from '../../../base/common/cancellation.js';
import { ILogService } from '../../../platform/log/common/log.js';
import { HookTypeValue } from '../../contrib/chat/common/promptSyntax/hookSchema.js';
import { IHookCommandDto } from '../common/extHost.protocol.js';
import { IChatHookExecutionOptions, IExtHostHooks } from '../common/extHostHooks.js';
import { IExtHostRpcService } from '../common/extHostRpcService.js';
import { IHookResult } from '../../contrib/chat/common/hooksExecutionService.js';
export declare class NodeExtHostHooks implements IExtHostHooks {
    private readonly _logService;
    private readonly _mainThreadProxy;
    constructor(extHostRpc: IExtHostRpcService, _logService: ILogService);
    executeHook(hookType: HookTypeValue, options: IChatHookExecutionOptions, token?: CancellationToken): Promise<vscode.ChatHookResult[]>;
    $runHookCommand(hookCommand: IHookCommandDto, input: unknown, token: CancellationToken): Promise<IHookResult>;
    private _executeCommand;
}
