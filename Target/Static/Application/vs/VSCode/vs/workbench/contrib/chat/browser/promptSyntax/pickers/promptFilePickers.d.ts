import { URI } from '../../../../../../base/common/uri.js';
import { IPromptsService } from '../../../common/promptSyntax/service/promptsService.js';
import { IFileService } from '../../../../../../platform/files/common/files.js';
import { IOpenerService } from '../../../../../../platform/opener/common/opener.js';
import { IDialogService } from '../../../../../../platform/dialogs/common/dialogs.js';
import { ICommandService } from '../../../../../../platform/commands/common/commands.js';
import { PromptsType } from '../../../common/promptSyntax/promptTypes.js';
import { IKeyMods, IQuickInputService } from '../../../../../../platform/quickinput/common/quickInput.js';
import { IInstantiationService } from '../../../../../../platform/instantiation/common/instantiation.js';
import { ILabelService } from '../../../../../../platform/label/common/label.js';
import { IProductService } from '../../../../../../platform/product/common/productService.js';
/**
 * Options for the {@link askToSelectInstructions} function.
 */
export interface ISelectOptions {
    /**
     * The text shows as placeholder in the selection dialog.
     */
    readonly placeholder: string;
    /**
     * Prompt resource `URI` to attach to the chat input, if any.
     * If provided the resource will be pre-selected in the prompt picker dialog,
     * otherwise the dialog will show the prompts list without any pre-selection.
     */
    readonly resource?: URI;
    readonly type: PromptsType;
    readonly optionNew?: boolean;
    readonly optionEdit?: boolean;
    readonly optionDelete?: boolean;
    readonly optionRename?: boolean;
    readonly optionCopy?: boolean;
    readonly optionVisibility?: boolean;
    readonly optionRun?: boolean;
}
export interface ISelectPromptResult {
    /**
     * The selected prompt file.
     */
    readonly promptFile: URI;
    /**
     * The key modifiers that were pressed when the prompt was selected.
     */
    readonly keyMods: IKeyMods;
}
export declare class PromptFilePickers {
    private readonly _quickInputService;
    private readonly _openerService;
    private readonly _fileService;
    private readonly _dialogService;
    private readonly _commandService;
    private readonly _instaService;
    private readonly _promptsService;
    private readonly _labelService;
    private readonly _productService;
    constructor(_quickInputService: IQuickInputService, _openerService: IOpenerService, _fileService: IFileService, _dialogService: IDialogService, _commandService: ICommandService, _instaService: IInstantiationService, _promptsService: IPromptsService, _labelService: ILabelService, _productService: IProductService);
    /**
     * Shows the prompt file selection dialog to the user that allows to run a prompt file(s).
     *
     * If {@link ISelectOptions.resource resource} is provided, the dialog will have
     * the resource pre-selected in the prompts list.
     */
    selectPromptFile(options: ISelectOptions): Promise<ISelectPromptResult | undefined>;
    private _createPromptPickItems;
    private _getExtensionGroupLabel;
    private _getNewItems;
    private _createPromptPickItem;
    private keepQuickPickOpen;
    private _handleButtonClick;
    /**
     * Shows a multi-select (checkbox) quick pick to configure which prompt files of the given
     * type are enabled. Currently only used for agent prompt files.
     */
    managePromptFiles(type: PromptsType, placeholder: string): Promise<boolean>;
}
