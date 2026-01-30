import { CancellationToken } from '../../../../base/common/cancellation.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IObservable } from '../../../../base/common/observable.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IMcpService, IMcpToolCallUIData } from '../common/mcpTypes.js';
import { MCP } from '../common/modelContextProtocol.js';
import { McpApps } from '../common/modelContextProtocolApps.js';
/**
 * Result from loading an MCP App UI resource.
 */
export interface IMcpAppResourceContent extends McpApps.McpUiResourceMeta {
    /** The HTML content of the UI resource */
    readonly html: string;
    /** MIME type of the content */
    readonly mimeType: string;
}
/**
 * Wrapper class that "upgrades" serializable IMcpToolCallUIData into a functional
 * object that can load UI resources and proxy tool/resource calls back to the MCP server.
 */
export declare class McpToolCallUI extends Disposable {
    private readonly _uiData;
    private readonly _mcpService;
    /**
     * Basic host context reflecting the current UI and theme. Notably lacks
     * the `toolInfo` or `viewport` sizes.
     */
    readonly hostContext: IObservable<McpApps.McpUiHostContext>;
    constructor(_uiData: IMcpToolCallUIData, _mcpService: IMcpService, themeService: IThemeService);
    /**
     * Gets the underlying UI data.
     */
    get uiData(): IMcpToolCallUIData;
    /**
     * Logs a message to the MCP server's logger.
     */
    log(log: MCP.LoggingMessageNotificationParams): Promise<void>;
    /**
     * Gets or finds the MCP server for this UI.
     */
    private _getServer;
    /**
     * Loads the UI resource from the MCP server.
     * @param token Cancellation token
     * @returns The HTML content and CSP configuration
     */
    loadResource(token: CancellationToken): Promise<IMcpAppResourceContent>;
    /**
     * Calls a tool on the MCP server.
     * @param name Tool name
     * @param params Tool parameters
     * @param token Cancellation token
     * @returns The tool call result
     */
    callTool(name: string, params: Record<string, unknown>, token: CancellationToken): Promise<MCP.CallToolResult>;
    /**
     * Reads a resource from the MCP server.
     * @param uri Resource URI
     * @param token Cancellation token
     * @returns The resource content
     */
    readResource(uri: string, token: CancellationToken): Promise<MCP.ReadResourceResult>;
}
