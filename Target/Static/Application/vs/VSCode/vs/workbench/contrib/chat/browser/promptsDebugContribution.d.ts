import { Disposable } from '../../../../base/common/lifecycle.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { IChatDebugService } from '../common/chatDebugService.js';
import { IPromptsService } from '../common/promptSyntax/service/promptsService.js';
/**
 * Bridges {@link IPromptsService} discovery log events to {@link IChatDebugService}.
 *
 * This contribution listens for discovery events emitted by the prompts service
 * and forwards them as debug log entries. It also registers a resolve provider
 * so expanding a discovery event in the debug panel shows the full file list.
 */
export declare class PromptsDebugContribution extends Disposable implements IWorkbenchContribution {
    static readonly ID = "workbench.contrib.promptsDebug";
    private static readonly MAX_DISCOVERY_DETAILS;
    /**
     * Maps debug event IDs to their discovery info, so that
     * {@link IChatDebugService.resolveEvent} can return rich details.
     */
    private readonly _discoveryEventDetails;
    constructor(promptsService: IPromptsService, chatDebugService: IChatDebugService);
    private _resolveDiscoveryEvent;
}
