import { Disposable } from '../../../../../base/common/lifecycle.js';
import { ICodeEditor } from '../../../../../editor/browser/editorBrowser.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
export declare class PromptCodingAgentActionContribution extends Disposable {
    private readonly _editor;
    private readonly _instantiationService;
    static readonly ID = "promptCodingAgentActionContribution";
    private readonly _overlayWidgets;
    constructor(_editor: ICodeEditor, _instantiationService: IInstantiationService);
    private _updateOverlayWidget;
}
