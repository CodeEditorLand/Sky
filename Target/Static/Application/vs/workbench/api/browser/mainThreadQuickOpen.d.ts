import { CancellationToken } from '../../../base/common/cancellation.js';
import { ILanguageService } from '../../../editor/common/languages/language.js';
import { IModelService } from '../../../editor/common/services/model.js';
import { ILabelService } from '../../../platform/label/common/label.js';
import { IPickOptions, IQuickInputService } from '../../../platform/quickinput/common/quickInput.js';
import { ICustomEditorLabelService } from '../../services/editor/common/customEditorLabelService.js';
import { IExtHostContext } from '../../services/extensions/common/extHostCustomers.js';
import { IInputBoxOptions, MainThreadQuickOpenShape, TransferQuickInput, TransferQuickPickItem, TransferQuickPickItemOrSeparator } from '../common/extHost.protocol.js';
export declare class MainThreadQuickOpen implements MainThreadQuickOpenShape {
    private readonly labelService;
    private readonly customEditorLabelService;
    private readonly modelService;
    private readonly languageService;
    private readonly _proxy;
    private readonly _quickInputService;
    private readonly _items;
    constructor(extHostContext: IExtHostContext, quickInputService: IQuickInputService, labelService: ILabelService, customEditorLabelService: ICustomEditorLabelService, modelService: IModelService, languageService: ILanguageService);
    dispose(): void;
    $show(instance: number, options: IPickOptions<TransferQuickPickItem>, token: CancellationToken): Promise<number | number[] | undefined>;
    $setItems(instance: number, items: TransferQuickPickItemOrSeparator[]): Promise<void>;
    $setError(instance: number, error: Error): Promise<void>;
    $input(options: IInputBoxOptions | undefined, validateInput: boolean, token: CancellationToken): Promise<string | undefined>;
    private sessions;
    $createOrUpdate(params: TransferQuickInput): Promise<void>;
    $dispose(sessionId: number): Promise<void>;
    /**
    * Derives icon, label and description for Quick Pick items that represent a resource URI.
    */
    private expandItemProps;
    /**
    * Converts IconPath DTO into iconPath/iconClass properties.
    */
    private expandIconPath;
}
