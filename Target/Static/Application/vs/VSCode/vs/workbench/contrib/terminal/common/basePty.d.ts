import { Emitter } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import type { IPtyHostProcessReplayEvent, ISerializedCommandDetectionCapability } from '../../../../platform/terminal/common/capabilities/capabilities.js';
import { ProcessPropertyType, type IProcessDataEvent, type IProcessProperty, type IProcessPropertyMap, type IProcessReadyEvent, type ITerminalChildProcess } from '../../../../platform/terminal/common/terminal.js';
/**
 * Responsible for establishing and maintaining a connection with an existing terminal process
 * created on the local pty host.
 */
export declare abstract class BasePty extends Disposable implements Partial<ITerminalChildProcess> {
    readonly id: number;
    readonly shouldPersist: boolean;
    protected readonly _properties: IProcessPropertyMap;
    protected readonly _lastDimensions: {
        cols: number;
        rows: number;
    };
    protected _inReplay: boolean;
    protected readonly _onProcessData: Emitter<string | IProcessDataEvent>;
    readonly onProcessData: import("../../../../base/common/event.js").Event<string | IProcessDataEvent>;
    protected readonly _onProcessReplayComplete: Emitter<void>;
    readonly onProcessReplayComplete: import("../../../../base/common/event.js").Event<void>;
    protected readonly _onProcessReady: Emitter<IProcessReadyEvent>;
    readonly onProcessReady: import("../../../../base/common/event.js").Event<IProcessReadyEvent>;
    protected readonly _onDidChangeProperty: Emitter<IProcessProperty<ProcessPropertyType>>;
    readonly onDidChangeProperty: import("../../../../base/common/event.js").Event<IProcessProperty<ProcessPropertyType>>;
    protected readonly _onProcessExit: Emitter<number | undefined>;
    readonly onProcessExit: import("../../../../base/common/event.js").Event<number | undefined>;
    protected readonly _onRestoreCommands: Emitter<ISerializedCommandDetectionCapability>;
    readonly onRestoreCommands: import("../../../../base/common/event.js").Event<ISerializedCommandDetectionCapability>;
    constructor(id: number, shouldPersist: boolean);
    getInitialCwd(): Promise<string>;
    getCwd(): Promise<string>;
    handleData(e: string | IProcessDataEvent): void;
    handleExit(e: number | undefined): void;
    handleReady(e: IProcessReadyEvent): void;
    handleDidChangeProperty({ type, value }: IProcessProperty): void;
    handleReplay(e: IPtyHostProcessReplayEvent): Promise<void>;
}
