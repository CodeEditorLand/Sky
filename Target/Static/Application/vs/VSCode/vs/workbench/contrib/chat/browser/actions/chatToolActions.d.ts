import { URI } from '../../../../../base/common/uri.js';
import { ServicesAccessor } from '../../../../../editor/browser/editorExtensions.js';
import { Action2 } from '../../../../../platform/actions/common/actions.js';
export declare const AcceptToolConfirmationActionId = "workbench.action.chat.acceptTool";
export declare const SkipToolConfirmationActionId = "workbench.action.chat.skipTool";
export declare const AcceptToolPostConfirmationActionId = "workbench.action.chat.acceptToolPostExecution";
export declare const SkipToolPostConfirmationActionId = "workbench.action.chat.skipToolPostExecution";
export interface IToolConfirmationActionContext {
    readonly sessionResource?: URI;
}
export declare class ConfigureToolsAction extends Action2 {
    static ID: string;
    constructor();
    run(accessor: ServicesAccessor, ...args: unknown[]): Promise<void>;
    private extractWidget;
    private extractSource;
}
export declare function registerChatToolActions(): void;
