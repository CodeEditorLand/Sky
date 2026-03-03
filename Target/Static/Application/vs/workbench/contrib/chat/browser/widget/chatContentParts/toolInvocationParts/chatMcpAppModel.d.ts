import { Event } from '../../../../../../../base/common/event.js';
import { Disposable } from '../../../../../../../base/common/lifecycle.js';
import { IObservable } from '../../../../../../../base/common/observable.js';
import { IInstantiationService } from '../../../../../../../platform/instantiation/common/instantiation.js';
import { ILogService } from '../../../../../../../platform/log/common/log.js';
import { IOpenerService } from '../../../../../../../platform/opener/common/opener.js';
import { IProductService } from '../../../../../../../platform/product/common/productService.js';
import { IStorageService } from '../../../../../../../platform/storage/common/storage.js';
import { McpApps } from '../../../../../mcp/common/modelContextProtocolApps.js';
import { IWebviewService } from '../../../../../webview/browser/webview.js';
import { IChatToolInvocation, IChatToolInvocationSerialized } from '../../../../common/chatService/chatService.js';
import { IChatWidgetService } from '../../../chat.js';
import { IMcpAppRenderData } from './chatMcpAppSubPart.js';
/**
 * Load state for the MCP App model.
 */
export type McpAppLoadState = {
    readonly status: 'loading';
} | {
    readonly status: 'loaded';
} | {
    readonly status: 'error';
    readonly error: Error;
};
/**
 * Model that owns an MCP App webview and all its state/logic.
 * The webview is created lazily on first claim and survives across re-renders.
 */
export declare class ChatMcpAppModel extends Disposable {
    readonly toolInvocation: IChatToolInvocation | IChatToolInvocationSerialized;
    readonly renderData: IMcpAppRenderData;
    private readonly _container;
    private readonly _instantiationService;
    private readonly _chatWidgetService;
    private readonly _webviewService;
    private readonly _logService;
    private readonly _productService;
    private readonly _openerService;
    private static readonly heightCache;
    /** Origin store for persistent webview origins per server */
    private readonly _originStore;
    /** The webview element instance */
    private readonly _webview;
    /** Tool call UI for loading resources and proxying calls */
    private readonly _mcpToolCallUI;
    /** Cancellation source for async operations */
    private readonly _disposeCts;
    /** Whether ui/initialize has been called and capabilities announced */
    private _announcedCapabilities;
    /** Latest CSP used for the frame */
    private _latestCsp;
    /** Current height of the webview */
    private _height;
    /** The persistent webview origin */
    private readonly _webviewOrigin;
    /** Observable for load state */
    private readonly _loadState;
    readonly loadState: IObservable<McpAppLoadState>;
    /** Event fired when height changes */
    private readonly _onDidChangeHeight;
    readonly onDidChangeHeight: Event<void>;
    /** Full host context for the MCP App */
    readonly hostContext: IObservable<McpApps.McpUiHostContext>;
    constructor(toolInvocation: IChatToolInvocation | IChatToolInvocationSerialized, renderData: IMcpAppRenderData, _container: HTMLElement, maxHeight: IObservable<number>, currentWidth: IObservable<number>, _instantiationService: IInstantiationService, _chatWidgetService: IChatWidgetService, _webviewService: IWebviewService, storageService: IStorageService, _logService: ILogService, _productService: IProductService, _openerService: IOpenerService);
    /**
     * Gets the current height of the webview.
     */
    get height(): number;
    remount(): void;
    /**
     * Retries loading the MCP App content.
     */
    retry(): void;
    /**
     * Loads the MCP App content into the webview.
     */
    private _loadContent;
    /**
     * Injects a Content-Security-Policy meta tag into the HTML.
     */
    private _injectPreamble;
    private _prependToHead;
    /**
     * Handles incoming JSON-RPC messages from the webview.
     */
    private _handleWebviewMessage;
    /**
     * Handles the ui/initialize request from the MCP App View.
     */
    private _handleInitialize;
    /**
     * Sends the tool result notification when the result becomes available.
     */
    private _sendToolResult;
    private _handleUiMessage;
    private _handleUpdateModelContext;
    private _handleSizeChanged;
    private _handleSandboxWheel;
    private _handleOpenLink;
    /**
     * Handles tools/call requests from the MCP App.
     */
    private _handleToolsCall;
    /**
     * Handles resources/read requests from the MCP App.
     */
    private _handleResourcesRead;
    private _sendResponse;
    private _sendError;
    private _sendNotification;
    dispose(): void;
}
