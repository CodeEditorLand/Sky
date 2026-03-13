import { IChatDebugEvent } from './chatDebugService.js';
/**
 * Descriptions of each debug event kind for the model. Adding a new event kind
 * to {@link IChatDebugEvent} without adding an entry here will cause a compile error.
 */
export declare const debugEventKindDescriptions: Record<IChatDebugEvent['kind'], string>;
/**
 * Formats debug events into a compact log-style summary for context attachment.
 */
export declare function formatDebugEventsForContext(events: readonly IChatDebugEvent[]): string;
/**
 * Constructs the model description for the debug events attachment,
 * explaining to the model how to use the resolveDebugEventDetails tool.
 */
export declare function getDebugEventsModelDescription(): string;
/**
 * Checks whether a debug event matches a single text search term.
 * Used by both the debug panel filter and the listDebugEvents tool.
 */
export declare function debugEventMatchesText(event: IChatDebugEvent, term: string): boolean;
/**
 * Parse a `before:YYYY[-MM[-DD[THH[:MM[:SS]]]]]` or `after:…` token from
 * free-form filter text. Each component after the year is optional.
 *
 * For `before:`, the timestamp is rounded **up** to the end of the most
 * specific unit given (e.g. `before:2026-03` → end-of-March).
 * For `after:`, the timestamp is the **start** of the most specific unit.
 */
export declare function parseTimeToken(text: string, prefix: string): number | undefined;
/**
 * Strips `before:…` and `after:…` timestamp tokens from filter text,
 * returning only the plain text search portion.
 */
export declare function stripTimestampTokens(text: string): string;
/**
 * Filters debug events by comma-separated text terms and optional
 * `before:`/`after:` timestamp tokens.
 *
 * Terms prefixed with `!` are exclusions; all others are inclusions.
 * At least one inclusion term must match (if any are present).
 * Timestamp tokens are parsed and applied as date-range bounds, then
 * stripped before text matching.
 */
export declare function filterDebugEventsByText(events: readonly IChatDebugEvent[], filterText: string): readonly IChatDebugEvent[];
/**
 * Description of the text filter syntax for tool schemas and documentation.
 */
export declare const debugEventFilterDescription = "Comma-separated text search terms. Prefix a term with ! to exclude it. Matches against event kind, tool names, model names, agent names, categories, event names, and message content. Also supports before:YYYY[-MM[-DD[THH[:MM[:SS]]]]] and after:YYYY[-MM[-DD[THH[:MM[:SS]]]]] to filter by timestamp.";
export interface DebugEventFilterOptions {
    readonly kind?: string;
    readonly filter?: string;
    readonly limit?: number;
}
/**
 * Applies kind, text, and limit filters to debug events.
 * Used by the listDebugEvents tool to consolidate all filtering in one place.
 */
export declare function filterDebugEvents(events: readonly IChatDebugEvent[], options: DebugEventFilterOptions): readonly IChatDebugEvent[];
