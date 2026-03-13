import { URI } from '../../../base/common/uri.js';
import { ILogService } from '../../log/common/log.js';
import { IWebContentExtractorOptions, IWebContentExtractorService, WebContentExtractResult } from '../common/webContentExtractor.js';
export declare class NativeWebContentExtractorService implements IWebContentExtractorService {
    private readonly _logger;
    _serviceBrand: undefined;
    private _limiter;
    private _webContentsCache;
    constructor(_logger: ILogService);
    extract(uris: URI[], options?: IWebContentExtractorOptions): Promise<WebContentExtractResult[]>;
    doExtract(uri: URI, options: IWebContentExtractorOptions | undefined): Promise<WebContentExtractResult>;
}
