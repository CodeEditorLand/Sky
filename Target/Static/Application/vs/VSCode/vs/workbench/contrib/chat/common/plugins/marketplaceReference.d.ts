import { URI } from '../../../../../base/common/uri.js';
export declare const enum MarketplaceReferenceKind {
    GitHubShorthand = "githubShorthand",
    GitUri = "gitUri",
    LocalFileUri = "localFileUri"
}
export interface IMarketplaceReference {
    readonly rawValue: string;
    readonly displayLabel: string;
    readonly cloneUrl: string;
    readonly canonicalId: string;
    readonly cacheSegments: readonly string[];
    readonly kind: MarketplaceReferenceKind;
    readonly githubRepo?: string;
    readonly localRepositoryUri?: URI;
}
export declare function parseMarketplaceReferences(values: readonly unknown[]): IMarketplaceReference[];
/**
 * Merges two sets of marketplace references, deduplicating by canonical ID.
 * The first set takes precedence when IDs collide.
 */
export declare function deduplicateMarketplaceReferences(primary: readonly IMarketplaceReference[], secondary: readonly IMarketplaceReference[]): IMarketplaceReference[];
export declare function parseMarketplaceReference(value: string): IMarketplaceReference | undefined;
