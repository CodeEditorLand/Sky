import { IQuickPickSeparator } from '../../../../../platform/quickinput/common/quickInput.js';
import { PickerQuickAccessProvider, IPickerQuickAccessItem } from '../../../../../platform/quickinput/browser/pickerQuickAccess.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IAgentSessionsService } from './agentSessionsService.js';
import { ICommandService } from '../../../../../platform/commands/common/commands.js';
export declare const AGENT_SESSIONS_QUICK_ACCESS_PREFIX = "agent ";
export declare class AgentSessionsQuickAccessProvider extends PickerQuickAccessProvider<IPickerQuickAccessItem> {
    private readonly agentSessionsService;
    private readonly instantiationService;
    private readonly commandService;
    private readonly sorter;
    constructor(agentSessionsService: IAgentSessionsService, instantiationService: IInstantiationService, commandService: ICommandService);
    protected _getPicks(filter: string): Promise<(IQuickPickSeparator | IPickerQuickAccessItem)[]>;
    private toPickItem;
}
