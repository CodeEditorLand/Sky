import type * as vscode from 'vscode';
import { CancellationToken } from '../../../base/common/cancellation.js';
import { HookTypeValue } from '../../contrib/chat/common/promptSyntax/hookSchema.js';
import { ExtHostHooksShape } from './extHost.protocol.js';
export declare const IExtHostHooks: import("../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IExtHostHooks>;
export interface IChatHookExecutionOptions {
    readonly input?: unknown;
    readonly toolInvocationToken: unknown;
}
export interface IExtHostHooks extends ExtHostHooksShape {
    executeHook(hookType: HookTypeValue, options: IChatHookExecutionOptions, token?: CancellationToken): Promise<vscode.ChatHookResult[]>;
}
