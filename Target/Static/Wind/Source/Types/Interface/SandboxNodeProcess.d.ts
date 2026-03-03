/**
 * @module Types/Interface/SandboxNodeProcess
 * @description
 * VSCode sandbox node process interface.
 * Provides node-like process information in a web environment.
 * Mirrors vs/base/parts/sandbox/electron-browser/globals.ts
 * @see {@link Types/Interface/ProcessEnvironment} Related environment interface
 * @category Interface
 */
import type { ProcessEnvironment } from "./ProcessEnvironment.js";
/**
 * Memory info interface
 */
export interface ProcessMemoryInfo {
    readonly private: number;
    readonly residentSet: number;
    readonly shared: number;
}
/**
 * VSCode sandbox node process interface
 */
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
    readonly getProcessMemoryInfo: () => Promise<ProcessMemoryInfo>;
    readonly on: (type: "uncaughtException" | "unhandledRejection", callback: (error: Error) => void) => void;
}
//# sourceMappingURL=SandboxNodeProcess.d.ts.map