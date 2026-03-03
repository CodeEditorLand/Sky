import { IWindowsMainService } from '../../windows/electron-main/windows.js';
import { ExtensionHostDebugBroadcastChannel } from '../common/extensionHostDebugIpc.js';
export declare class ElectronExtensionHostDebugBroadcastChannel<TContext> extends ExtensionHostDebugBroadcastChannel<TContext> {
    private windowsMainService;
    constructor(windowsMainService: IWindowsMainService);
    call(ctx: TContext, command: string, arg?: any): Promise<any>;
    private attachToCurrentWindowRenderer;
    private openExtensionDevelopmentHostWindow;
    private openCdpServer;
    private openCdp;
}
