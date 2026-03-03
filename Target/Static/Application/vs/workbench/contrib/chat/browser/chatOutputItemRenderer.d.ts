import { CancellationToken } from '../../../../base/common/cancellation.js';
import { Event } from '../../../../base/common/event.js';
import { Disposable, IDisposable } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { ExtensionIdentifier } from '../../../../platform/extensions/common/extensions.js';
import { IWebview, IWebviewService } from '../../../contrib/webview/browser/webview.js';
import { IExtensionService } from '../../../services/extensions/common/extensions.js';
export interface IChatOutputItemRenderer {
    renderOutputPart(mime: string, data: Uint8Array, webview: IWebview, token: CancellationToken): Promise<void>;
}
interface RegisterOptions {
    readonly extension?: {
        readonly id: ExtensionIdentifier;
        readonly location: URI;
    };
}
export declare const IChatOutputRendererService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IChatOutputRendererService>;
export interface IChatOutputRendererService {
    readonly _serviceBrand: undefined;
    registerRenderer(mime: string, renderer: IChatOutputItemRenderer, options: RegisterOptions): IDisposable;
    renderOutputPart(mime: string, data: Uint8Array, parent: HTMLElement, webviewOptions: RenderOutputPartWebviewOptions, token: CancellationToken): Promise<RenderedOutputPart>;
}
export interface RenderedOutputPart extends IDisposable {
    readonly onDidChangeHeight: Event<number>;
    readonly webview: IWebview;
    reinitialize(): void;
}
interface RenderOutputPartWebviewOptions {
    readonly origin?: string;
    readonly webviewState?: string;
}
export declare class ChatOutputRendererService extends Disposable implements IChatOutputRendererService {
    private readonly _contextKeyService;
    private readonly _extensionService;
    private readonly _webviewService;
    _serviceBrand: undefined;
    private readonly _contributions;
    private readonly _renderers;
    constructor(_contextKeyService: IContextKeyService, _extensionService: IExtensionService, _webviewService: IWebviewService);
    registerRenderer(viewType: string, renderer: IChatOutputItemRenderer, options: RegisterOptions): IDisposable;
    renderOutputPart(mime: string, data: Uint8Array, parent: HTMLElement, webviewOptions: RenderOutputPartWebviewOptions, token: CancellationToken): Promise<RenderedOutputPart>;
    private getRenderer;
    private updateContributions;
}
export {};
