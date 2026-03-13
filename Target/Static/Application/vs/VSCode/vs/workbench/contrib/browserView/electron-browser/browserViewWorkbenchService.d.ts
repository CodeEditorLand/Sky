import { IBrowserViewWorkbenchService, IBrowserViewModel } from '../common/browserView.js';
import { IMainProcessService } from '../../../../platform/ipc/common/mainProcessService.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
export declare class BrowserViewWorkbenchService extends Disposable implements IBrowserViewWorkbenchService {
    private readonly instantiationService;
    private readonly workspaceContextService;
    private readonly keybindingService;
    readonly _serviceBrand: undefined;
    private readonly _browserViewService;
    private readonly _models;
    constructor(mainProcessService: IMainProcessService, instantiationService: IInstantiationService, workspaceContextService: IWorkspaceContextService, keybindingService: IKeybindingService);
    getOrCreateBrowserViewModel(id: string): Promise<IBrowserViewModel>;
    getBrowserViewModel(id: string): Promise<IBrowserViewModel>;
    clearGlobalStorage(): Promise<void>;
    clearWorkspaceStorage(): Promise<void>;
    private _getBrowserViewModel;
    private sendKeybindings;
}
