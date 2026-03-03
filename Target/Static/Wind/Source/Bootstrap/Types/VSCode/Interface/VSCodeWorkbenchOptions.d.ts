/**
 * @module Bootstrap/Types/VSCode/Interface/VSCodeWorkbenchOptions
 * @description
 * VSCode Workbench Construction Options.
 * Based on vs/workbench/browser/web.factory.ts
 * @see {@link Bootstrap/Types/VSCode/Interface/VSCodeServiceCollection} Related service collection interface
 * @category Interface
 */
import type { IAuthenticationProvider, ICommand, ICommonTelemetryPropertiesResolver, IDefaultLayout, IDevelopmentOptions, IInitialColorTheme, IProductConfiguration, IProductQualityChangeHandler, ISecretStorageProvider, ISettingsSyncOptions, ITunnelProvider, IUpdateProvider, IUrlCallbackProvider, IWelcomeBanner, IWindowIndicator, IWorkspaceProvider } from "../Type/VSCodeWorkbenchOptionsType.js";
import type { ExtensionId, MarketplaceExtension } from "../Type/VSCodeGenericType.js";
import type { IExternalUriResolver, IRemoteResourceProvider, IResourceUriProvider } from "../Type/VSCodeProviderType.js";
import type { IWebSocketFactory } from "../Type/VSCodeNetworkType.js";
import type { UriComponents } from "../Type/VSCodeUtilityType.js";
/**
 * VSCode Workbench Construction Options interface
 */
export interface IVSCodeWorkbenchOptions {
    remoteAuthority?: string;
    serverBasePath?: string;
    connectionToken?: string | Promise<string>;
    webviewEndpoint?: string;
    webSocketFactory?: IWebSocketFactory;
    resourceUriProvider?: IResourceUriProvider;
    resolveExternalUri?: IExternalUriResolver;
    tunnelProvider?: ITunnelProvider;
    codeExchangeProxyEndpoints?: {
        [providerId: string]: string;
    };
    editSessionId?: string;
    remoteResourceProvider?: IRemoteResourceProvider;
    workspaceProvider?: IWorkspaceProvider;
    settingsSyncOptions?: ISettingsSyncOptions;
    secretStorageProvider?: ISecretStorageProvider;
    additionalBuiltinExtensions?: readonly (MarketplaceExtension | UriComponents)[];
    enabledExtensions?: readonly ExtensionId[];
    additionalTrustedDomains?: string[];
    enableWorkspaceTrust?: boolean;
    openerAllowedExternalUrlPrefixes?: string[];
    urlCallbackProvider?: IUrlCallbackProvider;
    resolveCommonTelemetryProperties?: ICommonTelemetryPropertiesResolver;
    commands?: readonly ICommand[];
    defaultLayout?: IDefaultLayout;
    configurationDefaults?: Record<string, unknown>;
    profile?: {
        readonly name: string;
        readonly contents?: string | UriComponents;
    };
    profileToPreview?: UriComponents;
    updateProvider?: IUpdateProvider;
    productQualityChangeHandler?: IProductQualityChangeHandler;
    welcomeBanner?: IWelcomeBanner;
    productConfiguration?: Partial<IProductConfiguration>;
    windowIndicator?: IWindowIndicator;
    initialColorTheme?: IInitialColorTheme;
    messagePorts?: ReadonlyMap<ExtensionId, MessagePort>;
    authenticationProviders?: readonly IAuthenticationProvider[];
    developmentOptions?: IDevelopmentOptions;
}
//# sourceMappingURL=VSCodeWorkbenchOptions.d.ts.map