import { Disposable } from '../../../base/common/lifecycle.js';
import { Event } from '../../../base/common/event.js';
import { ILogService } from '../../log/common/log.js';
import { IPlaywrightService } from '../common/playwrightService.js';
import { IBrowserViewGroupRemoteService } from '../node/browserViewGroupRemoteService.js';
import { VSBuffer } from '../../../base/common/buffer.js';
/**
 * Shared-process implementation of {@link IPlaywrightService}.
 *
 * Creates a {@link PlaywrightPageManager} eagerly on construction to track
 * browser views. The Playwright browser connection is lazily initialised
 * only when an operation that requires it is called.
 */
export declare class PlaywrightService extends Disposable implements IPlaywrightService {
    private readonly browserViewGroupRemoteService;
    private readonly logService;
    readonly _serviceBrand: undefined;
    private readonly _pages;
    readonly onDidChangeTrackedPages: Event<readonly string[]>;
    private _browser;
    private _initPromise;
    constructor(browserViewGroupRemoteService: IBrowserViewGroupRemoteService, logService: ILogService);
    startTrackingPage(viewId: string): Promise<void>;
    stopTrackingPage(viewId: string): Promise<void>;
    isPageTracked(viewId: string): Promise<boolean>;
    getTrackedPages(): Promise<readonly string[]>;
    /**
     * Ensure the Playwright browser connection is initialized and the page
     * manager is wired up to the browser view group.
     */
    private initialize;
    openPage(url: string): Promise<{
        pageId: string;
        summary: string;
    }>;
    getSummary(pageId: string): Promise<string>;
    invokeFunction(pageId: string, fnDef: string, ...args: unknown[]): Promise<{
        result: unknown;
        summary: string;
    }>;
    captureScreenshot(pageId: string, selector?: string, fullPage?: boolean): Promise<VSBuffer>;
    replyToFileChooser(pageId: string, files: string[]): Promise<{
        summary: string;
    }>;
    replyToDialog(pageId: string, accept: boolean, promptText?: string): Promise<{
        summary: string;
    }>;
    dispose(): void;
}
