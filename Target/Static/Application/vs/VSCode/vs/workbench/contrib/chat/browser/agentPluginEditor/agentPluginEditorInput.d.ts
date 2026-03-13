import { ThemeIcon } from '../../../../../base/common/themables.js';
import { URI } from '../../../../../base/common/uri.js';
import { EditorInputCapabilities, IUntypedEditorInput } from '../../../../common/editor.js';
import { EditorInput } from '../../../../common/editor/editorInput.js';
import { IAgentPluginItem } from './agentPluginItems.js';
export declare class AgentPluginEditorInput extends EditorInput {
    private _item;
    static readonly ID = "workbench.agentPlugin.input";
    get typeId(): string;
    get capabilities(): EditorInputCapabilities;
    get resource(): URI;
    constructor(_item: IAgentPluginItem);
    get item(): IAgentPluginItem;
    getName(): string;
    getIcon(): ThemeIcon | undefined;
    matches(other: EditorInput | IUntypedEditorInput): boolean;
}
