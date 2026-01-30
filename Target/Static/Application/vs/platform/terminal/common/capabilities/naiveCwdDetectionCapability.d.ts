import { ITerminalChildProcess } from '../terminal.js';
import { TerminalCapability, INaiveCwdDetectionCapability } from './capabilities.js';
export declare class NaiveCwdDetectionCapability implements INaiveCwdDetectionCapability {
    private readonly _process;
    constructor(_process: ITerminalChildProcess);
    readonly type = TerminalCapability.NaiveCwdDetection;
    private _cwd;
    private readonly _onDidChangeCwd;
    readonly onDidChangeCwd: import("../../../../base/common/event.js").Event<string>;
    getCwd(): Promise<string>;
}
