/**
 * @module Effect/Environment/Tag/EnvironmentTag
 * @description
 * Service tag for dependency injection of the Environment service.
 * @see {@link Effect/Environment/Interface/EnvironmentService} Service interface
 * @see {@link Effect/Environment/Implementation/EnvironmentImplementation} Implementation
 * @category Tag
 */
import { Context } from "effect";
import type { EnvironmentService } from "../Interface/EnvironmentService.js";
declare const EnvironmentTag_base: Context.TagClass<EnvironmentTag, "Effect/EnvironmentService", EnvironmentService>;
/**
 * Environment service tag for dependency injection
 */
export declare class EnvironmentTag extends EnvironmentTag_base {
}
export default EnvironmentTag;
//# sourceMappingURL=EnvironmentTag.d.ts.map