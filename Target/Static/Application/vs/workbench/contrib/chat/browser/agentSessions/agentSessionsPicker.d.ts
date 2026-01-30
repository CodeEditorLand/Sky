import { ICommandService } from '../../../../../platform/commands/common/commands.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IQuickInputButton, IQuickInputService } from '../../../../../platform/quickinput/common/quickInput.js';
import { IAgentSession } from './agentSessionsModel.js';
import { IAgentSessionsService } from './agentSessionsService.js';
export declare const archiveButton: IQuickInputButton;
export declare const unarchiveButton: IQuickInputButton;
export declare const renameButton: IQuickInputButton;
export declare const deleteButton: IQuickInputButton;
export declare function getSessionDescription(session: IAgentSession): string;
export declare function getSessionButtons(session: IAgentSession): IQuickInputButton[];
export declare class AgentSessionsPicker {
    private readonly agentSessionsService;
    private readonly quickInputService;
    private readonly instantiationService;
    private readonly commandService;
    private readonly sorter;
    constructor(agentSessionsService: IAgentSessionsService, quickInputService: IQuickInputService, instantiationService: IInstantiationService, commandService: ICommandService);
    pickAgentSession(): Promise<void>;
    private createPickerItems;
    private toPickItem;
}
