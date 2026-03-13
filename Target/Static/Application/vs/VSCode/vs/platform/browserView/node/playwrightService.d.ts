import { Disposable } from '../../../base/common/lifecycle.js';
import { Event } from '../../../base/common/event.js';
import { ILogService } from '../../log/common/log.js';
import { IPlaywrightService } from '../common/playwrightService.js';
import { IBrowserViewGroupRemoteService } from '../node/browserViewGroupRemoteService.js';
import { CDPEvent, CDPRequest, CDPResponse } from '../common/cdp/types.js';
import type { Browser } from 'playwright-core';
interface PlaywrightTransport {
    send(s: CDPRequest): void;
    close(): void;
    onmessage?: (message: CDPResponse | CDPEvent) => void;
    onclose?: (reason?: string) => void;
}
declare module 'playwright-core' {
    interface BrowserType {
        _connectOverCDPTransport(transport: PlaywrightTransport): Promise<Browser>;
    }
}
/**
 * Shared-process implementation of {@link IPlaywrightService}.
 *
 * Creates a {@link PlaywrightPageManager} eagerly on construction to track
 * browser views. The Playwright browser connection is lazily initialised
 * only when an operation that requires it is called.
 */
export declare class PlaywrightService extends Disposable implements IPlaywrightService {
    private readonly windowId;
    private readonly browserViewGroupRemoteService;
    private readonly logService;
    readonly _serviceBrand: undefined;
    private readonly _pages;
    readonly onDidChangeTrackedPages: Event<readonly string[]>;
    private _browser;
    private _initPromise;
    constructor(windowId: number, browserViewGroupRemoteService: IBrowserViewGroupRemoteService, logService: ILogService);
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
    invokeFunctionRaw<T>(pageId: string, fnDef: string, ...args: unknown[]): Promise<T>;
    invokeFunction(pageId: string, fnDef: string, ...args: unknown[]): Promise<{
        result: unknown;
        summary: string;
    }>;
    replyToFileChooser(pageId: string, files: string[]): Promise<{
        summary: string;
    }>;
    replyToDialog(pageId: string, accept: boolean, promptText?: string): Promise<{
        summary: string;
    }>;
    dispose(): void;
}
export {};
