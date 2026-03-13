import './media/aiCustomizationManagement.css';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { Event } from '../../../../../base/common/event.js';
import { URI } from '../../../../../base/common/uri.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IPromptsService, PromptsStorage } from '../../common/promptSyntax/service/promptsService.js';
import { PromptsType } from '../../common/promptSyntax/promptTypes.js';
import { AICustomizationManagementSection } from './aiCustomizationManagement.js';
import { IContextMenuService, IContextViewService } from '../../../../../platform/contextview/browser/contextView.js';
import { IMatch } from '../../../../../base/common/filters.js';
import { IOpenerService } from '../../../../../platform/opener/common/opener.js';
import { IMenuService } from '../../../../../platform/actions/common/actions.js';
import { IContextKeyService } from '../../../../../platform/contextkey/common/contextkey.js';
import { IWorkspaceContextService } from '../../../../../platform/workspace/common/workspace.js';
import { ILabelService } from '../../../../../platform/label/common/label.js';
import { IAICustomizationWorkspaceService } from '../../common/aiCustomizationWorkspaceService.js';
import { IClipboardService } from '../../../../../platform/clipboard/common/clipboardService.js';
import { IHoverService } from '../../../../../platform/hover/browser/hover.js';
import { IFileService } from '../../../../../platform/files/common/files.js';
import { IPathService } from '../../../../services/path/common/pathService.js';
import { ITelemetryService } from '../../../../../platform/telemetry/common/telemetry.js';
export { truncateToFirstSentence } from './aiCustomizationListWidgetUtils.js';
/**
 * Represents an AI customization item in the list.
 */
export interface IAICustomizationListItem {
    readonly id: string;
    readonly uri: URI;
    readonly name: string;
    readonly filename: string;
    readonly description?: string;
    readonly storage: PromptsStorage;
    readonly promptType: PromptsType;
    /** When set, overrides `storage` for display grouping purposes. */
    readonly groupKey?: string;
    nameMatches?: IMatch[];
    descriptionMatches?: IMatch[];
}
/**
 * Formats a name for display: strips a trailing .md extension, converts dashes/underscores
 * to spaces and applies title case.
 * Note: callers that pass IMatch highlight ranges must compute those ranges against the
 * formatted string (not the raw input), since .md stripping changes string length.
 */
export declare function formatDisplayName(name: string): string;
/**
 * Maps section ID to prompt type.
 */
export declare function sectionToPromptType(section: AICustomizationManagementSection): PromptsType;
/**
 * Widget that displays a searchable list of AI customization items.
 */
export declare class AICustomizationListWidget extends Disposable {
    private readonly instantiationService;
    private readonly promptsService;
    private readonly contextViewService;
    private readonly openerService;
    private readonly contextMenuService;
    private readonly menuService;
    private readonly contextKeyService;
    private readonly workspaceContextService;
    private readonly labelService;
    private readonly workspaceService;
    private readonly clipboardService;
    private readonly hoverService;
    private readonly fileService;
    private readonly pathService;
    private readonly telemetryService;
    readonly element: HTMLElement;
    private sectionHeader;
    private sectionDescription;
    private sectionLink;
    private searchAndButtonContainer;
    private searchContainer;
    private searchInput;
    private addButtonContainer;
    private addButton;
    private addButtonSimple;
    private listContainer;
    private list;
    private emptyStateContainer;
    private emptyStateIcon;
    private emptyStateText;
    private emptyStateSubtext;
    private currentSection;
    private allItems;
    private displayEntries;
    private searchQuery;
    private readonly collapsedGroups;
    private readonly dropdownActionDisposables;
    private readonly delayedFilter;
    private readonly _onDidSelectItem;
    readonly onDidSelectItem: Event<IAICustomizationListItem>;
    private readonly _onDidChangeItemCount;
    readonly onDidChangeItemCount: Event<number>;
    private readonly _onDidRequestCreate;
    readonly onDidRequestCreate: Event<PromptsType>;
    private readonly _onDidRequestCreateManual;
    readonly onDidRequestCreateManual: Event<{
        type: PromptsType;
        target: 'workspace' | 'user';
    }>;
    constructor(instantiationService: IInstantiationService, promptsService: IPromptsService, contextViewService: IContextViewService, openerService: IOpenerService, contextMenuService: IContextMenuService, menuService: IMenuService, contextKeyService: IContextKeyService, workspaceContextService: IWorkspaceContextService, labelService: ILabelService, workspaceService: IAICustomizationWorkspaceService, clipboardService: IClipboardService, hoverService: IHoverService, fileService: IFileService, pathService: IPathService, telemetryService: ITelemetryService);
    private create;
    /**
     * Handles context menu for list items.
     */
    private onContextMenu;
    /**
     * Sets the current section and loads items for that section.
     */
    setSection(section: AICustomizationManagementSection): Promise<void>;
    /**
     * Updates the section header based on the current section.
     */
    private updateSectionHeader;
    /**
     * Updates the add button label based on the current section.
     */
    private updateAddButton;
    /**
     * Gets the dropdown actions for the add button.
     */
    private getDropdownActions;
    /**
     * Checks if there's an active project root (workspace folder or session repository).
     */
    private hasActiveWorkspace;
    /**
     * Executes the primary create action based on context.
     */
    private executePrimaryCreateAction;
    /**
     * Gets the type label for the current section.
     */
    private getTypeLabel;
    /**
     * Refreshes the current section's items.
     */
    refresh(): Promise<void>;
    /**
     * Loads items for the current section.
     */
    private loadItems;
    /**
     * Derives a friendly name from a filename by removing extension suffixes.
     */
    private getFriendlyName;
    /**
     * Filters items based on the current search query and builds grouped display entries.
     */
    private filterItems;
    /**
     * Toggles the collapsed state of a group.
     */
    private toggleGroup;
    private updateEmptyState;
    private getSectionIcon;
    private getEmptyStateInfo;
    /**
     * Sets the search query programmatically.
     */
    setSearchQuery(query: string): void;
    /**
     * Clears the search query.
     */
    clearSearch(): void;
    /**
     * Focuses the search input.
     */
    focusSearch(): void;
    /**
     * Focuses the list.
     */
    focusList(): void;
    /**
     * Layouts the widget.
     */
    layout(height: number, width: number): void;
    /**
     * Gets the total item count (before filtering).
     */
    get itemCount(): number;
    /**
     * Generates a debug report for the current section.
     */
    generateDebugReport(): Promise<string>;
}
