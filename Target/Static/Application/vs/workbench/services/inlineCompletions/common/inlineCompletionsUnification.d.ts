import { Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService, RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { IExtensionManagementService } from '../../../../platform/extensionManagement/common/extensionManagement.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { IWorkbenchAssignmentService } from '../../assignment/common/assignmentService.js';
import { IWorkbenchExtensionEnablementService } from '../../extensionManagement/common/extensionManagement.js';
import { IExtensionService } from '../../extensions/common/extensions.js';
export declare const IInlineCompletionsUnificationService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IInlineCompletionsUnificationService>;
export interface IInlineCompletionsUnificationState {
    codeUnification: boolean;
    modelUnification: boolean;
    extensionUnification: boolean;
    expAssignments: string[];
}
export interface IInlineCompletionsUnificationService {
    readonly _serviceBrand: undefined;
    readonly state: IInlineCompletionsUnificationState;
    readonly onDidStateChange: Event<void>;
}
export declare const isRunningUnificationExperiment: RawContextKey<boolean>;
export declare class InlineCompletionsUnificationImpl extends Disposable implements IInlineCompletionsUnificationService {
    private readonly _assignmentService;
    private readonly _contextKeyService;
    private readonly _configurationService;
    private readonly _extensionEnablementService;
    private readonly _extensionManagementService;
    private readonly _extensionService;
    readonly _serviceBrand: undefined;
    private _state;
    get state(): IInlineCompletionsUnificationState;
    private isRunningUnificationExperiment;
    private readonly _onDidStateChange;
    readonly onDidStateChange: Event<void>;
    private readonly _onDidChangeExtensionUnificationState;
    private readonly _onDidChangeExtensionUnificationSetting;
    private readonly _completionsExtensionId;
    private readonly _chatExtensionId;
    constructor(_assignmentService: IWorkbenchAssignmentService, _contextKeyService: IContextKeyService, _configurationService: IConfigurationService, _extensionEnablementService: IWorkbenchExtensionEnablementService, _extensionManagementService: IExtensionManagementService, _extensionService: IExtensionService, productService: IProductService);
    private _update;
    private _isExtensionUnificationActive;
}
