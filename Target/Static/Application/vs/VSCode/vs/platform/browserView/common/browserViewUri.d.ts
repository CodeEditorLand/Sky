import { URI } from '../../../base/common/uri.js';
/**
 * Helper for creating and parsing browser view URIs.
 */
export declare namespace BrowserViewUri {
    const scheme = "vscode-browser";
    /**
     * Creates a resource URI for a browser view with the given URL.
     * Optionally accepts an ID; if not provided, a new UUID is generated.
     */
    function forUrl(url: string | undefined, id?: string): URI;
    /**
     * Parses a browser view resource URI to extract the ID and URL.
     */
    function parse(resource: URI): {
        id: string;
        url: string;
    } | undefined;
    /**
     * Extracts the ID from a browser view resource URI.
     */
    function getId(resource: URI): string | undefined;
    /**
     * Extracts the URL from a browser view resource URI.
     */
    function getUrl(resource: URI): string | undefined;
}
