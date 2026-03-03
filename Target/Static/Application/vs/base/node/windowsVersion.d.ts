/**
 * Initializes the Windows version cache by reading from the registry.
 *
 * On Windows 8.1+, the `os.release()` function may return incorrect version numbers
 * due to the deprecated GetVersionEx API returning compatibility-shimmed values
 * when the application doesn't have a proper manifest. Reading from the registry
 * gives us the real version.
 *
 * See: https://github.com/microsoft/vscode/issues/197444
 */
export declare function initWindowsVersionInfo(): Promise<void>;
/**
 * Gets Windows version information from the registry.
 * @returns The Windows version in Major.Minor.Build format (e.g., "10.0.19041")
 */
export declare function getWindowsRelease(): Promise<string>;
/**
 * Gets the Windows build number from the registry.
 * @returns The Windows build number (e.g., 19041 for Windows 10 2004)
 */
export declare function getWindowsBuildNumberAsync(): Promise<number>;
/**
 * Synchronous version of getWindowsBuildNumberAsync().
 * @returns The Windows build number (e.g., 19041 for Windows 10 2004)
 */
export declare function getWindowsBuildNumberSync(): number;
/**
 * Gets the cached Windows release string synchronously.
 * Falls back to os.release() if the cache hasn't been initialized yet.
 * @returns The Windows version in Major.Minor.Build format (e.g., "10.0.19041")
 */
export declare function getWindowsReleaseSync(): string;
