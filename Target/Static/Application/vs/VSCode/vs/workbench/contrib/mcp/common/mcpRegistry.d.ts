import { Disposable, IDisposable } from '../../../../base/common/lifecycle.js';
import { IObservable } from '../../../../base/common/observable.js';
import { ConfigurationTarget, IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ILabelService } from '../../../../platform/label/common/label.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import { StorageScope } from '../../../../platform/storage/common/storage.js';
import { IWorkspaceFolderData } from '../../../../platform/workspace/common/workspace.js';
import { IWorkspaceTrustManagementService, IWorkspaceTrustRequestService } from '../../../../platform/workspace/common/workspaceTrust.js';
import { IConfigurationResolverService } from '../../../services/configurationResolver/common/configurationResolver.js';
import { IResolvedValue } from '../../../services/configurationResolver/common/configurationResolverExpression.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IMcpHostDelegate, IMcpRegistry, IMcpResolveConnectionOptions } from './mcpRegistryTypes.js';
import { IMcpSandboxService } from './mcpSandboxService.js';
import { IMcpServerConnection, LazyCollectionState, McpCollectionDefinition, McpDefinitionReference, McpServerDefinition } from './mcpTypes.js';
export declare class McpRegistry extends Disposable implements IMcpRegistry {
    private readonly _instantiationService;
    private readonly _configurationResolverService;
    private readonly _dialogService;
    private readonly _notificationService;
    private readonly _editorService;
    private readonly _quickInputService;
    private readonly _labelService;
    private readonly _logService;
    private readonly _mcpSandboxService;
    private readonly _workspaceTrustManagementService;
    private readonly _workspaceTrustRequestService;
    readonly _serviceBrand: undefined;
    private readonly _collections;
    private readonly _delegates;
    private readonly _mcpAccessValue;
    readonly collections: IObservable<readonly McpCollectionDefinition[]>;
    private readonly _workspaceStorage;
    private readonly _profileStorage;
    private readonly _ongoingLazyActivations;
    readonly lazyCollectionState: import("../../../../base/common/observable.js").IObservableWithChange<{
        state: LazyCollectionState;
        collections: McpCollectionDefinition[];
    }, void>;
    get delegates(): IObservable<readonly IMcpHostDelegate[]>;
    private readonly _onDidChangeInputs;
    readonly onDidChangeInputs: import("../../../../base/common/event.js").Event<void>;
    constructor(_instantiationService: IInstantiationService, _configurationResolverService: IConfigurationResolverService, _dialogService: IDialogService, _notificationService: INotificationService, _editorService: IEditorService, configurationService: IConfigurationService, _quickInputService: IQuickInputService, _labelService: ILabelService, _logService: ILogService, _mcpSandboxService: IMcpSandboxService, _workspaceTrustManagementService: IWorkspaceTrustManagementService, _workspaceTrustRequestService: IWorkspaceTrustRequestService);
    registerDelegate(delegate: IMcpHostDelegate): IDisposable;
    registerCollection(collection: McpCollectionDefinition): IDisposable;
    getServerDefinition(collectionRef: McpDefinitionReference, definitionRef: McpDefinitionReference): IObservable<{
        server: McpServerDefinition | undefined;
        collection: McpCollectionDefinition | undefined;
    }>;
    discoverCollections(): Promise<McpCollectionDefinition[]>;
    private _getInputStorage;
    private _getInputStorageInConfigTarget;
    clearSavedInputs(scope: StorageScope, inputId?: string): Promise<void>;
    editSavedInput(inputId: string, folderData: IWorkspaceFolderData | undefined, configSection: string, target: ConfigurationTarget): Promise<void>;
    setSavedInput(inputId: string, target: ConfigurationTarget, value: string): Promise<void>;
    getSavedInputs(scope: StorageScope): Promise<{
        [id: string]: IResolvedValue;
    }>;
    private _checkTrust;
    private _promptForTrust;
    /**
     * Confirms with the user which of the provided definitions should be trusted.
     * Returns undefined if the user cancelled the flow, or the list of trusted
     * definition IDs otherwise.
     */
    protected _promptForTrustOpenDialog(definitions: {
        definition: McpServerDefinition;
        collection: McpCollectionDefinition;
    }[]): Promise<string[] | undefined>;
    private _updateStorageWithExpressionInputs;
    private _replaceVariablesInLaunch;
    resolveConnection(opts: IMcpResolveConnectionOptions): Promise<IMcpServerConnection | undefined>;
}
