import { IElementData, INativeBrowserElementsService, IBrowserTargetLocator } from '../common/browserElements.js';
import { CancellationToken } from '../../../base/common/cancellation.js';
import { IRectangle } from '../../window/common/window.js';
import { BrowserWindow } from 'electron';
import { IAuxiliaryWindowsMainService } from '../../auxiliaryWindow/electron-main/auxiliaryWindows.js';
import { IWindowsMainService } from '../../windows/electron-main/windows.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { AddFirstParameterToFunctions } from '../../../base/common/types.js';
import { IBrowserViewMainService } from '../../browserView/electron-main/browserViewMainService.js';
export declare const INativeBrowserElementsMainService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<INativeBrowserElementsMainService>;
export interface INativeBrowserElementsMainService extends AddFirstParameterToFunctions<INativeBrowserElementsService, Promise<unknown>, number | undefined> {
}
interface NodeDataResponse {
    outerHTML: string;
    computedStyle: string;
    bounds: IRectangle;
}
export declare class NativeBrowserElementsMainService extends Disposable implements INativeBrowserElementsMainService {
    private readonly windowsMainService;
    private readonly auxiliaryWindowsMainService;
    private readonly browserViewMainService;
    _serviceBrand: undefined;
    constructor(windowsMainService: IWindowsMainService, auxiliaryWindowsMainService: IAuxiliaryWindowsMainService, browserViewMainService: IBrowserViewMainService);
    get windowId(): never;
    /**
     * Find the webview target that matches the given locator.
     * Checks either webviewId or browserViewId depending on what's provided.
     */
    findWebviewTarget(debuggers: Electron.Debugger, locator: IBrowserTargetLocator): Promise<string | undefined>;
    waitForWebviewTargets(debuggers: Electron.Debugger, locator: IBrowserTargetLocator): Promise<string | undefined>;
    startDebugSession(windowId: number | undefined, token: CancellationToken, locator: IBrowserTargetLocator, cancelAndDetachId?: number): Promise<void>;
    finishOverlay(debuggers: Electron.Debugger, sessionId: string | undefined): Promise<void>;
    getElementData(windowId: number | undefined, rect: IRectangle, token: CancellationToken, locator: IBrowserTargetLocator, cancellationId?: number): Promise<IElementData | undefined>;
    getNodeData(sessionId: string, debuggers: Electron.Debugger, window: BrowserWindow, cancellationId?: number): Promise<NodeDataResponse>;
    formatMatchedStyles(matched: {
        inlineStyle?: {
            cssProperties?: Array<{
                name: string;
                value: string;
            }>;
        };
        matchedCSSRules?: Array<{
            rule: {
                selectorList: {
                    selectors: Array<{
                        text: string;
                    }>;
                };
                origin: string;
                style: {
                    cssProperties: Array<{
                        name: string;
                        value: string;
                    }>;
                };
            };
        }>;
        inherited?: Array<{
            inlineStyle?: {
                cssText: string;
            };
            matchedCSSRules?: Array<{
                rule: {
                    selectorList: {
                        selectors: Array<{
                            text: string;
                        }>;
                    };
                    origin: string;
                    style: {
                        cssProperties: Array<{
                            name: string;
                            value: string;
                        }>;
                    };
                };
            }>;
        }>;
    }): string;
    private windowById;
    private codeWindowById;
    private auxiliaryWindowById;
}
export {};
