import type { BrowserWindow, BrowserWindowConstructorOptions } from 'electron';
import { Disposable } from '../../../base/common/lifecycle.js';
import { URI } from '../../../base/common/uri.js';
import { ILogService } from '../../log/common/log.js';
import { IWebContentExtractorOptions, WebContentExtractResult } from '../common/webContentExtractor.js';
/**
 * A web page loader that uses Electron to load web pages and extract their content.
 */
export declare class WebPageLoader extends Disposable {
    private readonly _logger;
    private readonly _uri;
    private readonly _options;
    private readonly _isTrustedDomain;
    private static readonly TIMEOUT;
    private static readonly POST_LOAD_TIMEOUT;
    private static readonly FRAME_TIMEOUT;
    private static readonly EXTRACT_CONTENT_TIMEOUT;
    private static readonly IDLE_DEBOUNCE_TIME;
    private static readonly MIN_CONTENT_LENGTH;
    private readonly _window;
    private readonly _debugger;
    private readonly _requests;
    private readonly _queue;
    private readonly _timeout;
    private readonly _idleDebounceTimer;
    private _onResult;
    private _didFinishLoad;
    constructor(browserWindowFactory: (options: BrowserWindowConstructorOptions) => BrowserWindow, _logger: ILogService, _uri: URI, _options: IWebContentExtractorOptions | undefined, _isTrustedDomain: (uri: URI) => boolean);
    private trace;
    /**
     * Loads the web page and extracts its content.
     */
    load(): Promise<WebContentExtractResult>;
    /**
     * Sets a timeout to trigger content extraction regardless of current loading state.
     */
    private setTimeout;
    /**
     * Updates HTTP headers for each web request.
     */
    private onBeforeSendHeaders;
    /**
     * Handles the 'did-start-loading' event, enabling network tracking.
     */
    private onStartLoading;
    /**
     * Handles the 'did-finish-load' event, checking for idle state
     * and updating timeout to allow for post-load activities.
     */
    private onFinishLoad;
    /**
     * Handles the 'did-fail-load' event, reporting load failures.
     */
    private onFailLoad;
    /**
     * Handles the 'will-navigate' and 'will-redirect' events, managing redirects.
     */
    private onRedirect;
    /**
     * Normalizes an authority by removing the 'www.' prefix if present.
     */
    private normalizeAuthority;
    /**
     * Handles debugger messages related to network requests, tracking their lifecycle.
     * @note DO NOT add logging to this function, microsoft.com will freeze when too many logs are generated
     */
    private onDebugMessage;
    /**
     * Schedules an idle check after a debounce period to allow for bursts of network activity.
     * If idle is detected, proceeds to extract content.
     */
    private scheduleIdleCheck;
    /**
     * Waits for a rendering frame to ensure the page had a chance to update.
     */
    private nextFrame;
    /**
     * Extracts the content of the loaded web page using the Accessibility domain and reports the result.
     */
    private extractContent;
    /**
     * Extracts content from the Accessibility tree of the loaded web page.
     * @param token Cancellation token to abort the operation.
     * @return The extracted content, or undefined if extraction fails or is cancelled.
     */
    private extractAccessibilityTreeContent;
    /**
     * Fallback method for extracting web page content when Accessibility tree extraction yields insufficient content.
     * Attempts to extract meaningful text content from the main DOM elements of the loaded web page.
     * @returns The extracted text content, or undefined if extraction fails.
     */
    private extractMainDomElementContent;
}
