/**
 * @module ProcessPolyfill
 *
 * @description
 * Extended polyfill for Node.js process object in the renderer sandbox.
 * Provides comprehensive process information and utilities for the Electron workbench.
 *
 * @feature_set
 * - argv - Command line arguments for workbench
 * - execPath - Application executable path
 * - execArgv - Node.js exec args
 * - env - Environment variables
 * - platform, arch - Platform detection
 * - versions - Node.js, Chrome, Electron versions
 * - pid, ppid - Process IDs
 * - cwd() - Current working directory
 * - hrtime() - High-resolution timer
 * - cpuUsage() - CPU usage
 * - getProcessMemoryInfo() - Memory info
 * - shellEnv() - Shell environment
 * - exit(code) - Process exit
 * - kill(pid, signal) - Kill process
 * - umask(mask) - Umask
 * - on(type, callback) - Event listeners
 *
 * @phase 3 of Approach A3 implementation
 */
/**
 * Process versions object
 */
interface ProcessVersions {
    node: string;
    chrome: string;
    electron: string;
    v8?: string;
    uv?: string;
    zlib?: string;
    brotli?: string;
    ares?: string;
    modules?: string;
    nghttp2?: string;
    napi?: string;
    openssl?: string;
}
/**
 * Process CPU usage snapshot
 */
interface ProcessCpuUsage {
    user: number;
    system: number;
}
/**
 * Process memory info
 */
interface ProcessMemoryInfo {
    workingSetSize: number;
    peakWorkingSetSize: number;
    privateBytes: number;
    sharedBytes: number;
    residentSet: number;
    heapTotal?: number;
    heapUsed?: number;
    external?: number;
    arrayBuffers?: number;
}
/**
 * Process event types
 */
type ProcessEventType = "beforeExit" | "disconnect" | "exit" | "message" | "multipleResolves" | "rejectionHandled" | "uncaughtException" | "unhandledRejection" | "warning" | "worker";
/**
 * Process event listener function
 */
type ProcessEventListener = (...args: unknown[]) => void;
/**
 * Process configuration
 */
interface ProcessConfig {
    execPath?: string;
    execArgv?: string[];
    env?: Record<string, string>;
    platform?: string;
    arch?: string;
    version?: ProcessVersions;
    pid?: number;
    ppid?: number;
    title?: string;
}
/**
 * ProcessPolyfill class implementing Node.js process object
 */
declare class ProcessPolyfill {
    readonly platform: string;
    readonly arch: string;
    readonly version: string;
    readonly versions: ProcessVersions;
    readonly pid: number;
    readonly ppid: number;
    execPath: string;
    execArgv: string[];
    env: Record<string, string>;
    title: string;
    private listeners;
    private _exitCode;
    private _exited;
    constructor(config: ProcessConfig);
    /**
     * Set up additional process properties
     */
    private setUpProcessProperties;
    /**
     * Get current working directory
     */
    cwd(): string;
    /**
     * High-resolution timer
     */
    hrtime: (time?: [number, number]) => [number, number];
    /**
     * Get process memory info (Electron-specific)
     */
    getProcessMemoryInfo(): Promise<ProcessMemoryInfo>;
    /**
     * Get CPU usage
     */
    cpuUsage(previousValue?: ProcessCpuUsage): ProcessCpuUsage;
    /**
     * Get shell environment variables
     */
    shellEnv(): Promise<Record<string, string>>;
    /**
     * Umask - not supported in browser
     */
    umask(mask?: number): number;
    /**
     * Exit the process - not supported in browser
     */
    exit(code?: number): never;
    /**
     * Kill a process
     */
    kill(pid: number, signal?: string | number): boolean;
    /**
     * Next tick - schedules callback to run in next event loop iteration
     */
    nextTick(callback: (...args: unknown[]) => void, ...args: unknown[]): void;
    /**
     * Set process title
     */
    setTitle(title: string): void;
    /**
     * Get process title
     */
    getTitle(): string;
    /**
     * Add event listener
     */
    on(event: ProcessEventType, listener: ProcessEventListener): this;
    /**
     * Add one-time event listener
     */
    once(event: ProcessEventType, listener: ProcessEventListener): this;
    /**
     * Remove event listener
     */
    removeListener(event: ProcessEventType, listener: ProcessEventListener): this;
    /**
     * Remove all listeners for an event
     */
    removeAllListeners(event?: ProcessEventType): this;
    /**
     * Emit event to all listeners
     */
    private emit;
    get exitCode(): number | null;
    get exited(): boolean;
    get connected(): boolean;
}
/**
 * Get or create the process singleton
 */
export declare function getProcess(): Promise<ProcessPolyfill>;
/**
 * Get process synchronously (may return basic instance)
 */
export declare function getProcessSync(): ProcessPolyfill;
/**
 * Install the process polyfill
 */
export declare function installProcessPolyfill(): Promise<void>;
/**
 * Install process polyfill synchronously
 */
export declare function installProcessPolyfillSync(): void;
export { ProcessPolyfill };
declare const _default: {
    install: typeof installProcessPolyfill;
    installSync: typeof installProcessPolyfillSync;
    get: typeof getProcess;
    getSync: typeof getProcessSync;
};
export default _default;
//# sourceMappingURL=ProcessPolyfill.d.ts.map