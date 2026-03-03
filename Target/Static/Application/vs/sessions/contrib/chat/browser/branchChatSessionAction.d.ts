import { Action2 } from '../../../../platform/actions/common/actions.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
/**
 * Action ID for branching chat session to a new local session.
 */
export declare const ACTION_ID_BRANCH_CHAT_SESSION = "workbench.action.chat.branchChatSession";
/**
 * Action that allows users to branch the current chat session from a specific checkpoint.
 * This creates a copy of the conversation up to the selected checkpoint, allowing users
 * to explore alternative paths from any point in the conversation.
 */
export declare class BranchChatSessionAction extends Action2 {
    static readonly ID = "workbench.action.chat.branchChatSession";
    constructor();
    run(accessor: ServicesAccessor, ...args: unknown[]): Promise<void>;
}
