import { Disposable } from '../../../base/common/lifecycle.js';
import { IExtHostContext } from '../../services/extensions/common/extHostCustomers.js';
import { MainThreadPowerShape, PowerSaveBlockerType, PowerSystemIdleState, PowerThermalState } from '../common/extHost.protocol.js';
import { IPowerService } from '../../services/power/common/powerService.js';
export declare class MainThreadPower extends Disposable implements MainThreadPowerShape {
    private readonly powerService;
    private readonly proxy;
    constructor(extHostContext: IExtHostContext, powerService: IPowerService);
    $getSystemIdleState(idleThreshold: number): Promise<PowerSystemIdleState>;
    $getSystemIdleTime(): Promise<number>;
    $getCurrentThermalState(): Promise<PowerThermalState>;
    $isOnBatteryPower(): Promise<boolean>;
    $startPowerSaveBlocker(type: PowerSaveBlockerType): Promise<number>;
    $stopPowerSaveBlocker(id: number): Promise<boolean>;
    $isPowerSaveBlockerStarted(id: number): Promise<boolean>;
}
