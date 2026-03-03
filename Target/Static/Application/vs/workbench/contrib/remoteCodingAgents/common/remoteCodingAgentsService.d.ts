import { Disposable } from '../../../../base/common/lifecycle.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
export interface IRemoteCodingAgent {
    id: string;
    command: string;
    displayName: string;
    description?: string;
    followUpRegex?: string;
    when?: string;
}
export interface IRemoteCodingAgentsService {
    readonly _serviceBrand: undefined;
    getRegisteredAgents(): IRemoteCodingAgent[];
    getAvailableAgents(): IRemoteCodingAgent[];
    registerAgent(agent: IRemoteCodingAgent): void;
}
export declare const IRemoteCodingAgentsService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IRemoteCodingAgentsService>;
export declare class RemoteCodingAgentsService extends Disposable implements IRemoteCodingAgentsService {
    private readonly contextKeyService;
    readonly _serviceBrand: undefined;
    private readonly _ctxHasRemoteCodingAgent;
    private readonly agents;
    private readonly contextKeys;
    constructor(contextKeyService: IContextKeyService);
    getRegisteredAgents(): IRemoteCodingAgent[];
    getAvailableAgents(): IRemoteCodingAgent[];
    registerAgent(agent: IRemoteCodingAgent): void;
    private isAgentAvailable;
    private updateContextKeys;
}
