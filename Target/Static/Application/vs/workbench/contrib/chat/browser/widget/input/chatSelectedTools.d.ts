import { Disposable } from '../../../../../../base/common/lifecycle.js';
import { IObservable } from '../../../../../../base/common/observable.js';
import { IInstantiationService } from '../../../../../../platform/instantiation/common/instantiation.js';
import { IStorageService } from '../../../../../../platform/storage/common/storage.js';
import { UserSelectedTools } from '../../../common/participants/chatAgents.js';
import { IChatMode } from '../../../common/chatModes.js';
import { ILanguageModelToolsService, IToolAndToolSetEnablementMap } from '../../../common/tools/languageModelToolsService.js';
export declare enum ToolsScope {
    Global = 0,
    Session = 1,
    Agent = 2,
    Agent_ReadOnly = 3
}
export declare class ChatSelectedTools extends Disposable {
    private readonly _mode;
    private readonly _toolsService;
    private readonly _instantiationService;
    private readonly _globalState;
    private readonly _sessionStates;
    constructor(_mode: IObservable<IChatMode>, _toolsService: ILanguageModelToolsService, _storageService: IStorageService, _instantiationService: IInstantiationService);
    /**
     * All tools and tool sets with their enabled state.
     */
    readonly entriesMap: IObservable<IToolAndToolSetEnablementMap>;
    readonly userSelectedTools: IObservable<UserSelectedTools>;
    get entriesScope(): ToolsScope;
    get currentMode(): IChatMode;
    resetSessionEnablementState(): void;
    set(enablementMap: IToolAndToolSetEnablementMap, sessionOnly: boolean): void;
    private updateCustomModeTools;
}
