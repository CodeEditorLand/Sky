import { Event } from '../../../base/common/event.js';
export declare const enum McpGalleryResourceType {
    McpServersQueryService = "McpServersQueryService",
    McpServerWebUri = "McpServerWebUriTemplate",
    McpServerVersionUri = "McpServerVersionUriTemplate",
    McpServerIdUri = "McpServerIdUriTemplate",
    McpServerLatestVersionUri = "McpServerLatestVersionUriTemplate",
    McpServerNamedResourceUri = "McpServerNamedResourceUriTemplate",
    PublisherUriTemplate = "PublisherUriTemplate",
    ContactSupportUri = "ContactSupportUri",
    PrivacyPolicyUri = "PrivacyPolicyUri",
    TermsOfServiceUri = "TermsOfServiceUri",
    ReportUri = "ReportUri"
}
export type McpGalleryManifestResource = {
    readonly id: string;
    readonly type: string;
};
export interface IMcpGalleryManifest {
    readonly version: string;
    readonly url: string;
    readonly resources: readonly McpGalleryManifestResource[];
}
export declare const enum McpGalleryManifestStatus {
    Available = "available",
    Unavailable = "unavailable"
}
export declare const IMcpGalleryManifestService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IMcpGalleryManifestService>;
export interface IMcpGalleryManifestService {
    readonly _serviceBrand: undefined;
    readonly mcpGalleryManifestStatus: McpGalleryManifestStatus;
    readonly onDidChangeMcpGalleryManifestStatus: Event<McpGalleryManifestStatus>;
    readonly onDidChangeMcpGalleryManifest: Event<IMcpGalleryManifest | null>;
    getMcpGalleryManifest(): Promise<IMcpGalleryManifest | null>;
}
export declare function getMcpGalleryManifestResourceUri(manifest: IMcpGalleryManifest, type: string): string | undefined;
