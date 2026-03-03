import { Disposable } from '../../../base/common/lifecycle.js';
import { Event } from '../../../base/common/event.js';
import { IInstantiationService } from '../../instantiation/common/instantiation.js';
import { IBrowserViewGroupService, IBrowserViewGroupViewEvent } from '../common/browserViewGroup.js';
export declare const IBrowserViewGroupMainService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IBrowserViewGroupMainService>;
export interface IBrowserViewGroupMainService extends IBrowserViewGroupService {
    readonly _serviceBrand: undefined;
}
/**
 * Main-process service that manages {@link BrowserViewGroup} instances.
 *
 * Implements {@link IBrowserViewGroupService} so it can be surfaced to
 * the workbench/shared process via {@link ProxyChannel}.
 */
export declare class BrowserViewGroupMainService extends Disposable implements IBrowserViewGroupMainService {
    private readonly instantiationService;
    readonly _serviceBrand: undefined;
    private readonly groups;
    constructor(instantiationService: IInstantiationService);
    createGroup(): Promise<string>;
    destroyGroup(groupId: string): Promise<void>;
    addViewToGroup(groupId: string, viewId: string): Promise<void>;
    removeViewFromGroup(groupId: string, viewId: string): Promise<void>;
    getDebugWebSocketEndpoint(groupId: string): Promise<string>;
    onDynamicDidAddView(groupId: string): Event<IBrowserViewGroupViewEvent>;
    onDynamicDidRemoveView(groupId: string): Event<IBrowserViewGroupViewEvent>;
    onDynamicDidDestroy(groupId: string): Event<void>;
    /**
     * Get a group or throw if not found.
     */
    private _getGroup;
}
