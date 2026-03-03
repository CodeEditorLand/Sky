/**
 * @module Bootstrap/Types/VSCodeTypes
 * @description
 * VSCode-specific type definitions.
 * Re-exports from atomic VSCode type files.
 * Provides comprehensive type definitions for VSCode integration.
 */
export type { IVSCodeWorkbenchOptions } from "./VSCode/Interface/VSCodeWorkbenchOptions.js";
export type { IVSCodeServiceCollection } from "./VSCode/Interface/VSCodeServiceCollection.js";
export type { IVSCodeServiceIdentifier } from "./VSCode/Interface/VSCodeServiceIdentifier.js";
export type { IVSCodeEnvironmentService } from "./VSCode/Interface/VSCodeEnvironmentService.js";
export type { IVSCodeConfigurationService, Event as ConfigurationEvent, IDisposable as ConfigurationDisposable, } from "./VSCode/Interface/VSCodeConfigurationService.js";
export type { IVSCodeLoggerService } from "./VSCode/Interface/VSCodeLoggerService.js";
export type { ConfigurationTarget, IConfigurationChangeEvent, Event as ConfigEvent, IDisposable as ConfigDisposable, } from "./VSCode/Type/VSCodeConfigurationType.js";
export type { LogLevel, ILogger, ILoggerOptions, Event as LoggerEvent, IDisposable as LoggerDisposable, } from "./VSCode/Type/VSCodeLoggerType.js";
export type { ExtensionId, MarketplaceExtension, ITunnelOptions, ITunnel, } from "./VSCode/Type/VSCodeGenericType.js";
export type { IWebSocketFactory, IWebSocket, } from "./VSCode/Type/VSCodeNetworkType.js";
export type { IResourceUriProvider, IExternalUriResolver, IRemoteResourceProvider, } from "./VSCode/Type/VSCodeProviderType.js";
export type { UriComponents, URI, } from "./VSCode/Type/VSCodeUtilityType.js";
export type { IAuthenticationProvider, ICommand, IDefaultLayout, ICommonTelemetryPropertiesResolver, IDevelopmentOptions, IInitialColorTheme, IProductConfiguration, IProductQualityChangeHandler, ISecretStorageProvider, ISettingsSyncOptions, IUpdateProvider, IUrlCallbackProvider, IWelcomeBanner, IWindowIndicator, IWorkspaceProvider, IWorkspace, IWorkspaceFolder, ITunnelProvider, } from "./VSCode/Type/VSCodeWorkbenchOptionsType.js";
//# sourceMappingURL=VSCodeTypes.d.ts.map