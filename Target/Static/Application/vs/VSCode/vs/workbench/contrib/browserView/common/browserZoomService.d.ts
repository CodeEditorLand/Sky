import { Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
export declare const IBrowserZoomService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IBrowserZoomService>;
/**
 * Special value for the default zoom level setting that instructs the browser view
 * to dynamically match the closest zoom level to the application's current UI zoom.
 */
export declare const MATCH_WINDOW_ZOOM_LABEL = "Match Window";
export interface IBrowserZoomChangeEvent {
    /**
     * The host (e.g. `"example.com"`) whose zoom changed, or `undefined`
     * when the global default zoom level changed.
     */
    readonly host: string | undefined;
    /**
     * Whether the change came from an ephemeral session.
     * - `true`  → only ephemeral views need to react.
     * - `false` → all views (ephemeral and non-ephemeral) for the host may be affected.
     */
    readonly isEphemeralChange: boolean;
}
/**
 * Manages two independent cascading zoom hierarchies for integrated browser views:
 *
 *  Normal views:    `persistent per-host override` ?? `configured default`
 *  Ephemeral views: `ephemeral per-host override`  ?? `configured default`
 *
 * Ephemeral views never see persistent overrides directly. Instead, when a persistent
 * value changes, it is copied into the ephemeral map so that ephemeral views
 * immediately reflect the new level. Conversely, ephemeral changes never affect
 * normal views.
 *
 * Per-host values that equal the current default are always removed (both persistent
 * and ephemeral), so the view tracks the default going forward.
 */
export interface IBrowserZoomService {
    readonly _serviceBrand: undefined;
    /** Fired whenever the effective zoom for a host may have changed. */
    readonly onDidChangeZoom: Event<IBrowserZoomChangeEvent>;
    /**
     * Returns the effective zoom index for the given host and session type.
     * Pass `host = undefined` to obtain only the configured default zoom index.
     */
    getEffectiveZoomIndex(host: string | undefined, isEphemeral: boolean): number;
    /**
     * Set the zoom for a host.
     *
     * Non-ephemeral: persisted to storage. Also propagated into
     * the ephemeral map so ephemeral views immediately reflect the change.
     *
     * Ephemeral: stored in memory only, dropped on restart.
     *
     * In both cases, if the value equals the current default, the entry is removed so the
     * view tracks the default going forward.
     */
    setHostZoomIndex(host: string, zoomIndex: number, isEphemeral: boolean): void;
    /**
     * Notifies the service of the application's current UI zoom factor.
     * Must be called once on startup and again whenever the window zoom changes.
     * Only relevant when the default zoom level is set to `MATCH_WINDOW_LABEL`.
     */
    notifyWindowZoomChanged(windowZoomFactor: number): void;
}
export declare class BrowserZoomService extends Disposable implements IBrowserZoomService {
    private readonly configurationService;
    private readonly storageService;
    readonly _serviceBrand: undefined;
    private readonly _onDidChangeZoom;
    readonly onDidChangeZoom: Event<IBrowserZoomChangeEvent>;
    /**
     * In-memory cache of the persistent per-host map.
     * Backed by IStorageService.
     */
    private _persistentZoomMap;
    /** In-memory only; dropped on restart. */
    private readonly _ephemeralZoomMap;
    private _windowZoomFactor;
    constructor(configurationService: IConfigurationService, storageService: IStorageService);
    getEffectiveZoomIndex(host: string | undefined, isEphemeral: boolean): number;
    setHostZoomIndex(host: string, zoomIndex: number, isEphemeral: boolean): void;
    notifyWindowZoomChanged(windowZoomFactor: number): void;
    private _getDefaultZoomIndex;
    /**
     * Finds the browser zoom index whose factor is closest to the application's current UI zoom
     * factor, measuring distance on a log scale (since window zoom levels are powers of 1.2).
     */
    private _getMatchWindowZoomIndex;
    /**
     * Reads the persistent per-host zoom map from storage.
     * The stored format is a JSON object mapping host strings to zoom indices.
     */
    private _readPersistentZoomMap;
    private _writePersistentZoomMap;
    private _clamp;
}
