import { Disposable } from '../../../../base/common/lifecycle.js';
import { CommonFindController } from '../../../../editor/contrib/find/browser/findController.js';
import { AccessibleViewProviderId, AccessibleViewType, IAccessibleViewContentProvider, IAccessibleViewOptions } from '../../../../platform/accessibility/browser/accessibleView.js';
import { IAccessibleViewImplementation } from '../../../../platform/accessibility/browser/accessibleViewRegistry.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { AccessibilityVerbositySettingId } from '../../accessibility/browser/accessibilityConfiguration.js';
/**
 * Accessible view implementation for Find and Replace help in the code editor.
 * Provides comprehensive accessibility support for the Find dialog, including:
 * - Search status information (current term, match count, position)
 * - Navigation instructions for keyboard control
 * - Focus behavior explanation
 * - Available settings and options
 * - Platform-specific guidance
 *
 * Activated via Alt+F1 when any element in the Find widget is focused.
 */
export declare class EditorFindAccessibilityHelp implements IAccessibleViewImplementation {
    readonly priority = 105;
    readonly name = "editor-find";
    readonly when: import("../../../../platform/contextkey/common/contextkey.ts").RawContextKey<boolean>;
    readonly type = AccessibleViewType.Help;
    /**
     * Creates an accessible view content provider for the active code editor's Find/Replace dialog.
     * @param accessor Service accessor for retrieving the code editor service
     * @returns The provider instance, or undefined if no active editor or find controller is found
     */
    getProvider(accessor: ServicesAccessor): EditorFindAccessibilityHelpProvider | undefined;
}
/**
 * Content provider for the Find and Replace accessibility help.
 * Generates localized, context-aware help information based on the current Find state.
 *
 * The implementation:
 * - Adapts content based on whether Replace mode is active
 * - Provides current search status (term, match count, position)
 * - Explains focus behavior (how focus moves between Find input, Replace input, and editor)
 * - Lists keyboard navigation shortcuts for different contexts
 * - Documents available Find and Replace options
 * - References relevant settings that affect Find behavior
 * - Includes platform-specific guidance where applicable
 */
declare class EditorFindAccessibilityHelpProvider extends Disposable implements IAccessibleViewContentProvider {
    private readonly _findController;
    readonly id = AccessibleViewProviderId.EditorFindHelp;
    readonly verbositySettingKey = AccessibilityVerbositySettingId.Find;
    readonly options: IAccessibleViewOptions;
    constructor(_findController: CommonFindController);
    /**
     * Returns focus to the last focused element in the Find widget when the accessibility help is closed.
     * This handles focus restoration for any element (inputs, checkboxes, buttons) not just the text inputs.
     */
    onClose(): void;
    /**
     * Generates the complete accessibility help content for Find and Replace.
     * The content structure varies based on whether Replace mode is visible:
     *
     * Replace Mode Content:
     * - Header identifying the dialog
     * - Context explaining what the dialog does
     * - Current search and replace status
     * - Focus behavior explanation
     * - Keyboard shortcuts for Find, Replace, and Editor contexts
     * - Find and Replace options explanation
     * - Configurable settings documentation
     * - Platform-specific settings (macOS)
     *
     * Find-Only Mode Content:
     * - Similar structure but without Replace-specific sections
     *
     * @returns The complete help text as a newline-joined string for audio announcement
     */
    provideContent(): string;
}
export {};
