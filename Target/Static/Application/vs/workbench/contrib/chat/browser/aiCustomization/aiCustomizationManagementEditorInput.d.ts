import { ThemeIcon } from '../../../../../base/common/themables.js';
import { IUntypedEditorInput } from '../../../../common/editor.js';
import { EditorInput } from '../../../../common/editor/editorInput.js';
/**
 * Editor input for the AI Customizations Management Editor.
 * This is a singleton-style input with no file resource.
 */
export declare class AICustomizationManagementEditorInput extends EditorInput {
    static readonly ID: string;
    readonly resource: undefined;
    private static _instance;
    /**
     * Gets or creates the singleton instance of this input.
     */
    static getOrCreate(): AICustomizationManagementEditorInput;
    constructor();
    matches(otherInput: EditorInput | IUntypedEditorInput): boolean;
    get typeId(): string;
    getName(): string;
    getIcon(): ThemeIcon;
    resolve(): Promise<null>;
}
