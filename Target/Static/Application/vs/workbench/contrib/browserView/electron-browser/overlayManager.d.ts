import { Disposable } from '../../../../base/common/lifecycle.js';
import { Event } from '../../../../base/common/event.js';
import { CodeWindow } from '../../../../base/browser/window.js';
export declare const IBrowserOverlayManager: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IBrowserOverlayManager>;
export interface IBrowserOverlayManager {
    readonly _serviceBrand: undefined;
    /**
     * Event fired when overlay state changes
     */
    readonly onDidChangeOverlayState: Event<void>;
    /**
     * Check if the given element overlaps with any overlay
     */
    isOverlappingWithOverlays(element: HTMLElement): boolean;
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
    constructor(targetWindow: CodeWindow);
    private overlays;
    private updateTrackedElements;
    private getRect;
    isOverlappingWithOverlays(element: HTMLElement): boolean;
    private isRectanglesOverlapping;
    private stopTrackingElements;
    dispose(): void;
}
