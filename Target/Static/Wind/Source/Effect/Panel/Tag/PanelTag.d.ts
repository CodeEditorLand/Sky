/**
 * @module Effect/Panel/Tag/PanelTag
 * @description
 * Service tag for Panel dependency injection.
 * Provides the Context.Tag for accessing Panel service in Effect programs.
 * @see {@link Effect/Panel/Interface/PanelService} Service interface
 * @see {@link Effect/Panel/Implementation/PanelImplementation} Implementation
 * @category Tag
 */
import { Context } from "effect";
import type { PanelService } from "../Interface/PanelService.js";
declare const PanelTag_base: Context.TagClass<PanelTag, "Panel", PanelService>;
/**
 * Context.Tag for Panel service dependency injection.
 * Use this tag to access Panel in Effect programs.
 *
 * @example
 * ```ts
 * import { Effect } from "effect";
 * import { PanelTag } from "./Effect/Panel/Tag/PanelTag.js";
 *
 * const createView = Effect.gen(function* () {
 *   const panel = yield* PanelTag;
 *   return yield* panel.createView({ title: "Output", type: "output", priority: 1, visible: false, maximized: false });
 * });
 * ```
 */
export default class PanelTag extends PanelTag_base {
}
/**
 * Alias for PanelTag for shorter import paths.
 */
export declare const Panel: typeof PanelTag;
export {};
//# sourceMappingURL=PanelTag.d.ts.map