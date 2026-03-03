/**
 * @module Types/Interface/ISandboxConfiguration
 * @description
 * VSCode sandbox configuration interface.
 * Contains window, workspace, and application configuration data.
 * @see {@link Types/Interface/ProcessEnvironment} Related environment interface
 * @category Interface
 */
import type { ProcessEnvironment } from "./ProcessEnvironment.js";
/**
 * Workspace interface
 */
export interface Workspace {
    id: string;
    uri: string;
    name: string;
}
/**
 * VSCode sandbox configuration interface
 */
export interface ISandboxConfiguration {
    readonly readonly?: boolean;
    readonly userEnv?: ProcessEnvironment;
    readonly zoomLevel?: number;
    readonly workspace?: Workspace;
    readonly [key: string]: unknown;
}
//# sourceMappingURL=ISandboxConfiguration.d.ts.map