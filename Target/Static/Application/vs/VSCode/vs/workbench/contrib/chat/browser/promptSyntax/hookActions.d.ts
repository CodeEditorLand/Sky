import { URI } from '../../../../../base/common/uri.js';
import { ServicesAccessor } from '../../../../../editor/browser/editorExtensions.js';
import { Target } from '../../common/promptSyntax/promptTypes.js';
import { ITextEditorSelection } from '../../../../../platform/editor/common/editor.js';
/**
 * Optional callbacks and settings for customizing the hook creation and opening behaviour.
 * The agentic editor passes these to open hooks in the embedded editor and
 * track worktree files for auto-commit.
 */
export interface IHookQuickPickOptions {
    /** Override how the hook file is opened. If not provided, uses editorService.openEditor. */
    readonly openEditor?: (resource: URI, options?: {
        selection?: ITextEditorSelection;
    }) => Promise<void>;
    /** Called after a new hook file is created on disk. */
    readonly onHookFileCreated?: (uri: URI) => void;
    /** Filter the displayed hook types to those supported by the given target. */
    readonly target?: Target;
}
/**
 * Shows the Configure Hooks quick pick UI, allowing the user to view,
 * open, or create hooks. Can be called from the action or slash command.
 */
export declare function showConfigureHooksQuickPick(accessor: ServicesAccessor, options?: IHookQuickPickOptions): Promise<void>;
/**
 * Helper to register the `Manage Hooks` action.
 */
export declare function registerHookActions(): void;
