import { CancellationToken } from '../../../../base/common/cancellation.js';
import { Event } from '../../../../base/common/event.js';
import { Lazy } from '../../../../base/common/lazy.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService, RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { IRequestService } from '../../../../platform/request/common/request.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IAuthenticationService } from '../../authentication/common/authentication.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IWorkbenchEnvironmentService } from '../../environment/common/environmentService.js';
import { ILifecycleService } from '../../lifecycle/common/lifecycle.js';
import { IObservable } from '../../../../base/common/observable.js';
import { IDefaultAccountService } from '../../../../platform/defaultAccount/common/defaultAccount.js';
import { IDefaultAccount } from '../../../../base/common/defaultAccount.js';
export declare namespace ChatEntitlementContextKeys {
    const Setup: {
        hidden: RawContextKey<boolean>;
        installed: RawContextKey<boolean>;
        disabled: RawContextKey<boolean>;
        untrusted: RawContextKey<boolean>;
        later: RawContextKey<boolean>;
        registered: RawContextKey<boolean>;
    };
    const Entitlement: {
        signedOut: RawContextKey<boolean>;
        canSignUp: RawContextKey<boolean>;
        planFree: RawContextKey<boolean>;
        planPro: RawContextKey<boolean>;
        planProPlus: RawContextKey<boolean>;
        planBusiness: RawContextKey<boolean>;
        planEnterprise: RawContextKey<boolean>;
        organisations: RawContextKey<string[]>;
        internal: RawContextKey<boolean>;
        sku: RawContextKey<string>;
    };
    const chatQuotaExceeded: RawContextKey<boolean>;
    const completionsQuotaExceeded: RawContextKey<boolean>;
    const chatAnonymous: RawContextKey<boolean>;
}
export declare const IChatEntitlementService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IChatEntitlementService>;
export declare enum ChatEntitlement {
    /** Signed out */
    Unknown = 1,
    /** Signed in but not yet resolved */
    Unresolved = 2,
    /** Signed in and entitled to Free */
    Available = 3,
    /** Signed in but not entitled to Free */
    Unavailable = 4,
    /** Signed-up to Free */
    Free = 5,
    /** Signed-up to Pro */
    Pro = 6,
    /** Signed-up to Pro Plus */
    ProPlus = 7,
    /** Signed-up to Business */
    Business = 8,
    /** Signed-up to Enterprise */
    Enterprise = 9
}
export interface IChatSentiment {
    /**
     * User has Chat installed.
     */
    installed?: boolean;
    /**
     * User signals no intent in using Chat.
     *
     * Note: in contrast to `disabled`, this should not only disable
     * Chat but also hide all of its UI.
     */
    hidden?: boolean;
    /**
     * User signals intent to disable Chat.
     *
     * Note: in contrast to `hidden`, this should not hide
     * Chat but but disable its functionality.
     */
    disabled?: boolean;
    /**
     * Chat is disabled due to missing workspace trust.
     *
     * Note: even though this disables Chat, we want to treat it
     * different from the `disabled` state that is by explicit
     * user choice.
     */
    untrusted?: boolean;
    /**
     * User signals intent to use Chat later.
     */
    later?: boolean;
    /**
     * User has registered as Free or Pro user.
     */
    registered?: boolean;
}
export interface IChatEntitlementService {
    _serviceBrand: undefined;
    readonly onDidChangeEntitlement: Event<void>;
    readonly entitlement: ChatEntitlement;
    readonly entitlementObs: IObservable<ChatEntitlement>;
    readonly organisations: string[] | undefined;
    readonly isInternal: boolean;
    readonly sku: string | undefined;
    readonly onDidChangeQuotaExceeded: Event<void>;
    readonly onDidChangeQuotaRemaining: Event<void>;
    readonly quotas: IQuotas;
    readonly onDidChangeSentiment: Event<void>;
    readonly sentiment: IChatSentiment;
    readonly sentimentObs: IObservable<IChatSentiment>;
    readonly onDidChangeAnonymous: Event<void>;
    readonly anonymous: boolean;
    readonly anonymousObs: IObservable<boolean>;
    update(token: CancellationToken): Promise<void>;
}
/**
 * Checks the chat entitlements to see if the user falls into the paid category
 * @param chatEntitlement The chat entitlement to check
 * @returns Whether or not they are a paid user
 */
export declare function isProUser(chatEntitlement: ChatEntitlement): boolean;
/**
 * Gets the full plan name for the given chat entitlement
 * @param chatEntitlement The chat entitlement to get the plan name for
 * @returns The localized full plan name (e.g., "Copilot Pro", "Copilot Free")
 */
export declare function getChatPlanName(chatEntitlement: ChatEntitlement): string;
interface IChatQuotasAccessor {
    clearQuotas(): void;
    acceptQuotas(quotas: IQuotas): void;
}
export declare class ChatEntitlementService extends Disposable implements IChatEntitlementService {
    private readonly contextKeyService;
    private readonly configurationService;
    private readonly telemetryService;
    _serviceBrand: undefined;
    readonly context: Lazy<ChatEntitlementContext> | undefined;
    readonly requests: Lazy<ChatEntitlementRequests> | undefined;
    constructor(instantiationService: IInstantiationService, productService: IProductService, environmentService: IWorkbenchEnvironmentService, contextKeyService: IContextKeyService, configurationService: IConfigurationService, telemetryService: ITelemetryService);
    readonly onDidChangeEntitlement: Event<void>;
    readonly entitlementObs: IObservable<ChatEntitlement>;
    get entitlement(): ChatEntitlement;
    get isInternal(): boolean;
    get organisations(): string[] | undefined;
    get sku(): string | undefined;
    private readonly _onDidChangeQuotaExceeded;
    readonly onDidChangeQuotaExceeded: Event<void>;
    private readonly _onDidChangeQuotaRemaining;
    readonly onDidChangeQuotaRemaining: Event<void>;
    private _quotas;
    get quotas(): IQuotas;
    private readonly chatQuotaExceededContextKey;
    private readonly completionsQuotaExceededContextKey;
    private ExtensionQuotaContextKeys;
    private registerListeners;
    acceptQuotas(quotas: IQuotas): void;
    private compareQuotas;
    clearQuotas(): void;
    private updateContextKeys;
    readonly onDidChangeSentiment: Event<void>;
    readonly sentimentObs: IObservable<IChatSentiment>;
    get sentiment(): IChatSentiment;
    private readonly anonymousContextKey;
    private readonly _onDidChangeAnonymous;
    readonly onDidChangeAnonymous: Event<void>;
    readonly anonymousObs: IObservable<boolean>;
    get anonymous(): boolean;
    update(token: CancellationToken): Promise<void>;
}
interface IEntitlements {
    readonly entitlement: ChatEntitlement;
    readonly organisations?: string[];
    readonly sku?: string;
    readonly quotas?: IQuotas;
}
export interface IQuotaSnapshot {
    readonly total: number;
    readonly remaining: number;
    readonly percentRemaining: number;
    readonly overageEnabled: boolean;
    readonly overageCount: number;
    readonly unlimited: boolean;
}
interface IQuotas {
    readonly resetDate?: string;
    readonly resetDateHasTime?: boolean;
    readonly chat?: IQuotaSnapshot;
    readonly completions?: IQuotaSnapshot;
    readonly premiumChat?: IQuotaSnapshot;
}
export declare class ChatEntitlementRequests extends Disposable {
    private readonly context;
    private readonly chatQuotasAccessor;
    private readonly telemetryService;
    private readonly logService;
    private readonly requestService;
    private readonly dialogService;
    private readonly openerService;
    private readonly lifecycleService;
    private readonly defaultAccountService;
    private readonly authenticationService;
    private state;
    private pendingResolveCts;
    constructor(context: ChatEntitlementContext, chatQuotasAccessor: IChatQuotasAccessor, telemetryService: ITelemetryService, logService: ILogService, requestService: IRequestService, dialogService: IDialogService, openerService: IOpenerService, lifecycleService: ILifecycleService, defaultAccountService: IDefaultAccountService, authenticationService: IAuthenticationService);
    private registerListeners;
    private resolve;
    private resolveEntitlement;
    private doResolveEntitlement;
    private toQuotas;
    private request;
    private update;
    forceResolveEntitlement(token?: Readonly<CancellationToken>): Promise<IEntitlements | undefined>;
    signUpFree(): Promise<true | false | {
        errorCode: number;
    } | undefined>;
    private doSignUpFree;
    private getSessions;
    private onUnknownSignUpError;
    private onUnprocessableSignUpError;
    signIn(options?: {
        useSocialProvider?: string;
        additionalScopes?: readonly string[];
    }): Promise<{
        defaultAccount?: IDefaultAccount;
        entitlements?: IEntitlements;
    }>;
    dispose(): void;
}
export interface IChatEntitlementContextState extends IChatSentiment {
    /**
     * Users last known or resolved entitlement.
     */
    entitlement: ChatEntitlement;
    /**
     * User's last known or resolved raw SKU type.
     */
    sku: string | undefined;
    /**
     * User's last known or resolved organisations.
     */
    organisations: string[] | undefined;
    /**
     * User is or was a registered Chat user.
     */
    registered?: boolean;
}
export declare class ChatEntitlementContext extends Disposable {
    private readonly storageService;
    private readonly logService;
    private readonly configurationService;
    private readonly telemetryService;
    private static readonly CHAT_ENTITLEMENT_CONTEXT_STORAGE_KEY;
    private static readonly CHAT_DISABLED_CONFIGURATION_KEY;
    private readonly canSignUpContextKey;
    private readonly signedOutContextKey;
    private readonly freeContextKey;
    private readonly proContextKey;
    private readonly proPlusContextKey;
    private readonly businessContextKey;
    private readonly enterpriseContextKey;
    private readonly organisationsContextKey;
    private readonly isInternalContextKey;
    private readonly skuContextKey;
    private readonly hiddenContext;
    private readonly laterContext;
    private readonly installedContext;
    private readonly disabledContext;
    private readonly untrustedContext;
    private readonly registeredContext;
    private _state;
    private suspendedState;
    get state(): IChatEntitlementContextState;
    private readonly _onDidChange;
    readonly onDidChange: Event<void>;
    private updateBarrier;
    constructor(contextKeyService: IContextKeyService, storageService: IStorageService, logService: ILogService, configurationService: IConfigurationService, telemetryService: ITelemetryService);
    private registerListeners;
    private withConfiguration;
    update(context: {
        installed: boolean;
        disabled: boolean;
        untrusted: boolean;
    }): Promise<void>;
    update(context: {
        hidden: false;
    }): Promise<void>;
    update(context: {
        later: boolean;
    }): Promise<void>;
    update(context: {
        entitlement: ChatEntitlement;
        organisations: string[] | undefined;
        sku: string | undefined;
    }): Promise<void>;
    private updateContext;
    private updateContextSync;
    suspend(): void;
    resume(): void;
}
export {};
