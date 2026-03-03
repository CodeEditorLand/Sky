import { URI } from '../../../../../base/common/uri.js';
import { ServicesAccessor } from '../../../../../editor/browser/editorExtensions.js';
import { ITextEditorSelection } from '../../../../../platform/editor/common/editor.js';
/**
 * Optional callbacks for customizing the hook creation and opening behaviour.
 * The agentic editor passes these to open hooks in the embedded editor and
 * track worktree files for auto-commit.
 */
export interface IHookQuickPickCallbacks {
    /** Override how the hook file is opened. If not provided, uses editorService.openEditor. */
    readonly openEditor?: (resource: URI, options?: {
        selection?: ITextEditorSelection;
    }) => Promise<void>;
    /** Called after a new hook file is created on disk. */
    readonly onHookFileCreated?: (uri: URI) => void;
}
/**
 * Shows the Configure Hooks quick pick UI, allowing the user to view,
 * open, or create hooks. Can be called from the action or slash command.
 */
export declare function showConfigureHooksQuickPick(accessor: ServicesAccessor, callbacks?: IHookQuickPickCallbacks): Promise<void>;
/**
 * Helper to register the `Manage Hooks` action.
 */
export declare function registerHookActions(): void;
