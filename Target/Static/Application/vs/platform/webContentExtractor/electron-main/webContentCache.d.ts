import { URI } from '../../../base/common/uri.js';
import { IWebContentExtractorOptions, WebContentExtractResult } from '../common/webContentExtractor.js';
/**
 * A cache for web content extraction results.
 */
export declare class WebContentCache {
    private static readonly MAX_CACHE_SIZE;
    private static readonly SUCCESS_CACHE_DURATION;
    private static readonly ERROR_CACHE_DURATION;
    private readonly _cache;
    /**
     * Add a web content extraction result to the cache.
     */
    add(uri: URI, options: IWebContentExtractorOptions | undefined, result: WebContentExtractResult): void;
    /**
     * Try to get a cached web content extraction result for the given URI and options.
     */
    tryGet(uri: URI, options: IWebContentExtractorOptions | undefined): WebContentExtractResult | undefined;
    private static getKey;
}
