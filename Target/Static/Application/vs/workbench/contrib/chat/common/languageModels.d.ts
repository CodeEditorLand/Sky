import { VSBuffer } from '../../../../base/common/buffer.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { IStringDictionary } from '../../../../base/common/collections.js';
import { Event } from '../../../../base/common/event.js';
import { TypeFromJsonSchema } from '../../../../base/common/jsonSchema.js';
import { IDisposable } from '../../../../base/common/lifecycle.js';
import { IObservable } from '../../../../base/common/observable.js';
import Severity from '../../../../base/common/severity.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
import { URI } from '../../../../base/common/uri.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { ExtensionIdentifier } from '../../../../platform/extensions/common/extensions.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { IRequestService } from '../../../../platform/request/common/request.js';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import { ISecretStorageService } from '../../../../platform/secrets/common/secrets.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IExtensionService } from '../../../services/extensions/common/extensions.js';
import { ChatAgentLocation } from './constants.js';
import { ILanguageModelsProviderGroup, ILanguageModelsConfigurationService } from './languageModelsConfiguration.js';
export declare const enum ChatMessageRole {
    System = 0,
    User = 1,
    Assistant = 2
}
export declare enum LanguageModelPartAudience {
    Assistant = 0,
    User = 1,
    Extension = 2
}
export interface IChatMessageTextPart {
    type: 'text';
    value: string;
    audience?: LanguageModelPartAudience[];
}
export interface IChatMessageImagePart {
    type: 'image_url';
    value: IChatImageURLPart;
}
export interface IChatMessageThinkingPart {
    type: 'thinking';
    value: string | string[];
    id?: string;
    metadata?: {
        readonly [key: string]: any;
    };
}
export interface IChatMessageDataPart {
    type: 'data';
    mimeType: string;
    data: VSBuffer;
    audience?: LanguageModelPartAudience[];
}
export interface IChatImageURLPart {
    /**
     * The image's MIME type (e.g., "image/png", "image/jpeg").
     */
    mimeType: ChatImageMimeType;
    /**
     * The raw binary data of the image, encoded as a Uint8Array. Note: do not use base64 encoding. Maximum image size is 5MB.
     */
    data: VSBuffer;
}
/**
 * Enum for supported image MIME types.
 */
export declare enum ChatImageMimeType {
    PNG = "image/png",
    JPEG = "image/jpeg",
    GIF = "image/gif",
    WEBP = "image/webp",
    BMP = "image/bmp"
}
/**
 * Specifies the detail level of the image.
 */
export declare enum ImageDetailLevel {
    Low = "low",
    High = "high"
}
export interface IChatMessageToolResultPart {
    type: 'tool_result';
    toolCallId: string;
    value: (IChatResponseTextPart | IChatResponsePromptTsxPart | IChatResponseDataPart)[];
    isError?: boolean;
}
export type IChatMessagePart = IChatMessageTextPart | IChatMessageToolResultPart | IChatResponseToolUsePart | IChatMessageImagePart | IChatMessageDataPart | IChatMessageThinkingPart;
export interface IChatMessage {
    readonly name?: string | undefined;
    readonly role: ChatMessageRole;
    readonly content: IChatMessagePart[];
}
export interface IChatResponseTextPart {
    type: 'text';
    value: string;
    audience?: LanguageModelPartAudience[];
}
export interface IChatResponsePromptTsxPart {
    type: 'prompt_tsx';
    value: unknown;
}
export interface IChatResponseDataPart {
    type: 'data';
    mimeType: string;
    data: VSBuffer;
    audience?: LanguageModelPartAudience[];
}
export interface IChatResponseToolUsePart {
    type: 'tool_use';
    name: string;
    toolCallId: string;
    parameters: any;
}
export interface IChatResponseThinkingPart {
    type: 'thinking';
    value: string | string[];
    id?: string;
    metadata?: {
        readonly [key: string]: any;
    };
}
export interface IChatResponsePullRequestPart {
    type: 'pullRequest';
    uri: URI;
    title: string;
    description: string;
    author: string;
    linkTag: string;
}
export type IChatResponsePart = IChatResponseTextPart | IChatResponseToolUsePart | IChatResponseDataPart | IChatResponseThinkingPart;
export type IExtendedChatResponsePart = IChatResponsePullRequestPart;
export interface ILanguageModelChatMetadata {
    readonly extension: ExtensionIdentifier;
    readonly name: string;
    readonly id: string;
    readonly vendor: string;
    readonly version: string;
    readonly tooltip?: string;
    readonly detail?: string;
    readonly multiplier?: string;
    readonly multiplierNumeric?: number;
    readonly family: string;
    readonly maxInputTokens: number;
    readonly maxOutputTokens: number;
    readonly isDefaultForLocation: {
        [K in ChatAgentLocation]?: boolean;
    };
    readonly isUserSelectable?: boolean;
    readonly statusIcon?: ThemeIcon;
    readonly modelPickerCategory: {
        label: string;
        order: number;
    } | undefined;
    readonly auth?: {
        readonly providerLabel: string;
        readonly accountLabel?: string;
    };
    readonly capabilities?: {
        readonly vision?: boolean;
        readonly toolCalling?: boolean;
        readonly agentMode?: boolean;
        readonly editTools?: ReadonlyArray<string>;
    };
    /**
     * When set, this model is only shown in the model picker for the specified chat session type.
     * Models with this property are excluded from the general model picker and only appear
     * when the user is in a session matching this type.
     */
    readonly targetChatSessionType?: string;
}
export declare namespace ILanguageModelChatMetadata {
    function suitableForAgentMode(metadata: ILanguageModelChatMetadata): boolean;
    function asQualifiedName(metadata: ILanguageModelChatMetadata): string;
    function matchesQualifiedName(name: string, metadata: ILanguageModelChatMetadata): boolean;
}
export interface ILanguageModelChatResponse {
    stream: AsyncIterable<IChatResponsePart | IChatResponsePart[]>;
    result: Promise<any>;
}
export declare function getTextResponseFromStream(response: ILanguageModelChatResponse): Promise<string>;
export interface ILanguageModelChatProvider {
    readonly onDidChange: Event<void>;
    provideLanguageModelChatInfo(options: ILanguageModelChatInfoOptions, token: CancellationToken): Promise<ILanguageModelChatMetadataAndIdentifier[]>;
    sendChatRequest(modelId: string, messages: IChatMessage[], from: ExtensionIdentifier, options: {
        [name: string]: unknown;
    }, token: CancellationToken): Promise<ILanguageModelChatResponse>;
    provideTokenCount(modelId: string, message: string | IChatMessage, token: CancellationToken): Promise<number>;
}
export interface ILanguageModelChat {
    metadata: ILanguageModelChatMetadata;
    sendChatRequest(messages: IChatMessage[], from: ExtensionIdentifier, options: {
        [name: string]: unknown;
    }, token: CancellationToken): Promise<ILanguageModelChatResponse>;
    provideTokenCount(message: string | IChatMessage, token: CancellationToken): Promise<number>;
}
export interface ILanguageModelChatSelector {
    readonly name?: string;
    readonly id?: string;
    readonly vendor?: string;
    readonly version?: string;
    readonly family?: string;
    readonly tokens?: number;
    readonly extension?: ExtensionIdentifier;
}
export declare function isILanguageModelChatSelector(value: unknown): value is ILanguageModelChatSelector;
export declare const ILanguageModelsService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ILanguageModelsService>;
export interface ILanguageModelChatMetadataAndIdentifier {
    metadata: ILanguageModelChatMetadata;
    identifier: string;
}
export interface ILanguageModelChatInfoOptions {
    readonly group?: string;
    readonly silent: boolean;
    readonly configuration?: IStringDictionary<unknown>;
}
export interface ILanguageModelsGroup {
    readonly group?: ILanguageModelsProviderGroup;
    readonly modelIdentifiers: string[];
    readonly status?: {
        readonly message: string;
        readonly severity: Severity;
    };
}
export interface ILanguageModelsService {
    readonly _serviceBrand: undefined;
    readonly onDidChangeLanguageModelVendors: Event<readonly string[]>;
    readonly onDidChangeLanguageModels: Event<string>;
    updateModelPickerPreference(modelIdentifier: string, showInModelPicker: boolean): void;
    getLanguageModelIds(): string[];
    getVendors(): ILanguageModelProviderDescriptor[];
    lookupLanguageModel(modelId: string): ILanguageModelChatMetadata | undefined;
    /**
     * Find a model by its qualified name. The qualified name is what is used in prompt and agent files and is in the format "Model Name (Vendor)".
     */
    lookupLanguageModelByQualifiedName(qualifiedName: string): ILanguageModelChatMetadataAndIdentifier | undefined;
    getLanguageModelGroups(vendor: string): ILanguageModelsGroup[];
    /**
     * Given a selector, returns a list of model identifiers
     * @param selector The selector to lookup for language models. If the selector is empty, all language models are returned.
     */
    selectLanguageModels(selector: ILanguageModelChatSelector): Promise<string[]>;
    registerLanguageModelProvider(vendor: string, provider: ILanguageModelChatProvider): IDisposable;
    deltaLanguageModelChatProviderDescriptors(added: IUserFriendlyLanguageModel[], removed: IUserFriendlyLanguageModel[]): void;
    sendChatRequest(modelId: string, from: ExtensionIdentifier, messages: IChatMessage[], options: {
        [name: string]: any;
    }, token: CancellationToken): Promise<ILanguageModelChatResponse>;
    computeTokenLength(modelId: string, message: string | IChatMessage, token: CancellationToken): Promise<number>;
    addLanguageModelsProviderGroup(name: string, vendorId: string, configuration: IStringDictionary<unknown> | undefined): Promise<void>;
    removeLanguageModelsProviderGroup(vendorId: string, providerGroupName: string): Promise<void>;
    configureLanguageModelsProviderGroup(vendorId: string, name?: string): Promise<void>;
    migrateLanguageModelsProviderGroup(languageModelsProviderGroup: ILanguageModelsProviderGroup): Promise<void>;
    /**
     * Returns the most recently used model identifiers, ordered by most-recent-first.
     * @param maxCount Maximum number of entries to return (default 7).
     */
    getRecentlyUsedModelIds(): string[];
    /**
     * Records that a model was used, updating the recently used list.
     */
    addToRecentlyUsedList(modelIdentifier: string): void;
    /**
     * Clears the recently used model list.
     */
    clearRecentlyUsedList(): void;
    /**
     * Returns the models from the control manifest,
     * separated into free and paid tiers.
     */
    getModelsControlManifest(): IModelsControlManifest;
    /**
     * Fires when models control manifest changes.
     */
    readonly onDidChangeModelsControlManifest: Event<IModelsControlManifest>;
    /**
     * Observable map of restricted chat participant names to allowed extension publisher/IDs.
     * Fetched from the chat control manifest.
     */
    readonly restrictedChatParticipants: IObservable<{
        [name: string]: string[];
    }>;
}
export interface IModelControlEntry {
    readonly label: string;
    readonly featured?: boolean;
    readonly minVSCodeVersion?: string;
    readonly exists: boolean;
}
export interface IModelsControlManifest {
    readonly free: IStringDictionary<IModelControlEntry>;
    readonly paid: IStringDictionary<IModelControlEntry>;
}
declare const languageModelChatProviderType: {
    readonly type: "object";
    readonly required: ["vendor", "displayName"];
    readonly properties: {
        readonly vendor: {
            readonly type: "string";
            readonly description: string;
        };
        readonly displayName: {
            readonly type: "string";
            readonly description: string;
        };
        readonly configuration: {
            readonly type: "object";
            readonly description: string;
            readonly anyOf: [{
                readonly $ref: "http://json-schema.org/draft-07/schema#";
            }, {
                readonly properties: {
                    readonly properties: {
                        readonly type: "object";
                        readonly additionalProperties: {
                            readonly $ref: "http://json-schema.org/draft-07/schema#";
                            readonly properties: {
                                readonly secret: {
                                    readonly type: "boolean";
                                    readonly description: string;
                                };
                            };
                        };
                    };
                    readonly additionalProperties: {
                        readonly $ref: "http://json-schema.org/draft-07/schema#";
                        readonly properties: {
                            readonly secret: {
                                readonly type: "boolean";
                                readonly description: string;
                            };
                        };
                    };
                };
            }];
        };
        readonly managementCommand: {
            readonly type: "string";
            readonly description: string;
            readonly deprecated: true;
            readonly deprecationMessage: string;
        };
        readonly when: {
            readonly type: "string";
            readonly description: string;
        };
    };
};
export type IUserFriendlyLanguageModel = TypeFromJsonSchema<typeof languageModelChatProviderType>;
export interface ILanguageModelProviderDescriptor extends IUserFriendlyLanguageModel {
    readonly isDefault: boolean;
}
export declare const languageModelChatProviderExtensionPoint: import("../../../services/extensions/common/extensionsRegistry.js").IExtensionPoint<{
    readonly vendor: string;
    readonly displayName: string;
    readonly configuration: undefined;
    readonly managementCommand: string | undefined;
    readonly when: string | undefined;
} | {
    readonly vendor: string;
    readonly displayName: string;
    readonly configuration: undefined;
    readonly managementCommand: string | undefined;
    readonly when: string | undefined;
}[]>;
export declare class LanguageModelsService implements ILanguageModelsService {
    private readonly _extensionService;
    private readonly _logService;
    private readonly _storageService;
    private readonly _contextKeyService;
    private readonly _languageModelsConfigurationService;
    private readonly _quickInputService;
    private readonly _secretStorageService;
    private readonly _productService;
    private readonly _requestService;
    private static SECRET_KEY_PREFIX;
    private static SECRET_INPUT;
    readonly _serviceBrand: undefined;
    private readonly _store;
    private readonly _providers;
    private readonly _vendors;
    private readonly _onDidChangeLanguageModelVendors;
    readonly onDidChangeLanguageModelVendors: Event<string[]>;
    private readonly _modelsGroups;
    private readonly _modelCache;
    private readonly _resolveLMSequencer;
    private _modelPickerUserPreferences;
    private readonly _hasUserSelectableModels;
    private readonly _onLanguageModelChange;
    readonly onDidChangeLanguageModels: Event<string>;
    private _recentlyUsedModelIds;
    private readonly _onDidChangeModelsControlManifest;
    readonly onDidChangeModelsControlManifest: Event<IModelsControlManifest>;
    private _modelsControlManifest;
    private _modelsControlRawResponse;
    private _chatControlUrl;
    private _chatControlDisposed;
    private readonly _restrictedChatParticipants;
    readonly restrictedChatParticipants: IObservable<{
        [name: string]: string[];
    }>;
    constructor(_extensionService: IExtensionService, _logService: ILogService, _storageService: IStorageService, _contextKeyService: IContextKeyService, _languageModelsConfigurationService: ILanguageModelsConfigurationService, _quickInputService: IQuickInputService, _secretStorageService: ISecretStorageService, _productService: IProductService, _requestService: IRequestService);
    deltaLanguageModelChatProviderDescriptors(added: IUserFriendlyLanguageModel[], removed: IUserFriendlyLanguageModel[]): void;
    private _onDidChangeLanguageModelGroups;
    private _readModelPickerPreferences;
    private _onDidChangeModelPickerPreferences;
    private _hasStoredModelForVendor;
    private _saveModelPickerPreferences;
    updateModelPickerPreference(modelIdentifier: string, showInModelPicker: boolean): void;
    getVendors(): ILanguageModelProviderDescriptor[];
    getLanguageModelIds(): string[];
    lookupLanguageModel(modelIdentifier: string): ILanguageModelChatMetadata | undefined;
    lookupLanguageModelByQualifiedName(referenceName: string): ILanguageModelChatMetadataAndIdentifier | undefined;
    private _resolveAllLanguageModels;
    getLanguageModelGroups(vendor: string): ILanguageModelsGroup[];
    selectLanguageModels(selector: ILanguageModelChatSelector): Promise<string[]>;
    registerLanguageModelProvider(vendor: string, provider: ILanguageModelChatProvider): IDisposable;
    sendChatRequest(modelId: string, from: ExtensionIdentifier, messages: IChatMessage[], options: {
        [name: string]: any;
    }, token: CancellationToken): Promise<ILanguageModelChatResponse>;
    computeTokenLength(modelId: string, message: string | IChatMessage, token: CancellationToken): Promise<number>;
    configureLanguageModelsProviderGroup(vendorId: string, providerGroupName?: string): Promise<void>;
    addLanguageModelsProviderGroup(name: string, vendorId: string, configuration: IStringDictionary<unknown> | undefined): Promise<void>;
    removeLanguageModelsProviderGroup(vendorId: string, providerGroupName: string): Promise<void>;
    private requireConfiguring;
    private getSnippetForFirstUnconfiguredProperty;
    private promptForName;
    private promptForConfiguration;
    private promptForValue;
    private canPromptForProperty;
    private promptForArray;
    private promptForInput;
    private encodeSecretKey;
    private decodeSecretKey;
    private _clearModelCache;
    private _resolveConfiguration;
    private _resolveLanguageModelProviderGroup;
    private _deleteSecretsInConfiguration;
    migrateLanguageModelsProviderGroup(languageModelsProviderGroup: ILanguageModelsProviderGroup): Promise<void>;
    private _readRecentlyUsedModels;
    private _saveRecentlyUsedModels;
    getRecentlyUsedModelIds(): string[];
    addToRecentlyUsedList(modelIdentifier: string): void;
    clearRecentlyUsedList(): void;
    getModelsControlManifest(): IModelsControlManifest;
    private _setModelsControlManifest;
    private _refreshModelsControlManifest;
    private _modelExistsInCache;
    private _initChatControlData;
    private _refreshChatControlData;
    private _fetchChatControlData;
    dispose(): void;
}
export {};
