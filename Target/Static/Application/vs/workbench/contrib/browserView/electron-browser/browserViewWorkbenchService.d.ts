import { IBrowserViewWorkbenchService, IBrowserViewModel } from '../common/browserView.js';
import { IMainProcessService } from '../../../../platform/ipc/common/mainProcessService.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
export declare class BrowserViewWorkbenchService implements IBrowserViewWorkbenchService {
    private readonly instantiationService;
    private readonly workspaceContextService;
    readonly _serviceBrand: undefined;
    private readonly _browserViewService;
    private readonly _models;
    constructor(mainProcessService: IMainProcessService, instantiationService: IInstantiationService, workspaceContextService: IWorkspaceContextService);
    getOrCreateBrowserViewModel(id: string): Promise<IBrowserViewModel>;
    clearGlobalStorage(): Promise<void>;
    clearWorkspaceStorage(): Promise<void>;
}
