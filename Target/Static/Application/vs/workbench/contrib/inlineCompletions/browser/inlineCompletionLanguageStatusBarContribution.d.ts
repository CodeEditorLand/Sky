import { Disposable, DisposableStore } from '../../../../base/common/lifecycle.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { IChatEntitlementService } from '../../../services/chat/common/chatEntitlementService.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { ILanguageStatusService } from '../../../services/languageStatus/common/languageStatusService.js';
export declare class InlineCompletionLanguageStatusBarContribution extends Disposable implements IWorkbenchContribution {
    private readonly _languageStatusService;
    private readonly _editorService;
    private readonly _chatEntitlementService;
    static readonly hot: import("../../../../base/common/observable.js").IObservable<typeof InlineCompletionLanguageStatusBarContribution>;
    static Id: string;
    static readonly languageStatusBarDisposables: Set<DisposableStore>;
    private _activeEditor;
    private _state;
    private _sentiment;
    constructor(_languageStatusService: ILanguageStatusService, _editorService: IEditorService, _chatEntitlementService: IChatEntitlementService);
}
