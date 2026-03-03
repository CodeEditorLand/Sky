/**
 * @module Effect/Sandbox/Interface/SandboxService
 * @description
 * Service interface for Sandbox globals access.
 * Provides methods to access VSCode preload globals and configuration.
 * @see {@link Effect/Sandbox/Tag/SandboxTag} Service tag
 * @see {@link Effect/Sandbox/Layer/SandboxLive} Live implementation
 * @category Interface
 */
import type { Effect } from "effect";
import type { IPCRenderer, ISandboxConfiguration, SandboxContext, SandboxGlobals, SandboxNotReadyError, ConfigurationNotReadyError } from "../../../Types/Sandbox.ts";
/**
 * Sandbox service interface for VSCode preload globals access.
 * Provides safe access to window.vscode API with proper error handling and ready state management.
 */
export interface SandboxService {
    /** Access the complete sandbox globals from window.vscode */
    readonly globals: Effect.Effect<SandboxGlobals, SandboxNotReadyError>;
    /** Safe check if sandbox is ready (window.vscode exists) */
    readonly isReady: Effect.Effect<boolean, never>;
    /** Wait for sandbox to be ready (polls until timeout) */
    readonly awaitReady: Effect.Effect<SandboxGlobals, SandboxNotReadyError>;
    /** Get IPC renderer from globals (convenience method) */
    readonly ipc: Effect.Effect<IPCRenderer, SandboxNotReadyError>;
    /** Get configuration context from globals */
    readonly configuration: Effect.Effect<SandboxContext, SandboxNotReadyError>;
    /** Resolve configuration with proper error handling */
    readonly resolveConfiguration: Effect.Effect<ISandboxConfiguration, ConfigurationNotReadyError>;
}
//# sourceMappingURL=SandboxService.d.ts.map