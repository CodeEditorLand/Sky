import { Event } from '../../../base/common/event.js';
export interface IUpdate {
    version: string;
    productVersion?: string;
    timestamp?: number;
    url?: string;
    sha256hash?: string;
}
/**
 * Updates are run as a state machine:
 *
 *      Uninitialized
 *           ↓
 *          Idle
 *          ↓  ↑
 *   Checking for Updates  →  Available for Download
 *         ↓
 *                     ←   Overwriting
 *     Downloading              ↑
 *                     →      Ready
 *         ↓                    ↑
 *     Downloaded      →     Updating
 *
 * Available: There is an update available for download (linux).
 * Ready: Code will be updated as soon as it restarts (win32, darwin).
 * Downloaded: There is an update ready to be installed in the background (win32).
 * Overwriting: A newer update is being downloaded to replace the pending update (darwin).
 */
export declare const enum StateType {
    Uninitialized = "uninitialized",
    Idle = "idle",
    Disabled = "disabled",
    CheckingForUpdates = "checking for updates",
    AvailableForDownload = "available for download",
    Downloading = "downloading",
    Downloaded = "downloaded",
    Updating = "updating",
    Ready = "ready",
    Overwriting = "overwriting"
}
export declare const enum UpdateType {
    Setup = 0,
    Archive = 1,
    Snap = 2
}
export declare const enum DisablementReason {
    NotBuilt = 0,
    DisabledByEnvironment = 1,
    ManuallyDisabled = 2,
    MissingConfiguration = 3,
    InvalidConfiguration = 4,
    RunningAsAdmin = 5
}
export type Uninitialized = {
    type: StateType.Uninitialized;
};
export type Disabled = {
    type: StateType.Disabled;
    reason: DisablementReason;
};
export type Idle = {
    type: StateType.Idle;
    updateType: UpdateType;
    error?: string;
};
export type CheckingForUpdates = {
    type: StateType.CheckingForUpdates;
    explicit: boolean;
};
export type AvailableForDownload = {
    type: StateType.AvailableForDownload;
    update: IUpdate;
};
export type Downloading = {
    type: StateType.Downloading;
    update?: IUpdate;
    explicit: boolean;
    overwrite: boolean;
    downloadedBytes?: number;
    totalBytes?: number;
    startTime?: number;
};
export type Downloaded = {
    type: StateType.Downloaded;
    update: IUpdate;
    explicit: boolean;
    overwrite: boolean;
};
export type Updating = {
    type: StateType.Updating;
    update: IUpdate;
};
export type Ready = {
    type: StateType.Ready;
    update: IUpdate;
    explicit: boolean;
    overwrite: boolean;
};
export type Overwriting = {
    type: StateType.Overwriting;
    update: IUpdate;
    explicit: boolean;
};
export type State = Uninitialized | Disabled | Idle | CheckingForUpdates | AvailableForDownload | Downloading | Downloaded | Updating | Ready | Overwriting;
export declare const State: {
    Uninitialized: Uninitialized;
    Disabled: (reason: DisablementReason) => Disabled;
    Idle: (updateType: UpdateType, error?: string) => Idle;
    CheckingForUpdates: (explicit: boolean) => CheckingForUpdates;
    AvailableForDownload: (update: IUpdate) => AvailableForDownload;
    Downloading: (update: IUpdate | undefined, explicit: boolean, overwrite: boolean, downloadedBytes?: number, totalBytes?: number, startTime?: number) => Downloading;
    Downloaded: (update: IUpdate, explicit: boolean, overwrite: boolean) => Downloaded;
    Updating: (update: IUpdate) => Updating;
    Ready: (update: IUpdate, explicit: boolean, overwrite: boolean) => Ready;
    Overwriting: (update: IUpdate, explicit: boolean) => Overwriting;
};
export interface IAutoUpdater extends Event.NodeEventEmitter {
    setFeedURL(url: string): void;
    checkForUpdates(): void;
    applyUpdate?(): Promise<void>;
    quitAndInstall(): void;
}
export declare const IUpdateService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IUpdateService>;
export interface IUpdateService {
    readonly _serviceBrand: undefined;
    readonly onStateChange: Event<State>;
    readonly state: State;
    checkForUpdates(explicit: boolean): Promise<void>;
    downloadUpdate(): Promise<void>;
    applyUpdate(): Promise<void>;
    quitAndInstall(): Promise<void>;
    isLatestVersion(): Promise<boolean | undefined>;
    _applySpecificUpdate(packagePath: string): Promise<void>;
    disableProgressiveReleases(): Promise<void>;
}
