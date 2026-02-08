import { IProductService } from '../../../../platform/product/common/productService.js';
import { MarkdownString } from '../../../../base/common/htmlContent.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
export declare const IChatTipService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IChatTipService>;
export interface IChatTip {
    readonly id: string;
    readonly content: MarkdownString;
}
export interface IChatTipService {
    readonly _serviceBrand: undefined;
    /**
     * Gets a tip to show for a request, or undefined if a tip has already been shown this session.
     * Only one tip is shown per VS Code session (resets on reload).
     * Tips are only shown for requests created after the service was instantiated.
     * @param requestId The unique ID of the request (used for stable rerenders).
     * @param requestTimestamp The timestamp when the request was created.
     * @param contextKeyService The context key service to evaluate tip eligibility.
     */
    getNextTip(requestId: string, requestTimestamp: number, contextKeyService: IContextKeyService): IChatTip | undefined;
}
export declare class ChatTipService implements IChatTipService {
    private readonly _productService;
    private readonly _configurationService;
    readonly _serviceBrand: undefined;
    /**
     * Timestamp when this service was instantiated.
     * Used to only show tips for requests created after this time.
     */
    private readonly _createdAt;
    /**
     * Whether a tip has already been shown in this window session.
     * Only one tip is shown per session.
     */
    private _hasShownTip;
    /**
     * The request ID that was assigned a tip (for stable rerenders).
     */
    private _tipRequestId;
    /**
     * The tip that was shown (for stable rerenders).
     */
    private _shownTip;
    constructor(_productService: IProductService, _configurationService: IConfigurationService);
    getNextTip(requestId: string, requestTimestamp: number, contextKeyService: IContextKeyService): IChatTip | undefined;
    private _isEligible;
    private _isCopilotEnabled;
    private _createTip;
}
