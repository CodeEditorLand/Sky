import { CancellationToken } from '../../../base/common/cancellation.js';
import { IRectangle } from '../../window/common/window.js';
export declare const INativeBrowserElementsService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<INativeBrowserElementsService>;
export interface IElementAncestor {
    readonly tagName: string;
    readonly id?: string;
    readonly classNames?: string[];
}
export interface IElementData {
    readonly outerHTML: string;
    readonly computedStyle: string;
    readonly bounds: IRectangle;
    readonly ancestors?: IElementAncestor[];
    readonly attributes?: Record<string, string>;
    readonly computedStyles?: Record<string, string>;
    readonly dimensions?: {
        readonly top: number;
        readonly left: number;
        readonly width: number;
        readonly height: number;
    };
    readonly innerText?: string;
}
/**
 * Locator for identifying a browser target/webview.
 * Uses either the parent webview or browser view id to uniquely identify the target.
 */
export interface IBrowserTargetLocator {
    /**
     * Identifier of the parent webview hosting the target.
     *
     * Exactly one of {@link webviewId} or {@link browserViewId} should be provided.
     * Use this when the target is rendered inside a webview.
     */
    readonly webviewId?: string;
    /**
     * Identifier of the browser view hosting the target.
     *
     * Exactly one of {@link webviewId} or {@link browserViewId} should be provided.
     * Use this when the target is rendered inside a browser view rather than a webview.
     */
    readonly browserViewId?: string;
}
export interface INativeBrowserElementsService {
    readonly _serviceBrand: undefined;
    readonly windowId: number;
    getElementData(rect: IRectangle, token: CancellationToken, locator: IBrowserTargetLocator, cancellationId?: number): Promise<IElementData | undefined>;
    getFocusedElementData(rect: IRectangle, token: CancellationToken, locator: IBrowserTargetLocator, cancellationId?: number): Promise<IElementData | undefined>;
    startDebugSession(token: CancellationToken, locator: IBrowserTargetLocator, cancelAndDetachId?: number): Promise<void>;
    startConsoleSession(token: CancellationToken, locator: IBrowserTargetLocator, cancelAndDetachId?: number): Promise<void>;
    getConsoleLogs(locator: IBrowserTargetLocator): Promise<string | undefined>;
}
/**
 * Extract a display name from outer HTML (e.g., "div#myId.myClass1.myClass2")
 */
export declare function getDisplayNameFromOuterHTML(outerHTML: string): string;
