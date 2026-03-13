import { IMainProcessService } from '../../ipc/common/mainProcessService.js';
import { IBrowserViewGroup } from '../common/browserViewGroup.js';
/**
 * Remote-process service for managing browser view groups.
 *
 * Connects to the main-process {@link BrowserViewGroupMainService} via
 * IPC and provides {@link IBrowserViewGroup} instances for
 * interacting with groups.
 *
 * Usable from the shared process.
 */
export interface IBrowserViewGroupRemoteService {
    /**
     * Create a new browser view group.
     * @param windowId The ID of the primary window the group should be associated with.
     */
    createGroup(windowId: number): Promise<IBrowserViewGroup>;
}
export declare class BrowserViewGroupRemoteService implements IBrowserViewGroupRemoteService {
    private readonly _groupService;
    private readonly _groups;
    constructor(mainProcessService: IMainProcessService);
    createGroup(windowId: number): Promise<IBrowserViewGroup>;
    private _wrap;
}
