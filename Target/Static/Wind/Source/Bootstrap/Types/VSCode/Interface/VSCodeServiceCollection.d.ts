/**
 * @module Bootstrap/Types/VSCode/Interface/VSCodeServiceCollection
 * @description
 * VSCode Service Collection Interface.
 * Provides get/set/has methods for managing services.
 * @see {@link Bootstrap/Types/VSCode/Interface/VSCodeServiceIdentifier} Service identifier interface
 * @category Interface
 */
import type { IVSCodeServiceIdentifier } from "./VSCodeServiceIdentifier.js";
/**
 * VSCode Service Collection interface
 */
export interface IVSCodeServiceCollection {
    set<T>(id: IVSCodeServiceIdentifier, instance: T): void;
    get<T>(id: IVSCodeServiceIdentifier): T;
    has(id: IVSCodeServiceIdentifier): boolean;
}
//# sourceMappingURL=VSCodeServiceCollection.d.ts.map