import { CancellationToken } from '../../../../../base/common/cancellation.js';
import { ServicesAccessor } from '../../../../../platform/instantiation/common/instantiation.js';
import { ILanguageModelChatMetadata } from '../../common/languageModels.js';
import { IToolData, IToolSet } from '../../common/tools/languageModelToolsService.js';
/**
 * New QuickTree implementation of the tools picker.
 * Uses IQuickTree to provide a true hierarchical tree structure with:
 * - Collapsible nodes for buckets and toolsets
 * - Checkbox state management with parent-child relationships
 * - Special handling for MCP servers (server as bucket, tools as direct children)
 * - Built-in filtering and search capabilities
 *
 * @param accessor - Service accessor for dependency injection
 * @param placeHolder - Placeholder text shown in the picker
 * @param description - Optional description text shown in the picker
 * @param toolsEntries - Optional initial selection state for tools and toolsets
 * @param modelId - Optional model ID to filter tools by supported models
 * @param onUpdate - Optional callback fired when the selection changes
 * @param token - Optional cancellation token to close the picker when cancelled
 * @returns Promise resolving to the final selection map, or undefined if cancelled
 */
export declare function showToolsPicker(accessor: ServicesAccessor, placeHolder: string, source: string, description?: string, getToolsEntries?: () => ReadonlyMap<IToolSet | IToolData, boolean>, model?: ILanguageModelChatMetadata | undefined, token?: CancellationToken): Promise<ReadonlyMap<IToolSet | IToolData, boolean> | undefined>;
