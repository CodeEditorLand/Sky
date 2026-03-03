import { ThemeIcon } from '../../../../../base/common/themables.js';
import { URI } from '../../../../../base/common/uri.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { EditorInputCapabilities, IEditorSerializer, IUntypedEditorInput } from '../../../../common/editor.js';
import { EditorInput } from '../../../../common/editor/editorInput.js';
export declare class ChatDebugEditorInput extends EditorInput {
    static readonly ID = "workbench.editor.chatDebug";
    static readonly RESOURCE: URI;
    private static _instance;
    static get instance(): ChatDebugEditorInput;
    get typeId(): string;
    get editorId(): string | undefined;
    get capabilities(): EditorInputCapabilities;
    readonly resource: URI;
    getName(): string;
    getIcon(): ThemeIcon;
    matches(other: EditorInput | IUntypedEditorInput): boolean;
}
export declare class ChatDebugEditorInputSerializer implements IEditorSerializer {
    canSerialize(editorInput: EditorInput): boolean;
    serialize(editorInput: EditorInput): string;
    deserialize(instantiationService: IInstantiationService): EditorInput;
}
