import { Disposable } from '../../../../base/common/lifecycle.js';
import { INativeHostService } from '../../../../platform/native/common/native.js';
import { IPowerService, PowerSaveBlockerType, SystemIdleState, ThermalState } from '../common/powerService.js';
import { Event } from '../../../../base/common/event.js';
/**
 * Desktop implementation of IPowerService using Electron's powerMonitor.
 */
export declare class NativePowerService extends Disposable implements IPowerService {
    private readonly nativeHostService;
    readonly _serviceBrand: undefined;
    readonly onDidSuspend: Event<void>;
    readonly onDidResume: Event<void>;
    readonly onDidChangeOnBatteryPower: Event<boolean>;
    readonly onDidChangeThermalState: Event<ThermalState>;
    readonly onDidChangeSpeedLimit: Event<number>;
    readonly onWillShutdown: Event<void>;
    readonly onDidLockScreen: Event<void>;
    readonly onDidUnlockScreen: Event<void>;
    constructor(nativeHostService: INativeHostService);
    getSystemIdleState(idleThreshold: number): Promise<SystemIdleState>;
    getSystemIdleTime(): Promise<number>;
    getCurrentThermalState(): Promise<ThermalState>;
    isOnBatteryPower(): Promise<boolean>;
    startPowerSaveBlocker(type: PowerSaveBlockerType): Promise<number>;
    stopPowerSaveBlocker(id: number): Promise<boolean>;
    isPowerSaveBlockerStarted(id: number): Promise<boolean>;
}
