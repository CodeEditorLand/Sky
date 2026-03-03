import { Disposable } from '../../../../base/common/lifecycle.js';
import { ILanguageService } from '../../../../editor/common/languages/language.js';
import { IModelService } from '../../../../editor/common/services/model.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IAgentFeedbackService } from './agentFeedbackService.js';
import { IAgentFeedbackVariableEntry } from '../../../../workbench/contrib/chat/common/attachments/chatVariableEntries.js';
/**
 * Creates the custom hover content for the "N comments" attachment.
 * Uses a WorkbenchObjectTree to render files as parent nodes and comments as children,
 * with per-row action bars for removal.
 */
export declare class AgentFeedbackHover extends Disposable {
    private readonly _element;
    private readonly _attachment;
    private readonly _canDelete;
    private readonly _hoverService;
    private readonly _instantiationService;
    private readonly _agentFeedbackService;
    private readonly _modelService;
    private readonly _languageService;
    constructor(_element: HTMLElement, _attachment: IAgentFeedbackVariableEntry, _canDelete: boolean, _hoverService: IHoverService, _instantiationService: IInstantiationService, _agentFeedbackService: IAgentFeedbackService, _modelService: IModelService, _languageService: ILanguageService);
    private _showHoverNow;
    private _buildHoverContent;
    private _buildTreeData;
}
