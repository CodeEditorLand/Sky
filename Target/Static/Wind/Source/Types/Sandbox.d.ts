/**
 * @module Types/Sandbox
 * @description
 * Atomic type definitions for VSCode sandbox globals.
 * Mirrors the VSCode preload contract exactly.
 *
 * Reference: vs/base/parts/sandbox/electron-browser/globals.ts
 */
export interface IPCMessage {
    readonly channel: string;
    readonly args: ReadonlyArray<unknown>;
}
export interface IPCRenderer {
    readonly send: (channel: string, ...args: unknown[]) => void;
    readonly invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;
    readonly on: (channel: string, listener: (event: unknown, ...args: unknown[]) => void) => () => void;
    readonly once: (channel: string, listener: (event: unknown, ...args: unknown[]) => void) => void;
    readonly removeListener: (channel: string, listener: (event: unknown, ...args: unknown[]) => void) => void;
    readonly removeAllListeners: (channel: string) => void;
}
export interface IPCMessagePort {
    readonly acquire: (responseChannel: string, nonce: string) => void;
}
export interface WebFrame {
    readonly setZoomLevel: (level: number) => void;
}
export interface ProcessEnvironment {
    readonly [key: string]: string | undefined;
}
export interface SandboxNodeProcess {
    readonly platform: NodeJS.Platform;
    readonly arch: string;
    readonly env: ProcessEnvironment;
    readonly versions: {
        readonly node: string;
        readonly chrome: string;
        readonly electron: string;
    };
    readonly cwd: () => string;
    readonly shellEnv: () => Promise<ProcessEnvironment>;
    readonly getProcessMemoryInfo: () => Promise<{
        readonly workingSetSize: number;
        readonly peakWorkingSetSize: number;
        readonly privateBytes: number;
        readonly sharedBytes: number;
    }>;
    readonly on: (type: "uncaughtException" | "unhandledRejection", callback: (error: Error) => void) => void;
}
export interface SandboxContext {
    readonly configuration: () => Promise<ISandboxConfiguration>;
    readonly resolveConfiguration: () => Promise<ISandboxConfiguration>;
}
export interface ISandboxConfiguration {
    readonly readonly?: boolean;
    readonly userEnv?: ProcessEnvironment;
    readonly zoomLevel?: number;
    readonly workspace?: {
        readonly id: string;
        readonly uri: string;
        readonly name: string;
    };
    readonly [key: string]: unknown;
}
export interface WebUtils {
    readonly getPathForFile: (file: File) => string;
}
export interface SandboxGlobals {
    readonly ipcRenderer: IPCRenderer;
    readonly ipcMessagePort: IPCMessagePort;
    readonly webFrame: WebFrame;
    readonly process: SandboxNodeProcess;
    readonly context: SandboxContext;
    readonly webUtils: WebUtils;
}
export declare class SandboxNotReadyError extends Error {
    readonly _tag = "SandboxNotReadyError";
    constructor();
}
export declare class IPCChannelError extends Error {
    readonly channel: string;
    readonly cause: unknown;
    readonly _tag = "IPCChannelError";
    constructor(channel: string, cause: unknown);
}
export declare class ConfigurationNotReadyError extends Error {
    readonly _tag = "ConfigurationNotReadyError";
    constructor();
}
//# sourceMappingURL=Sandbox.d.ts.map