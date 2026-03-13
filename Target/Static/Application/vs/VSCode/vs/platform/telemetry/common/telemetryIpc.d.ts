import { Event } from '../../../base/common/event.js';
import { IChannel, IServerChannel } from '../../../base/parts/ipc/common/ipc.js';
import { ITelemetryData } from './telemetry.js';
import { ITelemetryAppender } from './telemetryUtils.js';
export interface ITelemetryLog {
    eventName: string;
    data?: ITelemetryData;
}
export declare class TelemetryAppenderChannel implements IServerChannel {
    private appenders;
    constructor(appenders: ITelemetryAppender[]);
    listen<T>(_: unknown, event: string): Event<T>;
    call<T>(_: unknown, command: string, { eventName, data }: ITelemetryLog): Promise<Awaited<T>>;
}
export declare class TelemetryAppenderClient implements ITelemetryAppender {
    private channel;
    constructor(channel: IChannel);
    log(eventName: string, data?: unknown): unknown;
    flush(): Promise<void>;
}
