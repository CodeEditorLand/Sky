import { IObservable } from '../../../../base/common/observable.js';
import { URI } from '../../../../base/common/uri.js';
import { PromptsType } from './promptSyntax/promptTypes.js';
import { PromptsStorage } from './promptSyntax/service/promptsService.js';
export declare const IAICustomizationWorkspaceService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IAICustomizationWorkspaceService>;
/**
 * Possible section IDs for the AI Customization Management Editor sidebar.
 */
export declare const AICustomizationManagementSection: {
    readonly Agents: "agents";
    readonly Skills: "skills";
    readonly Instructions: "instructions";
    readonly Prompts: "prompts";
    readonly Hooks: "hooks";
    readonly McpServers: "mcpServers";
    readonly Models: "models";
};
export type AICustomizationManagementSection = typeof AICustomizationManagementSection[keyof typeof AICustomizationManagementSection];
/**
 * Per-type filter policy controlling which storage sources and user file
 * roots are visible for a given customization type.
 */
export interface IStorageSourceFilter {
    /**
     * Which storage groups to display (e.g. workspace, user, extension).
     */
    readonly sources: readonly PromptsStorage[];
    /**
     * If set, only user files under these roots are shown (allowlist).
     * If `undefined`, all user file roots are included.
     */
    readonly includedUserFileRoots?: readonly URI[];
}
/**
 * Applies a storage source filter to an array of items that have uri and storage.
 * Removes items whose storage is not in the filter's source list,
 * and for user-storage items, removes those not under an allowed root.
 */
export declare function applyStorageSourceFilter<T extends {
    readonly uri: URI;
    readonly storage: PromptsStorage;
}>(items: readonly T[], filter: IStorageSourceFilter): readonly T[];
/**
 * Provides workspace context for AI Customization views.
 */
export interface IAICustomizationWorkspaceService {
    readonly _serviceBrand: undefined;
    /**
     * Observable that fires when the active project root changes.
     */
    readonly activeProjectRoot: IObservable<URI | undefined>;
    /**
     * Returns the current active project root, if any.
     */
    getActiveProjectRoot(): URI | undefined;
    /**
     * The sections to show in the AI Customization Management Editor sidebar.
     */
    readonly managementSections: readonly AICustomizationManagementSection[];
    /**
     * Returns the storage source filter for a given customization type.
     * Controls which storage groups and user file roots are visible.
     */
    getStorageSourceFilter(type: PromptsType): IStorageSourceFilter;
    /**
     * Whether this is a sessions window (vs core VS Code).
     */
    readonly isSessionsWindow: boolean;
    /**
     * Commits files in the active project.
     */
    commitFiles(projectRoot: URI, fileUris: URI[]): Promise<void>;
    /**
     * Launches the AI-guided creation flow for the given customization type.
     */
    generateCustomization(type: PromptsType): Promise<void>;
}
