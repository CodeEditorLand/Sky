import type * as playwright from 'playwright-core';
import { CancellationToken } from '../../../base/common/cancellation.js';
declare module 'playwright-core' {
    interface Page {
        _snapshotForAI(options?: {
            track?: string;
        }): Promise<{
            full: string;
            incremental?: string;
        }>;
    }
}
/**
 * Wrapper around a Playwright page that tracks additional state like active dialogs and recent console messages,
 * and can produce a summary of the page's current state for use in tools.
 *
 * Loosely based on https://github.com/microsoft/playwright/blob/main/packages/playwright/src/mcp/browser/tab.ts.
 */
export declare class PlaywrightTab {
    /**
     * @deprecated prefer accessing the page via safeRunAgainstPage.
     * Only use this directly if you are sure it cannot be blocked by dialogs.
     */
    private readonly page;
    private _onDialogStateChanged;
    private _dialog;
    private _fileChooser;
    private _logs;
    private _needsFullSnapshot;
    private _initialized;
    constructor(
    /**
     * @deprecated prefer accessing the page via safeRunAgainstPage.
     * Only use this directly if you are sure it cannot be blocked by dialogs.
     */
    page: playwright.Page);
    private _initialize;
    private _handleDialog;
    replyToDialog(accept?: boolean, promptText?: string): Promise<void>;
    private _handleFileChooser;
    replyToFileChooser(files: string[]): Promise<void>;
    private _handleDownload;
    private _handleRequestFailed;
    private _handleConsoleMessage;
    private _handlePageError;
    /**
     * Run a callback against the page and wait for it to complete.
     *
     * Because dialogs pause the page, execution races against any dialog that opens -- if a dialog
     * appears before the callback finishes, the method throws so the caller can surface it to the agent.
     *
     * Also allows for interactions to be handled differently when triggered by agents.
     * E.g. file dialogs should appear when the user triggers one, but not when the agent does.
     */
    safeRunAgainstPage<T>(action: (page: playwright.Page, token: CancellationToken) => Promise<T>): Promise<T>;
    getSummary(full?: boolean): Promise<string>;
    private runAndWaitForCompletion;
}
