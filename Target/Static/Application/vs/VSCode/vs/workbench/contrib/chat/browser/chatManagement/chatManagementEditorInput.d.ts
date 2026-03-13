import { ThemeIcon } from '../../../../../base/common/themables.js';
import { IUntypedEditorInput } from '../../../../common/editor.js';
import { EditorInput } from '../../../../common/editor/editorInput.js';
export declare const CHAT_MANAGEMENT_SECTION_USAGE = "usage";
export declare const CHAT_MANAGEMENT_SECTION_MODELS = "models";
export declare class ChatManagementEditorInput extends EditorInput {
    static readonly ID: string;
    readonly resource: undefined;
    constructor();
    matches(otherInput: EditorInput | IUntypedEditorInput): boolean;
    get typeId(): string;
    getName(): string;
    getIcon(): ThemeIcon;
    resolve(): Promise<null>;
}
export declare class ModelsManagementEditorInput extends EditorInput {
    static readonly ID: string;
    readonly resource: undefined;
    constructor();
    matches(otherInput: EditorInput | IUntypedEditorInput): boolean;
    get typeId(): string;
    getName(): string;
    getIcon(): ThemeIcon;
    resolve(): Promise<null>;
}
