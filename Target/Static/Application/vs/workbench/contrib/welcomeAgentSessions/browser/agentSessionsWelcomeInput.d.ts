import { EditorInput } from '../../../common/editor/editorInput.js';
import { URI } from '../../../../base/common/uri.js';
import { IUntypedEditorInput } from '../../../common/editor.js';
import { IEditorOptions } from '../../../../platform/editor/common/editor.js';
export declare const agentSessionsWelcomeInputTypeId = "workbench.editors.agentSessionsWelcomeInput";
export type AgentSessionsWelcomeInitiator = 'startup' | 'command';
export type AgentSessionsWelcomeWorkspaceKind = 'empty' | 'folder' | 'workspace';
export interface AgentSessionsWelcomeEditorOptions extends IEditorOptions {
    showTelemetryNotice?: boolean;
    initiator?: AgentSessionsWelcomeInitiator;
    workspaceKind?: AgentSessionsWelcomeWorkspaceKind;
}
export declare class AgentSessionsWelcomeInput extends EditorInput {
    static readonly ID = "workbench.editors.agentSessionsWelcomeInput";
    static readonly RESOURCE: URI;
    private _showTelemetryNotice;
    private _initiator;
    private _workspaceKind?;
    get typeId(): string;
    get editorId(): string | undefined;
    toUntyped(): IUntypedEditorInput;
    get resource(): URI | undefined;
    matches(other: EditorInput | IUntypedEditorInput): boolean;
    constructor(options?: AgentSessionsWelcomeEditorOptions);
    getName(): string;
    get showTelemetryNotice(): boolean;
    set showTelemetryNotice(value: boolean);
    get initiator(): AgentSessionsWelcomeInitiator;
    get workspaceKind(): AgentSessionsWelcomeWorkspaceKind | undefined;
    getTelemetryDescriptor(): {
        [key: string]: unknown;
    };
}
