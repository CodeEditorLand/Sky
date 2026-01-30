import { CancellationToken } from '../../../../base/common/cancellation.js';
import { Event } from '../../../../base/common/event.js';
import { Disposable, IDisposable } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
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
}
export declare class ChatOutputRendererService extends Disposable implements IChatOutputRendererService {
    private readonly _webviewService;
    private readonly _extensionService;
    _serviceBrand: undefined;
    private readonly _contributions;
    private readonly _renderers;
    constructor(_webviewService: IWebviewService, _extensionService: IExtensionService);
    registerRenderer(viewType: string, renderer: IChatOutputItemRenderer, options: RegisterOptions): IDisposable;
    renderOutputPart(mime: string, data: Uint8Array, parent: HTMLElement, webviewOptions: RenderOutputPartWebviewOptions, token: CancellationToken): Promise<RenderedOutputPart>;
    private getRenderer;
    private updateContributions;
}
export {};
