/**
 * @module FileSystem/Type/URI
 * @description
 * URI implementation for VSCode-like file system URIs.
 * Handles conversion between URI strings and file system paths.
 * @category Type
 */
/**
 * VSCode-like URI class for representing file system resources
 */
export declare class URI {
    /** URI scheme (e.g., "file") */
    readonly scheme: string;
    /** URI authority (e.g., "localhost") */
    readonly authority: string;
    /** URI path (e.g., "/path/to/file") */
    readonly path: string;
    /** URI query string */
    readonly query: string;
    /** URI fragment */
    readonly fragment: string;
    private constructor();
    /**
     * Create a URI from file path
     * @param path - File system path
     * @returns File URI
     */
    static file(path: string): URI;
    /**
     * Parse a URI string
     * @param value - URI string (e.g., "file:///path/to/file")
     * @returns Parsed URI
     */
    static parse(value: string): URI;
    /**
     * Convert URI to string
     * @returns String representation of the URI
     */
    toString(): string;
    /**
     * Get file system path from file URI
     * @returns File system path, or null if not a file URI
     */
    fsPath(): string | null;
    /**
     * Get directory path from file URI
     * @returns URI of parent directory
     */
    dirname(): URI;
    /**
     * Get file name from URI
     * @returns Base name of the file
     */
    basename(): string;
    /**
     * Join path components to URI
     * @param segments - Path segments to join
     * @returns New URI with joined path
     */
    join(...segments: string[]): URI;
    /**
     * Check if two URIs are equal
     * @param other - URI to compare
     * @returns True if URIs are equal
     */
    equals(other: URI): boolean;
    /**
     * Create URI from JSON object
     * @param json - JSON representation of URI
     * @returns URI instance
     */
    static fromJSON(json: {
        scheme: string;
        authority: string;
        path: string;
        query: string;
        fragment: string;
    }): URI;
    /**
     * Convert URI to JSON object
     * @returns JSON representation of URI
     */
    toJSON(): {
        scheme: string;
        authority: string;
        path: string;
        query: string;
        fragment: string;
    };
}
//# sourceMappingURL=URI.d.ts.map