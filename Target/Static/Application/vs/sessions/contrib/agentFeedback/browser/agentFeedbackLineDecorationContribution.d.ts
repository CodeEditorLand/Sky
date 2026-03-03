import './media/agentFeedbackLineDecoration.css';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { ICodeEditor } from '../../../../editor/browser/editorBrowser.js';
import { IEditorContribution } from '../../../../editor/common/editorCommon.js';
import { IAgentFeedbackService } from './agentFeedbackService.js';
import { IChatEditingService } from '../../../../workbench/contrib/chat/common/editing/chatEditingService.js';
import { IAgentSessionsService } from '../../../../workbench/contrib/chat/browser/agentSessions/agentSessionsService.js';
export declare class AgentFeedbackLineDecorationContribution extends Disposable implements IEditorContribution {
    private readonly _editor;
    private readonly _agentFeedbackService;
    private readonly _chatEditingService;
    private readonly _agentSessionsService;
    static readonly ID = "agentFeedback.lineDecorationContribution";
    private _hintDecorationId;
    private _hintLine;
    private _sessionResource;
    private _feedbackLines;
    constructor(_editor: ICodeEditor, _agentFeedbackService: IAgentFeedbackService, _chatEditingService: IChatEditingService, _agentSessionsService: IAgentSessionsService);
    private _onModelChanged;
    private _resolveSession;
    private _updateFeedbackLines;
    private _onMouseMove;
    private _updateHintDecoration;
    private _onMouseDown;
    dispose(): void;
}
