import { Disposable } from '../../../../../base/common/lifecycle.js';
import { ICodeEditor } from '../../../../../editor/browser/editorBrowser.js';
import { IEditorContribution } from '../../../../../editor/common/editorCommon.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IChatAgentService } from '../../../chat/common/participants/chatAgents.js';
import { IInlineChatSessionService } from '../../../inlineChat/browser/inlineChatSessionService.js';
import './emptyTextEditorHint.css';
export declare const emptyTextEditorHintSetting = "workbench.editor.empty.hint";
export declare class EmptyTextEditorHintContribution extends Disposable implements IEditorContribution {
    protected readonly editor: ICodeEditor;
    private readonly configurationService;
    private readonly inlineChatSessionService;
    private readonly chatAgentService;
    private readonly instantiationService;
    static readonly ID = "editor.contrib.emptyTextEditorHint";
    private textHintContentWidget;
    constructor(editor: ICodeEditor, configurationService: IConfigurationService, inlineChatSessionService: IInlineChatSessionService, chatAgentService: IChatAgentService, instantiationService: IInstantiationService);
    protected shouldRenderHint(): boolean;
    protected update(): void;
    dispose(): void;
}
