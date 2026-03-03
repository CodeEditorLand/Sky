/**
 * @module Effect/StatusBar/Tag/StatusBarTag
 * @description
 * Service tag for StatusBar dependency injection.
 * Provides the Context.Tag for accessing StatusBar service in Effect programs.
 * @see {@link Effect/StatusBar/Interface/StatusBarService} Service interface
 * @see {@link Effect/StatusBar/Layer/StatusBarLive} Live implementation
 * @category Tag
 */
import { Context } from "effect";
import type { StatusBarService } from "../Interface/StatusBarService.js";
declare const StatusBarTag_base: Context.TagClass<StatusBarTag, "StatusBar", StatusBarService>;
/**
 * Context.Tag for StatusBar service dependency injection.
 * Use this tag to access StatusBar in Effect programs.
 *
 * @example
 * ```ts
 * import { Effect } from "effect";
 * import { StatusBarTag } from "./Effect/StatusBar/Tag/StatusBarTag.js";
 *
 * const createItem = Effect.gen(function* () {
 *   const statusBar = yield* StatusBarTag;
 *   return yield* statusBar.createItem({ text: "Ready", alignment: "right", priority: 1 });
 * });
 * ```
 */
export default class StatusBarTag extends StatusBarTag_base {
}
/**
 * Alias for StatusBarTag for shorter import paths.
 */
export declare const StatusBar: typeof StatusBarTag;
export {};
//# sourceMappingURL=StatusBarTag.d.ts.map