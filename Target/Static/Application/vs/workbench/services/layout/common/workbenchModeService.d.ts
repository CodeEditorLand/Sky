import { Event } from '../../../../base/common/event.js';
import { IStringDictionary } from '../../../../base/common/collections.js';
export declare const IWorkbenchModeService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IWorkbenchModeService>;
export interface IWorkbenchModeConfiguration {
    readonly id: string;
    readonly name: string;
    readonly settings: IStringDictionary<unknown>;
}
export interface IWorkbenchModeService {
    readonly _serviceBrand: undefined;
    /**
     * The currently active workbench mode id, or undefined if using default settings
     */
    readonly workbenchMode: string | undefined;
    /**
     * Event fired when the workbench mode changes
     */
    readonly onDidChangeWorkbenchMode: Event<string | undefined>;
    /**
     * Resolve a workbench mode by its id
     * @param id The id of the workbench mode to resolve
     */
    getWorkbenchModeConfiguration(id: string): Promise<IWorkbenchModeConfiguration | undefined>;
    /**
     * Get all workbench modes
     */
    getWorkbenchModeConfigurations(): Promise<IWorkbenchModeConfiguration[]>;
    /**
     * Set the active workbench mode. Pass undefined to clear the mode and return to defaults.
     */
    setWorkbenchMode(workbenchMode: string | undefined): Promise<void>;
}
export declare class DefaultWorkbenchModeService implements IWorkbenchModeService {
    readonly _serviceBrand: undefined;
    readonly workbenchMode: string | undefined;
    readonly onDidChangeWorkbenchMode: Event<string | undefined>;
    getWorkbenchModeConfiguration(_id: string): Promise<IWorkbenchModeConfiguration | undefined>;
    getWorkbenchModeConfigurations(): Promise<IWorkbenchModeConfiguration[]>;
    setWorkbenchMode(_workbenchMode: string | undefined): Promise<void>;
}
