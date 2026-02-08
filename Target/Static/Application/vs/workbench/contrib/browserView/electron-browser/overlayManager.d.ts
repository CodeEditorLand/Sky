import { Disposable } from '../../../../base/common/lifecycle.js';
import { Event } from '../../../../base/common/event.js';
import { IDomNodePagePosition } from '../../../../base/browser/dom.js';
import { CodeWindow } from '../../../../base/browser/window.js';
export declare enum BrowserOverlayType {
    Menu = "menu",
    QuickInput = "quickInput",
    Hover = "hover",
    Dialog = "dialog",
    Notification = "notification",
    Unknown = "unknown"
}
export declare const IBrowserOverlayManager: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IBrowserOverlayManager>;
export interface IBrowserOverlayInfo {
    type: BrowserOverlayType;
    rect: IDomNodePagePosition;
}
export interface IBrowserOverlayManager {
    readonly _serviceBrand: undefined;
    /**
     * Event fired when overlay state changes
     */
    readonly onDidChangeOverlayState: Event<void>;
    /**
     * Get overlays overlapping with the given element
     */
    getOverlappingOverlays(element: HTMLElement): IBrowserOverlayInfo[];
}
export declare class BrowserOverlayManager extends Disposable implements IBrowserOverlayManager {
    private readonly targetWindow;
    readonly _serviceBrand: undefined;
    private readonly _onDidChangeOverlayState;
    readonly onDidChangeOverlayState: Event<void>;
    private readonly _overlayCollections;
    private _overlayRectangles;
    private _elementObservers;
    private _structuralObserver;
    private _observerIsConnected;
    private _shadowRootHostCollection;
    private _shadowRootObservers;
    private _shadowRootOverlayCache;
    constructor(targetWindow: CodeWindow);
    private overlays;
    private updateTrackedElements;
    private getRect;
    getOverlappingOverlays(element: HTMLElement): IBrowserOverlayInfo[];
    private isRectanglesOverlapping;
    private stopTrackingElements;
    dispose(): void;
}
