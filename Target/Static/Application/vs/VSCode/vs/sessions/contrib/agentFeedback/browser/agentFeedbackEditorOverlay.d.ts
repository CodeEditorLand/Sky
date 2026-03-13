import './media/agentFeedbackEditorOverlay.css';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { IWorkbenchContribution } from '../../../../workbench/common/contributions.js';
import { IEditorGroupsService } from '../../../../workbench/services/editor/common/editorGroupsService.js';
export declare class AgentFeedbackOverlayWidget extends Disposable {
    private readonly _instaService;
    private readonly _keybindingService;
    private readonly _domNode;
    private readonly _toolbarNode;
    private readonly _showStore;
    private readonly _navigationBearings;
    constructor(_instaService: IInstantiationService, _keybindingService: IKeybindingService);
    getDomNode(): HTMLElement;
    show(navigationBearings: {
        activeIdx: number;
        totalCount: number;
    }): void;
    hide(): void;
}
export declare class AgentFeedbackEditorOverlay implements IWorkbenchContribution {
    static readonly ID = "chat.agentFeedback.editorOverlay";
    private readonly _store;
    constructor(editorGroupsService: IEditorGroupsService, instantiationService: IInstantiationService);
    dispose(): void;
}
