import { Event } from '../../../../../base/common/event.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { URI } from '../../../../../base/common/uri.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IAgentSession, IAgentSessionsModel } from './agentSessionsModel.js';
export interface IAgentSessionsService {
    readonly _serviceBrand: undefined;
    readonly model: IAgentSessionsModel;
    readonly onDidChangeSessionArchivedState: Event<IAgentSession>;
    getSession(resource: URI): IAgentSession | undefined;
}
export declare class AgentSessionsService extends Disposable implements IAgentSessionsService {
    private readonly instantiationService;
    readonly _serviceBrand: undefined;
    private readonly _onDidChangeSessionArchivedState;
    readonly onDidChangeSessionArchivedState: Event<IAgentSession>;
    private _model;
    get model(): IAgentSessionsModel;
    constructor(instantiationService: IInstantiationService);
    getSession(resource: URI): IAgentSession | undefined;
}
export declare const IAgentSessionsService: import("../../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IAgentSessionsService>;
