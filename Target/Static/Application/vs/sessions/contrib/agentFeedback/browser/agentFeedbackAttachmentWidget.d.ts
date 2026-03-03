import './media/agentFeedbackAttachment.css';
import { Disposable } from '../../../../base/common/lifecycle.js';
import * as event from '../../../../base/common/event.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IAgentFeedbackVariableEntry } from '../../../../workbench/contrib/chat/common/attachments/chatVariableEntries.js';
/**
 * Attachment widget that renders "N comments" with a comment icon
 * and a custom hover showing all feedback items with actions.
 */
export declare class AgentFeedbackAttachmentWidget extends Disposable {
    private readonly _attachment;
    private readonly _instantiationService;
    readonly element: HTMLElement;
    private readonly _onDidDelete;
    readonly onDidDelete: event.Event<Event>;
    private readonly _onDidOpen;
    readonly onDidOpen: event.Event<void>;
    constructor(_attachment: IAgentFeedbackVariableEntry, options: {
        shouldFocusClearButton: boolean;
        supportsDeletion: boolean;
    }, container: HTMLElement, _instantiationService: IInstantiationService);
}
