import { IMatch } from '../../../../../base/common/filters.js';
import { ILanguageModelsService, ILanguageModelProviderDescriptor, ILanguageModelChatMetadataAndIdentifier } from '../../../chat/common/languageModels.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { ILanguageModelsProviderGroup } from '../../common/languageModelsConfiguration.js';
import Severity from '../../../../../base/common/severity.js';
export declare const MODEL_ENTRY_TEMPLATE_ID = "model.entry.template";
export declare const VENDOR_ENTRY_TEMPLATE_ID = "vendor.entry.template";
export declare const GROUP_ENTRY_TEMPLATE_ID = "group.entry.template";
export declare const SEARCH_SUGGESTIONS: {
    FILTER_TYPES: string[];
    CAPABILITIES: string[];
    VISIBILITY: string[];
};
export interface ILanguageModelProvider {
    vendor: ILanguageModelProviderDescriptor;
    group: ILanguageModelsProviderGroup;
}
export interface ILanguageModel extends ILanguageModelChatMetadataAndIdentifier {
    provider: ILanguageModelProvider;
    visible: boolean;
}
export interface ILanguageModelEntry {
    type: 'model';
    id: string;
    templateId: string;
    model: ILanguageModel;
    providerMatches?: IMatch[];
    modelNameMatches?: IMatch[];
    modelIdMatches?: IMatch[];
    capabilityMatches?: string[];
}
export interface ILanguageModelGroupEntry {
    type: 'group';
    id: string;
    label: string;
    collapsed: boolean;
    templateId: string;
}
export interface ILanguageModelProviderEntry {
    type: 'vendor';
    id: string;
    label: string;
    templateId: string;
    collapsed: boolean;
    vendorEntry: ILanguageModelProvider;
}
export interface IStatusEntry {
    type: 'status';
    id: string;
    message: string;
    severity: Severity;
}
export interface ILanguageModelEntriesGroup {
    group: ILanguageModelGroupEntry | ILanguageModelProviderEntry;
    models: ILanguageModel[];
    status?: IStatusEntry;
}
export declare function isLanguageModelProviderEntry(entry: IViewModelEntry): entry is ILanguageModelProviderEntry;
export declare function isLanguageModelGroupEntry(entry: IViewModelEntry): entry is ILanguageModelGroupEntry;
export declare function isStatusEntry(entry: IViewModelEntry): entry is IStatusEntry;
export type IViewModelEntry = ILanguageModelEntry | ILanguageModelProviderEntry | ILanguageModelGroupEntry | IStatusEntry;
export interface IViewModelChangeEvent {
    at: number;
    removed: number;
    added: IViewModelEntry[];
}
export declare const enum ChatModelGroup {
    Vendor = "vendor",
    Visibility = "visibility"
}
export declare class ChatModelsViewModel extends Disposable {
    private readonly languageModelsService;
    private readonly _onDidChange;
    readonly onDidChange: import("../../../../../base/common/event.js").Event<IViewModelChangeEvent>;
    private readonly _onDidChangeGrouping;
    readonly onDidChangeGrouping: import("../../../../../base/common/event.js").Event<ChatModelGroup>;
    private languageModels;
    private languageModelGroupStatuses;
    private languageModelGroups;
    private readonly collapsedGroups;
    private searchValue;
    private modelsSorted;
    private _groupBy;
    get groupBy(): ChatModelGroup;
    set groupBy(groupBy: ChatModelGroup);
    constructor(languageModelsService: ILanguageModelsService);
    private readonly _viewModelEntries;
    get viewModelEntries(): readonly IViewModelEntry[];
    private splice;
    selectedEntry: IViewModelEntry | undefined;
    shouldRefilter(): boolean;
    filter(searchValue: string): readonly IViewModelEntry[];
    private doFilter;
    private filterModels;
    private getMatchingCapabilities;
    private groupModels;
    private createLanguageModelProviderEntry;
    getVendors(): ILanguageModelProviderDescriptor[];
    refresh(): Promise<void>;
    private refreshAllVendors;
    private refreshVendor;
    private addVendorModels;
    toggleVisibility(model: ILanguageModelEntry): void;
    setModelsVisibility(models: ILanguageModelEntry[], visible: boolean): void;
    setGroupVisibility(group: ILanguageModelProviderEntry | ILanguageModelGroupEntry, visible: boolean): void;
    getModelsForGroup(group: ILanguageModelProviderEntry | ILanguageModelGroupEntry): ILanguageModel[];
    private getModelId;
    private getProviderGroupId;
    toggleCollapsed(viewModelEntry: IViewModelEntry): void;
    collapseAll(): void;
    getConfiguredVendors(): ILanguageModelProvider[];
}
