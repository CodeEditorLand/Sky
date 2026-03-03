import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { PromptsType } from '../../../../workbench/contrib/chat/common/promptSyntax/promptTypes.js';
import { IPromptsService } from '../../../../workbench/contrib/chat/common/promptSyntax/service/promptsService.js';
import { IMcpService } from '../../../../workbench/contrib/mcp/common/mcpTypes.js';
import { IAICustomizationWorkspaceService, IStorageSourceFilter } from '../../../../workbench/contrib/chat/common/aiCustomizationWorkspaceService.js';
export interface ISourceCounts {
    readonly workspace: number;
    readonly user: number;
    readonly extension: number;
}
export declare function getSourceCountsTotal(counts: ISourceCounts, filter: IStorageSourceFilter): number;
/**
 * Gets source counts for a prompt type, using the SAME data sources as
 * loadItems() in the list widget to avoid count mismatches.
 */
export declare function getSourceCounts(promptsService: IPromptsService, promptType: PromptsType, filter: IStorageSourceFilter, workspaceContextService: IWorkspaceContextService, workspaceService: IAICustomizationWorkspaceService): Promise<ISourceCounts>;
export declare function getCustomizationTotalCount(promptsService: IPromptsService, mcpService: IMcpService, workspaceService: IAICustomizationWorkspaceService, workspaceContextService: IWorkspaceContextService): Promise<number>;
