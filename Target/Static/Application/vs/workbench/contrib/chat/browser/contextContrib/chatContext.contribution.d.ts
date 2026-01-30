import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IWorkbenchContribution } from '../../../../common/contributions.js';
import { IChatContextService } from './chatContextService.js';
export declare class ChatContextContribution extends Disposable implements IWorkbenchContribution {
    private readonly _chatContextService;
    static readonly ID = "workbench.contrib.chatContextContribution";
    constructor(_chatContextService: IChatContextService);
}
