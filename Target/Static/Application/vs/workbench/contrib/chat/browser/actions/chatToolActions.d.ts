import { URI } from '../../../../../base/common/uri.js';
export declare const AcceptToolConfirmationActionId = "workbench.action.chat.acceptTool";
export declare const SkipToolConfirmationActionId = "workbench.action.chat.skipTool";
export declare const AcceptToolPostConfirmationActionId = "workbench.action.chat.acceptToolPostExecution";
export declare const SkipToolPostConfirmationActionId = "workbench.action.chat.skipToolPostExecution";
export interface IToolConfirmationActionContext {
    readonly sessionResource?: URI;
}
export declare function registerChatToolActions(): void;
