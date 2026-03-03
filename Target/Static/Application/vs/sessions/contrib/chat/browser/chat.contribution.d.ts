import { ServicesAccessor } from '../../../../editor/browser/editorExtensions.js';
import { Action2 } from '../../../../platform/actions/common/actions.js';
import './nullInlineChatSessionService.js';
export declare class OpenSessionWorktreeInVSCodeAction extends Action2 {
    static readonly ID = "chat.openSessionWorktreeInVSCode";
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
