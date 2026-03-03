import { IMainProcessService } from '../../ipc/common/mainProcessService.js';
import { IBrowserViewGroup } from '../common/browserViewGroup.js';
export declare const IBrowserViewGroupRemoteService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IBrowserViewGroupRemoteService>;
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
    readonly _serviceBrand: undefined;
    /**
     * Create a new browser view group.
     */
    createGroup(): Promise<IBrowserViewGroup>;
}
export declare class BrowserViewGroupRemoteService implements IBrowserViewGroupRemoteService {
    readonly _serviceBrand: undefined;
    private readonly _groupService;
    private readonly _groups;
    constructor(mainProcessService: IMainProcessService);
    createGroup(): Promise<IBrowserViewGroup>;
    private _wrap;
}
