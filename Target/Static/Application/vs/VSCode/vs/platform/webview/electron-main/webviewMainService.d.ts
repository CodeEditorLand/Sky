import { Disposable } from '../../../base/common/lifecycle.js';
import { FoundInFrameResult, IWebviewManagerService, WebviewWebContentsId, WebviewWindowId } from '../common/webviewManagerService.js';
import { IWindowsMainService } from '../../windows/electron-main/windows.js';
import { IFileService } from '../../files/common/files.js';
export declare class WebviewMainService extends Disposable implements IWebviewManagerService {
    private readonly windowsMainService;
    readonly _serviceBrand: undefined;
    private readonly _onFoundInFrame;
    readonly onFoundInFrame: import("../../../base/common/event.js").Event<FoundInFrameResult>;
    constructor(fileService: IFileService, windowsMainService: IWindowsMainService);
    setIgnoreMenuShortcuts(id: WebviewWebContentsId | WebviewWindowId, enabled: boolean): Promise<void>;
    findInFrame(windowId: WebviewWindowId, frameName: string, text: string, options: {
        findNext?: boolean;
        forward?: boolean;
    }): Promise<void>;
    stopFindInFrame(windowId: WebviewWindowId, frameName: string, options: {
        keepSelection?: boolean;
    }): Promise<void>;
    private getFrameByName;
}
