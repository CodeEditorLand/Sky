import { IPromptsService, PromptsStorage } from '../../common/promptSyntax/service/promptsService.js';
import { IAICustomizationWorkspaceService } from '../../common/aiCustomizationWorkspaceService.js';
import { AICustomizationManagementSection } from './aiCustomizationManagement.js';
/**
 * Snapshot of the list widget's internal state, passed in to avoid coupling.
 */
export interface IDebugWidgetState {
    readonly allItems: readonly {
        readonly storage: PromptsStorage;
    }[];
    readonly displayEntries: readonly {
        type: string;
        label?: string;
        count?: number;
        collapsed?: boolean;
    }[];
}
/**
 * Generates a debug diagnostics report for the AI Customization list widget.
 * Returns the report as a string suitable for opening in an editor.
 */
export declare function generateCustomizationDebugReport(section: AICustomizationManagementSection, promptsService: IPromptsService, workspaceService: IAICustomizationWorkspaceService, widgetState: IDebugWidgetState): Promise<string>;
