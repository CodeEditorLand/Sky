import { IRequestService } from '../../request/common/request.js';
import { AbstractOneDataSystemAppender, IAppInsightsCore } from '../common/1dsAppender.js';
export declare class OneDataSystemAppender extends AbstractOneDataSystemAppender {
    constructor(requestService: IRequestService | undefined, isInternalTelemetry: boolean, eventPrefix: string, defaultData: {
        [key: string]: unknown;
    } | null, iKeyOrClientFactory: string | (() => IAppInsightsCore));
}
