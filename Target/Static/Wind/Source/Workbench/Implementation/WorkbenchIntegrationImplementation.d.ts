/**
 * @module Workbench/Implementation/WorkbenchIntegrationImplementation
 * @description
 * Implementation of VSCode browser workbench integration.
 * Integrates Mountain's file system provider with VSCode's browser workbench by
 * overriding the VSCode workspace API to route operations through Mountain.
 * @see {@link Workbench/Interface/WorkbenchIntegrationService} Service interface
 * @category Implementation
 */
import { Context, Layer } from "effect";
import type { WorkbenchIntegrationService } from "../Interface/WorkbenchIntegrationService.js";
declare const WorkbenchIntegrationTag_base: Context.TagClass<WorkbenchIntegrationTag, "WorkbenchIntegration", WorkbenchIntegrationService>;
export declare class WorkbenchIntegrationTag extends WorkbenchIntegrationTag_base {
}
export declare const WorkbenchIntegrationLiveLayer: Layer.Layer<WorkbenchIntegrationTag, never, import("../../Effect/IPC.js").IPCTag>;
export default WorkbenchIntegrationTag;
//# sourceMappingURL=WorkbenchIntegrationImplementation.d.ts.map