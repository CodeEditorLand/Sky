import { RawContextKey } from '../../../../../platform/contextkey/common/contextkey.js';
import { PromptsStorage } from '../../common/promptSyntax/service/promptsService.js';
import { MenuId } from '../../../../../platform/actions/common/actions.js';
export { AICustomizationManagementSection } from '../../common/aiCustomizationWorkspaceService.js';
/**
 * Extended storage type for AI Customization that includes built-in prompts
 * shipped with the application, alongside the core `PromptsStorage` values.
 */
export type AICustomizationPromptsStorage = PromptsStorage | 'builtin';
/**
 * Storage type discriminator for built-in prompts shipped with the application.
 */
export declare const BUILTIN_STORAGE: AICustomizationPromptsStorage;
/**
 * Editor pane ID for the AI Customizations Management Editor.
 */
export declare const AI_CUSTOMIZATION_MANAGEMENT_EDITOR_ID = "workbench.editor.aiCustomizationManagement";
/**
 * Editor input type ID for serialization.
 */
export declare const AI_CUSTOMIZATION_MANAGEMENT_EDITOR_INPUT_ID = "workbench.input.aiCustomizationManagement";
/**
 * Command IDs for the AI Customizations Management Editor.
 */
export declare const AICustomizationManagementCommands: {
    readonly OpenEditor: "aiCustomization.openManagementEditor";
    readonly CreateNewAgent: "aiCustomization.createNewAgent";
    readonly CreateNewSkill: "aiCustomization.createNewSkill";
    readonly CreateNewInstructions: "aiCustomization.createNewInstructions";
    readonly CreateNewPrompt: "aiCustomization.createNewPrompt";
};
/**
 * Context key indicating the AI Customization Management Editor is focused.
 */
export declare const CONTEXT_AI_CUSTOMIZATION_MANAGEMENT_EDITOR: RawContextKey<boolean>;
/**
 * Context key for the currently selected section.
 */
export declare const CONTEXT_AI_CUSTOMIZATION_MANAGEMENT_SECTION: RawContextKey<string>;
/**
 * Menu ID for the AI Customization Management Editor title bar actions.
 */
export declare const AICustomizationManagementTitleMenuId: MenuId;
/**
 * Menu ID for the AI Customization Management Editor item context menu.
 */
export declare const AICustomizationManagementItemMenuId: MenuId;
/**
 * Storage key for persisting the selected section.
 */
export declare const AI_CUSTOMIZATION_MANAGEMENT_SELECTED_SECTION_KEY = "aiCustomizationManagement.selectedSection";
/**
 * Storage key for persisting the sidebar width.
 */
export declare const AI_CUSTOMIZATION_MANAGEMENT_SIDEBAR_WIDTH_KEY = "aiCustomizationManagement.sidebarWidth";
/**
 * Storage key for persisting the search query.
 */
export declare const AI_CUSTOMIZATION_MANAGEMENT_SEARCH_KEY = "aiCustomizationManagement.searchQuery";
/**
 * Layout constants for the editor.
 */
export declare const SIDEBAR_DEFAULT_WIDTH = 200;
export declare const SIDEBAR_MIN_WIDTH = 150;
export declare const SIDEBAR_MAX_WIDTH = 350;
export declare const CONTENT_MIN_WIDTH = 400;
