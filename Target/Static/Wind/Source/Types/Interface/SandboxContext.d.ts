/**
 * @module Types/Interface/SandboxContext
 * @description
 * Sandbox context interface for configuration access.
 * Provides methods to retrieve VSCode sandbox configuration.
 * @category Interface
 */
import type { ISandboxConfiguration } from "./ISandboxConfiguration.js";
/**
 * Sandbox context interface
 */
export interface SandboxContext {
    readonly configuration: () => Promise<ISandboxConfiguration>;
    readonly resolveConfiguration: () => Promise<ISandboxConfiguration>;
}
//# sourceMappingURL=SandboxContext.d.ts.map