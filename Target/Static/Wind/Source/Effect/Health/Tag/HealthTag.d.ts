/**
 * @module Effect/Health/Tag/HealthTag
 * @description
 * Service tag for dependency injection of the Health service.
 * @category Tag
 */
import { Context } from "effect";
import type { HealthService } from "../Interface/HealthService.js";
declare const HealthTag_base: Context.TagClass<HealthTag, "Effect/HealthService", HealthService>;
export declare class HealthTag extends HealthTag_base {
}
export default HealthTag;
//# sourceMappingURL=HealthTag.d.ts.map