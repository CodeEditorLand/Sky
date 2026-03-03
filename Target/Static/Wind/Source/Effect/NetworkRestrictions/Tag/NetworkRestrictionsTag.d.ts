/**
 * @module Effect/NetworkRestrictions/Tag/NetworkRestrictionsTag
 * @description
 * Service tag for dependency injection of the NetworkRestrictions service.
 * @see {@link Effect/NetworkRestrictions/Interface/NetworkRestrictionsService} Service interface
 * @see {@link Effect/NetworkRestrictions/Implementation/NetworkRestrictionsImplementation} Implementation
 * @category Tag
 */
import { Context } from "effect";
import type { NetworkRestrictionsService } from "../Interface/NetworkRestrictionsService.js";
declare const NetworkRestrictionsTag_base: Context.TagClass<NetworkRestrictionsTag, "NetworkRestrictions", NetworkRestrictionsService>;
/**
 * NetworkRestrictions service tag for dependency injection
 */
export declare class NetworkRestrictionsTag extends NetworkRestrictionsTag_base {
}
/**
 * Alias for the NetworkRestrictions tag
 */
export declare const NetworkRestrictions: typeof NetworkRestrictionsTag;
export default NetworkRestrictionsTag;
//# sourceMappingURL=NetworkRestrictionsTag.d.ts.map