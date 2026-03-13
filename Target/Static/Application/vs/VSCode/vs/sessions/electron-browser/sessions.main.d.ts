import { INativeWindowConfiguration } from '../../platform/window/common/window.js';
import { Disposable } from '../../base/common/lifecycle.js';
export declare class SessionsMain extends Disposable {
    private readonly configuration;
    constructor(configuration: INativeWindowConfiguration);
    private init;
    private reviveUris;
    open(): Promise<void>;
    private applyWindowZoomLevel;
    private getExtraClasses;
    private registerListeners;
    private initServices;
    private createConfigurationService;
    private createStorageService;
    private createKeyboardLayoutService;
}
export interface IDesktopMain {
    main(configuration: INativeWindowConfiguration): Promise<void>;
}
export declare function main(configuration: INativeWindowConfiguration): Promise<void>;
