/**
 * @module Types/Error/SandboxNotReadyError
 * @description
 * Error thrown when the sandbox has not been initialized.
 * Occurs when code attempts to access window.vscode before preload script executes.
 * @category Error
 */
/**
 * Sandbox not ready error
 */
export declare class SandboxNotReadyError extends Error {
    readonly _tag = "SandboxNotReadyError";
    constructor();
}
//# sourceMappingURL=SandboxNotReadyError.d.ts.map