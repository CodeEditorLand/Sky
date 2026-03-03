/**
 * @module Bootstrap/Types/VSCode/Type/VSCodeUtilityType
 * @description
 * Utility types for VSCode (URI, etc.).
 * Event and IDisposable are in the shared common types file.
 * @category Type
 */
/**
 * URI components interface
 */
export interface UriComponents {
    scheme: string;
    authority?: string;
    path: string;
    query?: string;
    fragment?: string;
}
/**
 * URI interface
 */
export interface URI {
    scheme: string;
    authority?: string;
    path: string;
    query?: string;
    fragment?: string;
    toString(): string;
}
//# sourceMappingURL=VSCodeUtilityType.d.ts.map