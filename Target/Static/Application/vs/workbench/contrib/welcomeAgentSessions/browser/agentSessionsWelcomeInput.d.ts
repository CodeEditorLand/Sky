import { EditorInput } from '../../../common/editor/editorInput.js';
import { URI } from '../../../../base/common/uri.js';
import { IUntypedEditorInput } from '../../../common/editor.js';
import { IEditorOptions } from '../../../../platform/editor/common/editor.js';
export declare const agentSessionsWelcomeInputTypeId = "workbench.editors.agentSessionsWelcomeInput";
export interface AgentSessionsWelcomeEditorOptions extends IEditorOptions {
    showTelemetryNotice?: boolean;
}
export declare class AgentSessionsWelcomeInput extends EditorInput {
    static readonly ID = "workbench.editors.agentSessionsWelcomeInput";
    static readonly RESOURCE: URI;
    private _showTelemetryNotice;
    get typeId(): string;
    get editorId(): string | undefined;
    toUntyped(): IUntypedEditorInput;
    get resource(): URI | undefined;
    matches(other: EditorInput | IUntypedEditorInput): boolean;
    constructor(options?: AgentSessionsWelcomeEditorOptions);
    getName(): string;
    get showTelemetryNotice(): boolean;
    set showTelemetryNotice(value: boolean);
}
