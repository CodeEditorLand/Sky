import { ServiceCollection } from '../../platform/instantiation/common/serviceCollection.js';
import { ILogService } from '../../platform/log/common/log.js';
import { Disposable } from '../../base/common/lifecycle.js';
import { IWorkbenchConstructionOptions, IWorkbench } from './web.api.js';
import { WillShutdownEvent } from '../services/lifecycle/common/lifecycle.js';
import { Event } from '../../base/common/event.js';
import { IInstantiationService } from '../../platform/instantiation/common/instantiation.js';
export interface IBrowserMainWorkbench {
    startup(): IInstantiationService;
    readonly onWillShutdown: Event<WillShutdownEvent>;
    readonly onDidShutdown: Event<void>;
}
export declare class BrowserMain extends Disposable {
    private readonly domElement;
    private readonly configuration;
    private readonly onWillShutdownDisposables;
    private readonly indexedDBFileSystemProviders;
    constructor(domElement: HTMLElement, configuration: IWorkbenchConstructionOptions);
    private init;
    open(): Promise<IWorkbench>;
    protected createWorkbench(domElement: HTMLElement, serviceCollection: ServiceCollection, logService: ILogService): IBrowserMainWorkbench;
    private registerListeners;
    private initServices;
    private initializeUserData;
    private registerIndexedDBFileSystemProviders;
    private registerDeveloperActions;
    private createStorageService;
    private createWorkspaceService;
    private getCurrentProfile;
    private resolveWorkspace;
}
