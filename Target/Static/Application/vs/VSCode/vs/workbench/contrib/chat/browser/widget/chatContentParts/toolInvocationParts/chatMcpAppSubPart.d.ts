import { Event } from '../../../../../../../base/common/event.js';
import { URI } from '../../../../../../../base/common/uri.js';
import { IInstantiationService } from '../../../../../../../platform/instantiation/common/instantiation.js';
import { IMarkdownRendererService } from '../../../../../../../platform/markdown/browser/markdownRenderer.js';
import { IChatToolInvocation, IChatToolInvocationSerialized } from '../../../../common/chatService/chatService.js';
import { IChatCodeBlockInfo } from '../../../chat.js';
import { IChatContentPartRenderContext } from '../chatContentParts.js';
import { BaseChatToolInvocationSubPart } from './chatToolInvocationSubPart.js';
/**
 * Data needed to render an MCP App, available before tool completion.
 */
export interface IMcpAppRenderData {
    /** URI of the UI resource for rendering (e.g., "ui://weather-server/dashboard") */
    readonly resourceUri: string;
    /** Reference to the server definition for reconnection */
    readonly serverDefinitionId: string;
    /** Reference to the collection containing the server */
    readonly collectionId: string;
    /** The tool input arguments as a JSON string */
    readonly input: string;
    /** The session resource URI for the chat session */
    readonly sessionResource: URI;
}
/**
 * Sub-part for rendering MCP App webviews in chat tool output.
 * This is a thin view layer that delegates to ChatMcpAppModel.
 */
export declare class ChatMcpAppSubPart extends BaseChatToolInvocationSubPart {
    private readonly _renderData;
    private readonly _instantiationService;
    private readonly _markdownRendererService;
    readonly domNode: HTMLElement;
    readonly codeblocks: IChatCodeBlockInfo[];
    /** The model that owns the webview */
    private readonly _model;
    /** The webview container */
    private readonly _webviewContainer;
    /** Current progress part for loading state */
    private readonly _progressPart;
    /** Current error node */
    private _errorNode;
    /** Container for download resource pills */
    private readonly _downloadContainer;
    /** Current resource group widget for downloads */
    private readonly _downloadWidget;
    constructor(toolInvocation: IChatToolInvocation | IChatToolInvocationSerialized, onDidRemount: Event<void>, context: IChatContentPartRenderContext, _renderData: IMcpAppRenderData, _instantiationService: IInstantiationService, _markdownRendererService: IMarkdownRendererService);
    private _handleLoadStateChange;
    private _updateContainerHeight;
    /**
     * Shows an error message in the container.
     */
    private _showError;
}
