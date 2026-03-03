/**
 * @module FileProtocolShim
 *
 * @description
 * Polyfill for VSCode's vscode-file:// and related protocols.
 * Intercepts protocol requests and routes them to Mountain file system operations.
 *
 * @protocol_map
 * - vscode-file:// → Mountain file:read/write operations
 * - vscode-userdata:// → Mountain user data service
 * - vscode-resource:// → Extension resources via Cocoon
 * - vscode-remote:// → Remote file system via Cocoon
 * - file:// → Standard file operations
 *
 * @phase 1 of Approach A3 implementation
 */
interface FileSystemRequest {
    protocol: string;
    path: string;
    query?: Record<string, string>;
    headers?: Headers;
}
interface FileSystemResponse {
    content: string | Blob | null;
    error?: Error;
    metadata?: {
        mime?: string;
        version?: string;
        etag?: string;
        lastModified?: string;
    };
}
interface ProtocolHandler {
    matches(req: FileSystemRequest): boolean;
    handle(req: FileSystemRequest): Promise<FileSystemResponse>;
}
/**
 * Parse custom protocol URL
 */
declare function parseProtocolURL(url: string): FileSystemRequest;
/**
 * Infer MIME type from file path
 */
declare function inferMimeType(path: string): string;
/**
 * Initialize the File Protocol Shim
 */
export declare function installFileProtocolShim(): void;
/**
 * Export for testing/debugging purposes
 */
export declare const FileProtocolShim: {
    install: typeof installFileProtocolShim;
    handlers: ProtocolHandler[];
    parseProtocolURL: typeof parseProtocolURL;
    inferMimeType: typeof inferMimeType;
};
export {};
//# sourceMappingURL=FileProtocolShim.d.ts.map