/**
 * @module Bootstrap/Types/VSCode/Type/VSCodeWorkbenchOptionsType
 * @description
 * Supporting types for VSCode Workbench Options.
 * These are referenced by VSCodeWorkbenchOptions and related interfaces.
 * @category Type
 */
/**
 * Authentication provider interface
 */
export interface IAuthenticationProvider {
    id: string;
    label: string;
}
/**
 * Command interface
 */
export interface ICommand {
    id: string;
    handler: (...args: any[]) => any;
}
/**
 * Default layout interface
 */
export interface IDefaultLayout {
    editors?: any[];
}
/**
 * Common telemetry properties resolver type
 */
export interface ICommonTelemetryPropertiesResolver {
    (): {
        [key: string]: any;
    };
}
/**
 * Development options interface
 */
export interface IDevelopmentOptions {
    enableSmokeTestDriver?: boolean;
    extensionTestsPath?: string;
}
/**
 * Initial color theme interface
 */
export interface IInitialColorTheme {
    theme: string;
}
/**
 * Product configuration interface
 */
export interface IProductConfiguration {
    nameShort: string;
    nameLong: string;
    applicationName: string;
    version: string;
    commit: string;
    date: string;
}
/**
 * Product quality change handler type
 */
export interface IProductQualityChangeHandler {
    (quality: string): void;
}
/**
 * Secret storage provider interface
 */
export interface ISecretStorageProvider {
    get(key: string): Promise<string | undefined>;
    set(key: string, value: string): Promise<void>;
    delete(key: string): Promise<void>;
}
/**
 * Settings sync options interface
 */
export interface ISettingsSyncOptions {
    enabled: boolean;
}
/**
 * Update provider interface
 */
export interface IUpdateProvider {
    available: boolean;
}
/**
 * URL callback provider interface
 */
export interface IUrlCallbackProvider {
    create(options: {
        url: string;
    }): Promise<unknown>;
}
/**
 * Welcome banner interface
 */
export interface IWelcomeBanner {
    title: string;
    message: string;
    icon: string;
}
/**
 * Window indicator interface
 */
export interface IWindowIndicator {
    label: string;
    tooltip: string;
}
/**
 * Workspace provider interface
 */
export interface IWorkspaceProvider {
    workspace?: IWorkspace;
    trusted?: boolean;
}
/**
 * Workspace interface
 */
export interface IWorkspace {
    id: string;
    folders: IWorkspaceFolder[];
    configuration?: unknown;
}
/**
 * Workspace folder interface
 */
export interface IWorkspaceFolder {
    uri: unknown;
    name: string;
    index: number;
}
/**
 * Tunnel provider interface
 */
export interface ITunnelProvider {
    forwardPort?(tunnelOptions: unknown): Promise<unknown>;
}
//# sourceMappingURL=VSCodeWorkbenchOptionsType.d.ts.map