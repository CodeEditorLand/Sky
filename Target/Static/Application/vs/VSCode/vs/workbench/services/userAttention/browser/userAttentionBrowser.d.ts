import { Disposable, IDisposable } from '../../../../base/common/lifecycle.js';
import { IObservable } from '../../../../base/common/observable.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IHostService } from '../../host/browser/host.js';
import { IUserAttentionService } from '../common/userAttentionService.js';
export declare class UserAttentionService extends Disposable implements IUserAttentionService {
    private readonly _logService;
    readonly _serviceBrand: undefined;
    private readonly _isTracingEnabled;
    private readonly _timeKeeper;
    readonly isVsCodeFocused: IObservable<boolean>;
    readonly hasUserAttention: IObservable<boolean>;
    readonly isUserActive: IObservable<boolean>;
    constructor(instantiationService: IInstantiationService, _logService: ILogService);
    fireAfterGivenFocusTimePassed(focusTimeMs: number, callback: () => void): IDisposable;
    get totalFocusTimeMs(): number;
}
export declare class UserAttentionServiceEnv extends Disposable {
    private readonly _hostService;
    private readonly _logService;
    readonly isVsCodeFocused: IObservable<boolean>;
    readonly isUserActive: IObservable<boolean>;
    private readonly _isUserActive;
    private _activityDebounceTimeout;
    constructor(_hostService: IHostService, _logService: ILogService);
    private _markUserActivity;
}
