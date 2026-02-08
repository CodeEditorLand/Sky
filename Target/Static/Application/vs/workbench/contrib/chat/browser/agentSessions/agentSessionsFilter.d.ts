import { Disposable } from '../../../../../base/common/lifecycle.js';
import { MenuId } from '../../../../../platform/actions/common/actions.js';
import { IStorageService } from '../../../../../platform/storage/common/storage.js';
import { IChatSessionsService } from '../../common/chatSessionsService.js';
import { IAgentSession } from './agentSessionsModel.js';
import { IAgentSessionsFilter, IAgentSessionsFilterExcludes } from './agentSessionsViewer.js';
export declare enum AgentSessionsGrouping {
    Capped = "capped",
    Date = "date"
}
export interface IAgentSessionsFilterOptions extends Partial<IAgentSessionsFilter> {
    readonly filterMenuId?: MenuId;
    readonly limitResults?: () => number | undefined;
    notifyResults?(count: number): void;
    readonly groupResults?: () => AgentSessionsGrouping | undefined;
    overrideExclude?(session: IAgentSession): boolean | undefined;
}
export declare class AgentSessionsFilter extends Disposable implements Required<IAgentSessionsFilter> {
    private readonly options;
    private readonly chatSessionsService;
    private readonly storageService;
    private readonly STORAGE_KEY;
    private readonly _onDidChange;
    readonly onDidChange: import("../../../../../base/common/event.js").Event<void>;
    readonly limitResults: () => number | undefined;
    readonly groupResults: () => AgentSessionsGrouping | undefined;
    private excludes;
    private isStoringExcludes;
    private readonly actionDisposables;
    constructor(options: IAgentSessionsFilterOptions, chatSessionsService: IChatSessionsService, storageService: IStorageService);
    private registerListeners;
    private updateExcludes;
    private storeExcludes;
    private updateFilterActions;
    private registerProviderActions;
    private registerStateActions;
    private registerArchivedActions;
    private registerReadActions;
    private registerResetAction;
    isDefault(): boolean;
    getExcludes(): IAgentSessionsFilterExcludes;
    exclude(session: IAgentSession): boolean;
    notifyResults(count: number): void;
}
