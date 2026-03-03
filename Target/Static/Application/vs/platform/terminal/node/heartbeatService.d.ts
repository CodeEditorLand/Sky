import { Disposable } from '../../../base/common/lifecycle.js';
import { IHeartbeatService } from '../common/terminal.js';
export declare class HeartbeatService extends Disposable implements IHeartbeatService {
    private readonly _onBeat;
    readonly onBeat: import("../../../base/common/event.js").Event<void>;
    constructor();
}
