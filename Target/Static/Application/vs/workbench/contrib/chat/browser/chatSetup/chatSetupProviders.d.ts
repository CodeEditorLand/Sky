import { CancellationToken } from '../../../../../base/common/cancellation.js';
import { Event } from '../../../../../base/common/event.js';
import { Lazy } from '../../../../../base/common/lazy.js';
import { Disposable, IDisposable } from '../../../../../base/common/lifecycle.js';
import { URI } from '../../../../../base/common/uri.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { ILogService } from '../../../../../platform/log/common/log.js';
import { ITelemetryService } from '../../../../../platform/telemetry/common/telemetry.js';
import { IWorkspaceTrustManagementService } from '../../../../../platform/workspace/common/workspaceTrust.js';
import { IWorkbenchEnvironmentService } from '../../../../services/environment/common/environmentService.js';
import { CountTokensCallback, IPreparedToolInvocation, IToolData, IToolImpl, IToolInvocation, IToolResult, ToolProgress } from '../../common/tools/languageModelToolsService.js';
import { IChatAgentImplementation, IChatAgentRequest, IChatAgentResult } from '../../common/participants/chatAgents.js';
import { ChatEntitlementContext, IChatEntitlementService } from '../../../../services/chat/common/chatEntitlementService.js';
import { IChatProgress } from '../../common/chatService/chatService.js';
import { ChatAgentLocation, ChatModeKind } from '../../common/constants.js';
import { IViewsService } from '../../../../services/views/common/viewsService.js';
import { CodeActionList, Command, NewSymbolName, NewSymbolNameTriggerKind } from '../../../../../editor/common/languages.js';
import { ITextModel } from '../../../../../editor/common/model.js';
import { IRange, Range } from '../../../../../editor/common/core/range.js';
import { Selection } from '../../../../../editor/common/core/selection.js';
import { IMarker, IMarkerService } from '../../../../../platform/markers/common/markers.js';
import { ChatSetupController } from './chatSetupController.js';
export declare class SetupAgent extends Disposable implements IChatAgentImplementation {
    private readonly context;
    private readonly controller;
    private readonly location;
    private readonly instantiationService;
    private readonly logService;
    private readonly telemetryService;
    private readonly environmentService;
    private readonly workspaceTrustManagementService;
    private readonly chatEntitlementService;
    private readonly viewsService;
    static registerDefaultAgents(instantiationService: IInstantiationService, location: ChatAgentLocation, mode: ChatModeKind, context: ChatEntitlementContext, controller: Lazy<ChatSetupController>): {
        agent: SetupAgent;
        disposable: IDisposable;
    };
    static registerBuiltInAgents(instantiationService: IInstantiationService, context: ChatEntitlementContext, controller: Lazy<ChatSetupController>): IDisposable;
    private static doRegisterAgent;
    private static readonly SETUP_NEEDED_MESSAGE;
    private static readonly TRUST_NEEDED_MESSAGE;
    private static readonly CHAT_RETRY_COMMAND_ID;
    private readonly _onUnresolvableError;
    readonly onUnresolvableError: Event<void>;
    private readonly pendingForwardedRequests;
    constructor(context: ChatEntitlementContext, controller: Lazy<ChatSetupController>, location: ChatAgentLocation, instantiationService: IInstantiationService, logService: ILogService, telemetryService: ITelemetryService, environmentService: IWorkbenchEnvironmentService, workspaceTrustManagementService: IWorkspaceTrustManagementService, chatEntitlementService: IChatEntitlementService, viewsService: IViewsService);
    private registerCommands;
    invoke(request: IChatAgentRequest, progress: (parts: IChatProgress[]) => void): Promise<IChatAgentResult>;
    private doInvoke;
    private doInvokeWithoutSetup;
    private forwardRequestToChat;
    private doForwardRequestToChat;
    private doForwardRequestToChatWhenReady;
    private whenLanguageModelReady;
    private whenToolsModelReady;
    private whenAgentReady;
    private whenAgentActivated;
    private doInvokeWithSetup;
    private replaceAgentInRequestModel;
    private replaceToolInRequestModel;
}
export declare class SetupTool implements IToolImpl {
    static registerTool(instantiationService: IInstantiationService, toolData: IToolData): IDisposable;
    invoke(invocation: IToolInvocation, countTokens: CountTokensCallback, progress: ToolProgress, token: CancellationToken): Promise<IToolResult>;
    prepareToolInvocation?(parameters: unknown, token: CancellationToken): Promise<IPreparedToolInvocation | undefined>;
}
export declare class AINewSymbolNamesProvider {
    private readonly context;
    private readonly controller;
    private readonly instantiationService;
    private readonly chatEntitlementService;
    static registerProvider(instantiationService: IInstantiationService, context: ChatEntitlementContext, controller: Lazy<ChatSetupController>): IDisposable;
    constructor(context: ChatEntitlementContext, controller: Lazy<ChatSetupController>, instantiationService: IInstantiationService, chatEntitlementService: IChatEntitlementService);
    provideNewSymbolNames(model: ITextModel, range: IRange, triggerKind: NewSymbolNameTriggerKind, token: CancellationToken): Promise<NewSymbolName[] | undefined>;
}
export declare class ChatCodeActionsProvider {
    private readonly markerService;
    static registerProvider(instantiationService: IInstantiationService): IDisposable;
    constructor(markerService: IMarkerService);
    provideCodeActions(model: ITextModel, range: Range | Selection): Promise<CodeActionList | undefined>;
}
export declare class AICodeActionsHelper {
    static warningOrErrorMarkersAtRange(markerService: IMarkerService, resource: URI, range: Range | Selection): IMarker[];
    static modify(range: Range): Command;
    static generate(range: Range): Command;
    private static rangeToSelection;
    static explainMarkers(markers: IMarker[]): Command;
    static fixMarkers(markers: IMarker[], range: Range): Command;
}
