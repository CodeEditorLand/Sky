import { IConfigurationService } from '../../configuration/common/configuration.js';
import { IMeteredConnectionService } from '../../meteredConnection/common/meteredConnection.js';
import { IProductService } from '../../product/common/productService.js';
import { ClassifiedEvent, IGDPRProperty, OmitMetadata, StrictPropertyCheck } from './gdprTypings.js';
import { ITelemetryData, ITelemetryService, TelemetryLevel, ICommonProperties } from './telemetry.js';
import { ITelemetryAppender } from './telemetryUtils.js';
export interface ITelemetryServiceConfig {
    appenders: ITelemetryAppender[];
    sendErrorTelemetry?: boolean;
    commonProperties?: ICommonProperties;
    piiPaths?: string[];
    /**
     * If true, telemetry events will be buffered until setExperimentProperty is called
     * (up to 10 seconds) to ensure experiment context is attached to all events.
     */
    waitForExperimentProperties?: boolean;
    /**
     * If provided, telemetry events will be dropped when the connection is metered.
     */
    meteredConnectionService?: IMeteredConnectionService;
}
export declare class TelemetryService implements ITelemetryService {
    private _configurationService;
    private _productService;
    static readonly IDLE_START_EVENT_NAME = "UserIdleStart";
    static readonly IDLE_STOP_EVENT_NAME = "UserIdleStop";
    private static readonly BUFFER_FLUSH_TIMEOUT;
    private static readonly MAX_BUFFER_SIZE;
    readonly _serviceBrand: undefined;
    readonly sessionId: string;
    readonly machineId: string;
    readonly sqmId: string;
    readonly devDeviceId: string;
    readonly firstSessionDate: string;
    readonly msftInternal: boolean | undefined;
    private _appenders;
    private _commonProperties;
    private _experimentProperties;
    private _piiPaths;
    private _telemetryLevel;
    private _sendErrorTelemetry;
    private readonly _meteredConnectionService;
    private _pendingEvents;
    private _isExperimentPropertySet;
    private _flushTimeout;
    private readonly _disposables;
    private _cleanupPatterns;
    constructor(config: ITelemetryServiceConfig, _configurationService: IConfigurationService, _productService: IProductService);
    setExperimentProperty(name: string, value: string): void;
    private _flushPendingEvents;
    private _updateTelemetryLevel;
    get sendErrorTelemetry(): boolean;
    get telemetryLevel(): TelemetryLevel;
    dispose(): void;
    private _log;
    private _doLog;
    publicLog(eventName: string, data?: ITelemetryData): void;
    publicLog2<E extends ClassifiedEvent<OmitMetadata<T>> = never, T extends IGDPRProperty = never>(eventName: string, data?: StrictPropertyCheck<T, E>): void;
    publicLogError(errorEventName: string, data?: ITelemetryData): void;
    publicLogError2<E extends ClassifiedEvent<OmitMetadata<T>> = never, T extends IGDPRProperty = never>(eventName: string, data?: StrictPropertyCheck<T, E>): void;
}
