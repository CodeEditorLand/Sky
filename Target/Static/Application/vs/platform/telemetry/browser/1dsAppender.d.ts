import { AbstractOneDataSystemAppender, IAppInsightsCore } from '../common/1dsAppender.js';
export declare class OneDataSystemWebAppender extends AbstractOneDataSystemAppender {
    constructor(isInternalTelemetry: boolean, eventPrefix: string, defaultData: {
        [key: string]: unknown;
    } | null, iKeyOrClientFactory: string | (() => IAppInsightsCore));
}
