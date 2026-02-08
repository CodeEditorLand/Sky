import { CancellationToken } from '../../../base/common/cancellation.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { ExtensionIdentifier } from '../../../platform/extensions/common/extensions.js';
import { ILogService } from '../../../platform/log/common/log.js';
import { ILanguageModelToolsService, IToolInvocation, IToolProgressStep, IToolResult } from '../../contrib/chat/common/tools/languageModelToolsService.js';
import { IExtHostContext } from '../../services/extensions/common/extHostCustomers.js';
import { Dto, SerializableObjectWithBuffers } from '../../services/extensions/common/proxyIdentifier.js';
import { IToolDataDto, IToolDefinitionDto, MainThreadLanguageModelToolsShape } from '../common/extHost.protocol.js';
export declare class MainThreadLanguageModelTools extends Disposable implements MainThreadLanguageModelToolsShape {
    private readonly _languageModelToolsService;
    private readonly _logService;
    private readonly _proxy;
    private readonly _tools;
    private readonly _runningToolCalls;
    constructor(extHostContext: IExtHostContext, _languageModelToolsService: ILanguageModelToolsService, _logService: ILogService);
    private getToolDtos;
    $getTools(): Promise<IToolDataDto[]>;
    $invokeTool(dto: Dto<IToolInvocation>, token?: CancellationToken): Promise<Dto<IToolResult> | SerializableObjectWithBuffers<Dto<IToolResult>>>;
    $acceptToolProgress(callId: string, progress: IToolProgressStep): void;
    $countTokensForInvocation(callId: string, input: string, token: CancellationToken): Promise<number>;
    $registerTool(id: string, hasHandleToolStream: boolean): void;
    $registerToolWithDefinition(extensionId: ExtensionIdentifier, definition: IToolDefinitionDto, hasHandleToolStream: boolean): void;
    $unregisterTool(name: string): void;
}
