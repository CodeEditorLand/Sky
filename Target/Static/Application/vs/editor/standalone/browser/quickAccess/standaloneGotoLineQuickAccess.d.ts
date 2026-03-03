import { AbstractGotoLineQuickAccessProvider } from '../../../contrib/quickAccess/browser/gotoLineQuickAccess.js';
import { ICodeEditorService } from '../../../browser/services/codeEditorService.js';
import { Event } from '../../../../base/common/event.js';
import { EditorAction, ServicesAccessor } from '../../../browser/editorExtensions.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
export declare class StandaloneGotoLineQuickAccessProvider extends AbstractGotoLineQuickAccessProvider {
    private readonly editorService;
    protected readonly storageService: IStorageService;
    protected readonly onDidActiveTextEditorControlChange: Event<any>;
    constructor(editorService: ICodeEditorService, storageService: IStorageService);
    protected get activeTextEditorControl(): import("../../../browser/editorBrowser.ts").ICodeEditor | undefined;
}
export declare class GotoLineAction extends EditorAction {
    static readonly ID = "editor.action.gotoLine";
    constructor();
    run(accessor: ServicesAccessor): void;
}
