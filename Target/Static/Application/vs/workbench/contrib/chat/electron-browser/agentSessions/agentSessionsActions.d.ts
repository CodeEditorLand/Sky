import { ServicesAccessor } from '../../../../../editor/browser/editorExtensions.js';
import { Action2 } from '../../../../../platform/actions/common/actions.js';
export declare class OpenSessionsWindowAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
