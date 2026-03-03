import { Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IPowerService, PowerSaveBlockerType, SystemIdleState, ThermalState } from '../common/powerService.js';
/**
 * Browser stub implementation of IPowerService.
 * Power APIs are not available in web environments.
 */
export declare class BrowserPowerService extends Disposable implements IPowerService {
    readonly _serviceBrand: undefined;
    readonly onDidSuspend: Event<any>;
    readonly onDidResume: Event<any>;
    readonly onDidChangeOnBatteryPower: Event<any>;
    readonly onDidChangeThermalState: Event<any>;
    readonly onDidChangeSpeedLimit: Event<any>;
    readonly onWillShutdown: Event<any>;
    readonly onDidLockScreen: Event<any>;
    readonly onDidUnlockScreen: Event<any>;
    getSystemIdleState(_idleThreshold: number): Promise<SystemIdleState>;
    getSystemIdleTime(): Promise<number>;
    getCurrentThermalState(): Promise<ThermalState>;
    isOnBatteryPower(): Promise<boolean>;
    startPowerSaveBlocker(_type: PowerSaveBlockerType): Promise<number>;
    stopPowerSaveBlocker(_id: number): Promise<boolean>;
    isPowerSaveBlockerStarted(_id: number): Promise<boolean>;
}
