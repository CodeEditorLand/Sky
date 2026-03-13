import './media/aiCustomizationManagement.css';
import * as DOM from '../../../../../base/browser/dom.js';
import { CancellationToken } from '../../../../../base/common/cancellation.js';
import { IStorageService } from '../../../../../platform/storage/common/storage.js';
import { ITelemetryService } from '../../../../../platform/telemetry/common/telemetry.js';
import { IThemeService } from '../../../../../platform/theme/common/themeService.js';
import { IEditorOptions } from '../../../../../platform/editor/common/editor.js';
import { EditorPane } from '../../../../browser/parts/editor/editorPane.js';
import { IEditorOpenContext } from '../../../../common/editor.js';
import { IEditorGroup } from '../../../../services/editor/common/editorGroupsService.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IContextKeyService } from '../../../../../platform/contextkey/common/contextkey.js';
import { IOpenerService } from '../../../../../platform/opener/common/opener.js';
import { AICustomizationManagementEditorInput } from './aiCustomizationManagementEditorInput.js';
import { AICustomizationManagementSection } from './aiCustomizationManagement.js';
import { IPromptsService } from '../../common/promptSyntax/service/promptsService.js';
import { ICommandService } from '../../../../../platform/commands/common/commands.js';
import { IAICustomizationWorkspaceService } from '../../common/aiCustomizationWorkspaceService.js';
import { IModelService } from '../../../../../editor/common/services/model.js';
import { ITextModelService } from '../../../../../editor/common/services/resolverService.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IWorkingCopyService } from '../../../../services/workingCopy/common/workingCopyService.js';
import { IFileDialogService } from '../../../../../platform/dialogs/common/dialogs.js';
import { IHoverService } from '../../../../../platform/hover/browser/hover.js';
import { IFileService } from '../../../../../platform/files/common/files.js';
import { INotificationService } from '../../../../../platform/notification/common/notification.js';
import { IQuickInputService } from '../../../../../platform/quickinput/common/quickInput.js';
export declare const aiCustomizationManagementSashBorder: string;
/**
 * Editor pane for the AI Customizations Management Editor.
 * Provides a global view of all AI customizations with a sidebar for navigation
 * and a content area showing a searchable list of items.
 */
export declare class AICustomizationManagementEditor extends EditorPane {
    private readonly storageService;
    private readonly instantiationService;
    private readonly openerService;
    private readonly commandService;
    private readonly workspaceService;
    private readonly promptsService;
    private readonly textModelService;
    private readonly configurationService;
    private readonly workingCopyService;
    private readonly fileDialogService;
    private readonly hoverService;
    private readonly modelService;
    private readonly quickInputService;
    private readonly fileService;
    private readonly notificationService;
    static readonly ID = "workbench.editor.aiCustomizationManagement";
    private container;
    private splitViewContainer;
    private splitView;
    private sidebarContainer;
    private sectionsList;
    private contentContainer;
    private listWidget;
    private mcpListWidget;
    private pluginListWidget;
    private modelsWidget;
    private promptsContentContainer;
    private mcpContentContainer;
    private pluginContentContainer;
    private modelsContentContainer;
    private modelsFooterElement;
    private editorContentContainer;
    private embeddedEditor;
    private editorActionButton;
    private editorActionButtonIcon;
    private editorActionButtonInProgress;
    private editorItemNameElement;
    private editorItemPathElement;
    private editorSaveIndicator;
    private readonly editorModelChangeDisposables;
    private readonly builtinEditingSessions;
    private currentEditingUri;
    private currentEditingProjectRoot;
    private currentEditingStorage;
    private currentEditingPromptType;
    private currentModelRef;
    private viewMode;
    private mcpDetailContainer;
    private embeddedMcpEditor;
    private readonly mcpDetailDisposables;
    private pluginDetailContainer;
    private embeddedPluginEditor;
    private readonly pluginDetailDisposables;
    private dimension;
    private readonly sections;
    private selectedSection;
    private readonly editorDisposables;
    private _editorContentChanged;
    private folderPickerContainer;
    private folderPickerLabel;
    private folderPickerClearButton;
    private readonly inEditorContextKey;
    private readonly sectionContextKey;
    constructor(group: IEditorGroup, telemetryService: ITelemetryService, themeService: IThemeService, storageService: IStorageService, instantiationService: IInstantiationService, contextKeyService: IContextKeyService, openerService: IOpenerService, commandService: ICommandService, workspaceService: IAICustomizationWorkspaceService, promptsService: IPromptsService, textModelService: ITextModelService, configurationService: IConfigurationService, workingCopyService: IWorkingCopyService, fileDialogService: IFileDialogService, hoverService: IHoverService, modelService: IModelService, quickInputService: IQuickInputService, fileService: IFileService, notificationService: INotificationService);
    protected createEditor(parent: HTMLElement): void;
    private createSplitView;
    private createSidebar;
    private createFolderPicker;
    private updateFolderPickerLabel;
    private browseForFolder;
    private createContent;
    private isPromptsSection;
    private selectSection;
    private ensureSectionsListReflectsActiveSection;
    private updateContentVisibility;
    /**
     * Creates a new customization using the AI-guided flow.
     */
    private createNewItemWithAI;
    /**
     * Creates a new prompt file and opens it in the embedded editor.
     */
    private createNewItemManual;
    updateStyles(): void;
    setInput(input: AICustomizationManagementEditorInput, options: IEditorOptions | undefined, context: IEditorOpenContext, token: CancellationToken): Promise<void>;
    clearInput(): void;
    layout(dimension: DOM.Dimension): void;
    focus(): void;
    /**
     * Selects a specific section programmatically.
     */
    selectSectionById(sectionId: AICustomizationManagementSection): void;
    /**
     * Refreshes the list widget.
     */
    refreshList(): void;
    /**
     * Generates a debug report for the current section.
     */
    generateDebugReport(): Promise<string>;
    private createEmbeddedEditor;
    private showEmbeddedEditor;
    private goBackToList;
    private getOrCreateBuiltinEditingSession;
    private createBuiltinPromptSaveRequest;
    private createExistingCustomizationSaveRequest;
    private saveBuiltinPromptCopy;
    private saveExistingCustomization;
    private pickBuiltinPromptSaveTarget;
    private handleEditorActionButton;
    private updateEditorActionButton;
    private shouldShowBuiltinSaveAction;
    private resetEditorSaveIndicator;
    private disposeBuiltinEditingSessions;
    private disposeBuiltinEditingSession;
    private createEmbeddedMcpDetail;
    private showEmbeddedMcpDetail;
    private goBackFromMcpDetail;
    private createEmbeddedPluginDetail;
    private showEmbeddedPluginDetail;
    private goBackFromPluginDetail;
}
