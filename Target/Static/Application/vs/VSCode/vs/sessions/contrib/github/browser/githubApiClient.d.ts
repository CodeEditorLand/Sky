import { Disposable } from '../../../../base/common/lifecycle.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IRequestService } from '../../../../platform/request/common/request.js';
import { IAuthenticationService } from '../../../../workbench/services/authentication/common/authentication.js';
export declare class GitHubApiError extends Error {
    readonly statusCode: number;
    readonly rateLimitRemaining: number | undefined;
    constructor(message: string, statusCode: number, rateLimitRemaining: number | undefined);
}
/**
 * Low-level GitHub REST API client. Handles authentication,
 * request construction, and error classification.
 *
 * This class is stateless with respect to domain data — it only
 * manages auth tokens and raw HTTP communication.
 */
export declare class GitHubApiClient extends Disposable {
    private readonly _requestService;
    private readonly _authenticationService;
    private readonly _logService;
    constructor(_requestService: IRequestService, _authenticationService: IAuthenticationService, _logService: ILogService);
    request<T>(method: string, path: string, callSite: string, body?: unknown): Promise<T>;
    graphql<T>(query: string, callSite: string, variables?: Record<string, unknown>): Promise<T>;
    private _request;
    private _getAuthToken;
}
