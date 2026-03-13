import { Disposable } from '../../../base/common/lifecycle.js';
import { IExtHostContext } from '../../services/extensions/common/extHostCustomers.js';
import { AuthenticationSession, AuthenticationSessionsChangeEvent, IAuthenticationService, IAuthenticationExtensionsService, AuthenticationSessionAccount, IAuthenticationWwwAuthenticateRequest } from '../../services/authentication/common/authentication.js';
import { IRegisterAuthenticationProviderDetails, IRegisterDynamicAuthenticationProviderDetails, MainThreadAuthenticationShape } from '../common/extHost.protocol.js';
import { IDialogService } from '../../../platform/dialogs/common/dialogs.js';
import { INotificationService } from '../../../platform/notification/common/notification.js';
import { IExtensionService } from '../../services/extensions/common/extensions.js';
import { ITelemetryService } from '../../../platform/telemetry/common/telemetry.js';
import { IAuthenticationAccessService } from '../../services/authentication/browser/authenticationAccessService.js';
import { IAuthenticationUsageService } from '../../services/authentication/browser/authenticationUsageService.js';
import { UriComponents } from '../../../base/common/uri.js';
import { IOpenerService } from '../../../platform/opener/common/opener.js';
import { ILogService } from '../../../platform/log/common/log.js';
import { IURLService } from '../../../platform/url/common/url.js';
import { IAuthorizationTokenResponse } from '../../../base/common/oauth.js';
import { IDynamicAuthenticationProviderStorageService } from '../../services/authentication/common/dynamicAuthenticationProviderStorage.js';
import { IClipboardService } from '../../../platform/clipboard/common/clipboardService.js';
import { IQuickInputService } from '../../../platform/quickinput/common/quickInput.js';
import { IProductService } from '../../../platform/product/common/productService.js';
export interface AuthenticationInteractiveOptions {
    detail?: string;
    learnMore?: UriComponents;
    sessionToRecreate?: AuthenticationSession;
}
export interface AuthenticationGetSessionOptions {
    clearSessionPreference?: boolean;
    createIfNone?: boolean | AuthenticationInteractiveOptions;
    forceNewSession?: boolean | AuthenticationInteractiveOptions;
    silent?: boolean;
    account?: AuthenticationSessionAccount;
    authorizationServer?: UriComponents;
}
export declare class MainThreadAuthentication extends Disposable implements MainThreadAuthenticationShape {
    private readonly productService;
    private readonly authenticationService;
    private readonly authenticationExtensionsService;
    private readonly authenticationAccessService;
    private readonly authenticationUsageService;
    private readonly dialogService;
    private readonly notificationService;
    private readonly extensionService;
    private readonly telemetryService;
    private readonly openerService;
    private readonly logService;
    private readonly urlService;
    private readonly dynamicAuthProviderStorageService;
    private readonly clipboardService;
    private readonly quickInputService;
    private readonly _proxy;
    private readonly _registrations;
    private _sentProviderUsageEvents;
    private _suppressUnregisterEvent;
    constructor(extHostContext: IExtHostContext, productService: IProductService, authenticationService: IAuthenticationService, authenticationExtensionsService: IAuthenticationExtensionsService, authenticationAccessService: IAuthenticationAccessService, authenticationUsageService: IAuthenticationUsageService, dialogService: IDialogService, notificationService: INotificationService, extensionService: IExtensionService, telemetryService: ITelemetryService, openerService: IOpenerService, logService: ILogService, urlService: IURLService, dynamicAuthProviderStorageService: IDynamicAuthenticationProviderStorageService, clipboardService: IClipboardService, quickInputService: IQuickInputService);
    $registerAuthenticationProvider({ id, label, supportsMultipleAccounts, resourceServer, supportedAuthorizationServers, supportsChallenges }: IRegisterAuthenticationProviderDetails): Promise<void>;
    $unregisterAuthenticationProvider(id: string): Promise<void>;
    $ensureProvider(id: string): Promise<void>;
    $sendDidChangeSessions(providerId: string, event: AuthenticationSessionsChangeEvent): Promise<void>;
    $removeSession(providerId: string, sessionId: string): Promise<void>;
    $waitForUriHandler(expectedUri: UriComponents): Promise<UriComponents>;
    $showContinueNotification(message: string): Promise<boolean>;
    $registerDynamicAuthenticationProvider(details: IRegisterDynamicAuthenticationProviderDetails): Promise<void>;
    $setSessionsForDynamicAuthProvider(authProviderId: string, clientId: string, sessions: (IAuthorizationTokenResponse & {
        created_at: number;
    })[]): Promise<void>;
    $sendDidChangeDynamicProviderInfo({ providerId, clientId, authorizationServer, label, clientSecret }: Partial<{
        providerId: string;
        clientId: string;
        authorizationServer: UriComponents;
        label: string;
        clientSecret: string;
    }>): Promise<void>;
    private loginPrompt;
    private continueWithIncorrectAccountPrompt;
    private doGetSession;
    $getSession(providerId: string, scopeListOrRequest: ReadonlyArray<string> | IAuthenticationWwwAuthenticateRequest, extensionId: string, extensionName: string, options: AuthenticationGetSessionOptions): Promise<AuthenticationSession | undefined>;
    $getAccounts(providerId: string): Promise<ReadonlyArray<AuthenticationSessionAccount>>;
    private _sentClientIdUsageEvents;
    private sendClientIdUsageTelemetry;
    private sendProviderUsageTelemetry;
    private _getAccountPreference;
    $showDeviceCodeModal(userCode: string, verificationUri: string): Promise<boolean>;
    $promptForClientRegistration(authorizationServerUrl: string): Promise<{
        clientId: string;
        clientSecret?: string;
    } | undefined>;
}
