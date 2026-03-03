/**
 * @module Bootstrap/Types/VSCode/Type/VSCodeProviderType
 * @description
 * Provider types for VSCode (resource providers, external URI resolvers, etc.).
 * @category Type
 */
import type { UriComponents } from "./VSCodeUtilityType.js";
/**
 * Resource URI provider interface
 */
export interface IResourceUriProvider {
    (uri: UriComponents): UriComponents;
}
/**
 * External URI resolver interface
 */
export interface IExternalUriResolver {
    (uri: UriComponents): Promise<UriComponents>;
}
/**
 * Remote resource provider interface
 */
export interface IRemoteResourceProvider {
    provideResource(uri: UriComponents): Promise<Uint8Array>;
}
//# sourceMappingURL=VSCodeProviderType.d.ts.map