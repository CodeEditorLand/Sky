import { ServiceCollection } from '../../platform/instantiation/common/serviceCollection.js';
import { ILogService } from '../../platform/log/common/log.js';
import { BrowserMain, IBrowserMainWorkbench } from '../../workbench/browser/web.main.js';
export declare class SessionsBrowserMain extends BrowserMain {
    protected createWorkbench(domElement: HTMLElement, serviceCollection: ServiceCollection, logService: ILogService): IBrowserMainWorkbench;
}
