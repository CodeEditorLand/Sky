var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { VSBuffer } from "../../../base/common/buffer.js";
import { CancellationToken } from "../../../base/common/cancellation.js";
import { IRemoteConsoleLog } from "../../../base/common/console.js";
import { SerializedError } from "../../../base/common/errors.js";
import { IRelativePattern } from "../../../base/common/glob.js";
import { IMarkdownString } from "../../../base/common/htmlContent.js";
import { IDisposable } from "../../../base/common/lifecycle.js";
import * as performance from "../../../base/common/performance.js";
import Severity from "../../../base/common/severity.js";
import { ThemeColor, ThemeIcon } from "../../../base/common/themables.js";
import { URI, UriComponents, UriDto } from "../../../base/common/uri.js";
import { RenderLineNumbersType, TextEditorCursorStyle } from "../../../editor/common/config/editorOptions.js";
import { ISingleEditOperation } from "../../../editor/common/core/editOperation.js";
import { IPosition } from "../../../editor/common/core/position.js";
import { IRange } from "../../../editor/common/core/range.js";
import { ISelection, Selection } from "../../../editor/common/core/selection.js";
import { IChange } from "../../../editor/common/diff/legacyLinesDiffComputer.js";
import * as editorCommon from "../../../editor/common/editorCommon.js";
import { StandardTokenType } from "../../../editor/common/encodedTokenAttributes.js";
import * as languages from "../../../editor/common/languages.js";
import { CompletionItemLabel } from "../../../editor/common/languages.js";
import { CharacterPair, CommentRule, EnterAction } from "../../../editor/common/languages/languageConfiguration.js";
import { EndOfLineSequence } from "../../../editor/common/model.js";
import { IModelChangedEvent } from "../../../editor/common/model/mirrorTextModel.js";
import { IAccessibilityInformation } from "../../../platform/accessibility/common/accessibility.js";
import { ILocalizedString } from "../../../platform/action/common/action.js";
import { ConfigurationTarget, IConfigurationChange, IConfigurationData, IConfigurationOverrides } from "../../../platform/configuration/common/configuration.js";
import { ConfigurationScope } from "../../../platform/configuration/common/configurationRegistry.js";
import { IExtensionIdWithVersion } from "../../../platform/extensionManagement/common/extensionStorage.js";
import { ExtensionIdentifier, IExtensionDescription } from "../../../platform/extensions/common/extensions.js";
import * as files from "../../../platform/files/common/files.js";
import { ResourceLabelFormatter } from "../../../platform/label/common/label.js";
import { ILoggerOptions, ILoggerResource, LogLevel } from "../../../platform/log/common/log.js";
import { IMarkerData } from "../../../platform/markers/common/markers.js";
import { IProgressOptions, IProgressStep } from "../../../platform/progress/common/progress.js";
import * as quickInput from "../../../platform/quickinput/common/quickInput.js";
import { IRemoteConnectionData, TunnelDescription } from "../../../platform/remote/common/remoteAuthorityResolver.js";
import { AuthInfo, Credentials } from "../../../platform/request/common/request.js";
import { ClassifiedEvent, IGDPRProperty, OmitMetadata, StrictPropertyCheck } from "../../../platform/telemetry/common/gdprTypings.js";
import { TelemetryLevel } from "../../../platform/telemetry/common/telemetry.js";
import { ISerializableEnvironmentDescriptionMap, ISerializableEnvironmentVariableCollection } from "../../../platform/terminal/common/environmentVariable.js";
import { ICreateContributedTerminalProfileOptions, IProcessProperty, IProcessReadyWindowsPty, IShellLaunchConfigDto, ITerminalEnvironment, ITerminalLaunchError, ITerminalProfile, TerminalExitReason, TerminalLocation, TerminalShellType } from "../../../platform/terminal/common/terminal.js";
import { ProvidedPortAttributes, TunnelCreationOptions, TunnelOptions, TunnelPrivacyId, TunnelProviderFeatures } from "../../../platform/tunnel/common/tunnel.js";
import { EditSessionIdentityMatch } from "../../../platform/workspace/common/editSessions.js";
import { WorkspaceTrustRequestOptions } from "../../../platform/workspace/common/workspaceTrust.js";
import { SaveReason } from "../../common/editor.js";
import { IRevealOptions, ITreeItem, IViewBadge } from "../../common/views.js";
import { CallHierarchyItem } from "../../contrib/callHierarchy/common/callHierarchy.js";
import { IChatAgentMetadata, IChatAgentRequest, IChatAgentResult } from "../../contrib/chat/common/chatAgents.js";
import { ICodeMapperRequest, ICodeMapperResult } from "../../contrib/chat/common/chatCodeMapperService.js";
import { IChatRelatedFile, IChatRelatedFileProviderMetadata as IChatRelatedFilesProviderMetadata, IChatRequestDraft } from "../../contrib/chat/common/chatEditingService.js";
import { IChatProgressHistoryResponseContent } from "../../contrib/chat/common/chatModel.js";
import { IChatContentInlineReference, IChatFollowup, IChatNotebookEdit, IChatProgress, IChatResponseErrorDetails, IChatTask, IChatTaskDto, IChatUserActionEvent, IChatVoteAction } from "../../contrib/chat/common/chatService.js";
import { IChatRequestVariableValue } from "../../contrib/chat/common/chatVariables.js";
import { ChatAgentLocation } from "../../contrib/chat/common/constants.js";
import { IChatMessage, IChatResponseFragment, ILanguageModelChatMetadata, ILanguageModelChatSelector, ILanguageModelsChangeEvent } from "../../contrib/chat/common/languageModels.js";
import { IPreparedToolInvocation, IToolData, IToolInvocation, IToolResult } from "../../contrib/chat/common/languageModelToolsService.js";
import { DebugConfigurationProviderTriggerKind, IAdapterDescriptor, IConfig, IDebugSessionReplMode, IDebugTestRunReference, IDebugVisualization, IDebugVisualizationContext, IDebugVisualizationTreeItem, MainThreadDebugVisualization } from "../../contrib/debug/common/debug.js";
import { McpCollectionDefinition, McpConnectionState, McpServerDefinition, McpServerLaunch } from "../../contrib/mcp/common/mcpTypes.js";
import * as notebookCommon from "../../contrib/notebook/common/notebookCommon.js";
import { CellExecutionUpdateType } from "../../contrib/notebook/common/notebookExecutionService.js";
import { ICellExecutionComplete, ICellExecutionStateUpdate } from "../../contrib/notebook/common/notebookExecutionStateService.js";
import { ICellRange } from "../../contrib/notebook/common/notebookRange.js";
import { InputValidationType } from "../../contrib/scm/common/scm.js";
import { IWorkspaceSymbol, NotebookPriorityInfo } from "../../contrib/search/common/search.js";
import { IRawClosedNotebookFileMatch } from "../../contrib/search/common/searchNotebookHelpers.js";
import { IKeywordRecognitionEvent, ISpeechProviderMetadata, ISpeechToTextEvent, ITextToSpeechEvent } from "../../contrib/speech/common/speechService.js";
import { CoverageDetails, ExtensionRunTestsRequest, ICallProfileRunHandler, IFileCoverage, ISerializedTestResults, IStartControllerTests, ITestItem, ITestMessage, ITestRunProfile, ITestRunTask, ResolvedTestRunRequest, TestControllerCapability, TestMessageFollowupRequest, TestMessageFollowupResponse, TestResultState, TestsDiffOp } from "../../contrib/testing/common/testTypes.js";
import { Timeline, TimelineChangeEvent, TimelineOptions, TimelineProviderDescriptor } from "../../contrib/timeline/common/timeline.js";
import { TypeHierarchyItem } from "../../contrib/typeHierarchy/common/typeHierarchy.js";
import { RelatedInformationResult, RelatedInformationType } from "../../services/aiRelatedInformation/common/aiRelatedInformation.js";
import { AuthenticationSession, AuthenticationSessionAccount, AuthenticationSessionsChangeEvent, IAuthenticationCreateSessionOptions, IAuthenticationProviderSessionOptions } from "../../services/authentication/common/authentication.js";
import { EditorGroupColumn } from "../../services/editor/common/editorGroupColumn.js";
import { IExtensionDescriptionDelta, IStaticWorkspaceData } from "../../services/extensions/common/extensionHostProtocol.js";
import { IResolveAuthorityResult } from "../../services/extensions/common/extensionHostProxy.js";
import { ActivationKind, ExtensionActivationReason, MissingExtensionDependency } from "../../services/extensions/common/extensions.js";
import { Dto, IRPCProtocol, SerializableObjectWithBuffers, createProxyIdentifier } from "../../services/extensions/common/proxyIdentifier.js";
import { ILanguageStatus } from "../../services/languageStatus/common/languageStatusService.js";
import { OutputChannelUpdateMode } from "../../services/output/common/output.js";
import { CandidatePort } from "../../services/remote/common/tunnelModel.js";
import { IFileQueryBuilderOptions, ITextQueryBuilderOptions } from "../../services/search/common/queryBuilder.js";
import * as search from "../../services/search/common/search.js";
import { TextSearchCompleteMessage } from "../../services/search/common/searchExtTypes.js";
import { ISaveProfileResult } from "../../services/userDataProfile/common/userDataProfile.js";
import { TerminalShellExecutionCommandLineConfidence } from "./extHostTypes.js";
import * as tasks from "./shared/tasks.js";
var TextEditorRevealType = /* @__PURE__ */ ((TextEditorRevealType2) => {
  TextEditorRevealType2[TextEditorRevealType2["Default"] = 0] = "Default";
  TextEditorRevealType2[TextEditorRevealType2["InCenter"] = 1] = "InCenter";
  TextEditorRevealType2[TextEditorRevealType2["InCenterIfOutsideViewport"] = 2] = "InCenterIfOutsideViewport";
  TextEditorRevealType2[TextEditorRevealType2["AtTop"] = 3] = "AtTop";
  return TextEditorRevealType2;
})(TextEditorRevealType || {});
var TabInputKind = /* @__PURE__ */ ((TabInputKind2) => {
  TabInputKind2[TabInputKind2["UnknownInput"] = 0] = "UnknownInput";
  TabInputKind2[TabInputKind2["TextInput"] = 1] = "TextInput";
  TabInputKind2[TabInputKind2["TextDiffInput"] = 2] = "TextDiffInput";
  TabInputKind2[TabInputKind2["TextMergeInput"] = 3] = "TextMergeInput";
  TabInputKind2[TabInputKind2["NotebookInput"] = 4] = "NotebookInput";
  TabInputKind2[TabInputKind2["NotebookDiffInput"] = 5] = "NotebookDiffInput";
  TabInputKind2[TabInputKind2["CustomEditorInput"] = 6] = "CustomEditorInput";
  TabInputKind2[TabInputKind2["WebviewEditorInput"] = 7] = "WebviewEditorInput";
  TabInputKind2[TabInputKind2["TerminalEditorInput"] = 8] = "TerminalEditorInput";
  TabInputKind2[TabInputKind2["InteractiveEditorInput"] = 9] = "InteractiveEditorInput";
  TabInputKind2[TabInputKind2["ChatEditorInput"] = 10] = "ChatEditorInput";
  TabInputKind2[TabInputKind2["MultiDiffEditorInput"] = 11] = "MultiDiffEditorInput";
  return TabInputKind2;
})(TabInputKind || {});
var TabModelOperationKind = /* @__PURE__ */ ((TabModelOperationKind2) => {
  TabModelOperationKind2[TabModelOperationKind2["TAB_OPEN"] = 0] = "TAB_OPEN";
  TabModelOperationKind2[TabModelOperationKind2["TAB_CLOSE"] = 1] = "TAB_CLOSE";
  TabModelOperationKind2[TabModelOperationKind2["TAB_UPDATE"] = 2] = "TAB_UPDATE";
  TabModelOperationKind2[TabModelOperationKind2["TAB_MOVE"] = 3] = "TAB_MOVE";
  return TabModelOperationKind2;
})(TabModelOperationKind || {});
var WebviewEditorCapabilities = /* @__PURE__ */ ((WebviewEditorCapabilities2) => {
  WebviewEditorCapabilities2[WebviewEditorCapabilities2["Editable"] = 0] = "Editable";
  WebviewEditorCapabilities2[WebviewEditorCapabilities2["SupportsHotExit"] = 1] = "SupportsHotExit";
  return WebviewEditorCapabilities2;
})(WebviewEditorCapabilities || {});
var WebviewMessageArrayBufferViewType = /* @__PURE__ */ ((WebviewMessageArrayBufferViewType2) => {
  WebviewMessageArrayBufferViewType2[WebviewMessageArrayBufferViewType2["Int8Array"] = 1] = "Int8Array";
  WebviewMessageArrayBufferViewType2[WebviewMessageArrayBufferViewType2["Uint8Array"] = 2] = "Uint8Array";
  WebviewMessageArrayBufferViewType2[WebviewMessageArrayBufferViewType2["Uint8ClampedArray"] = 3] = "Uint8ClampedArray";
  WebviewMessageArrayBufferViewType2[WebviewMessageArrayBufferViewType2["Int16Array"] = 4] = "Int16Array";
  WebviewMessageArrayBufferViewType2[WebviewMessageArrayBufferViewType2["Uint16Array"] = 5] = "Uint16Array";
  WebviewMessageArrayBufferViewType2[WebviewMessageArrayBufferViewType2["Int32Array"] = 6] = "Int32Array";
  WebviewMessageArrayBufferViewType2[WebviewMessageArrayBufferViewType2["Uint32Array"] = 7] = "Uint32Array";
  WebviewMessageArrayBufferViewType2[WebviewMessageArrayBufferViewType2["Float32Array"] = 8] = "Float32Array";
  WebviewMessageArrayBufferViewType2[WebviewMessageArrayBufferViewType2["Float64Array"] = 9] = "Float64Array";
  WebviewMessageArrayBufferViewType2[WebviewMessageArrayBufferViewType2["BigInt64Array"] = 10] = "BigInt64Array";
  WebviewMessageArrayBufferViewType2[WebviewMessageArrayBufferViewType2["BigUint64Array"] = 11] = "BigUint64Array";
  return WebviewMessageArrayBufferViewType2;
})(WebviewMessageArrayBufferViewType || {});
var CellOutputKind = /* @__PURE__ */ ((CellOutputKind2) => {
  CellOutputKind2[CellOutputKind2["Text"] = 1] = "Text";
  CellOutputKind2[CellOutputKind2["Error"] = 2] = "Error";
  CellOutputKind2[CellOutputKind2["Rich"] = 3] = "Rich";
  return CellOutputKind2;
})(CellOutputKind || {});
var NotebookEditorRevealType = /* @__PURE__ */ ((NotebookEditorRevealType2) => {
  NotebookEditorRevealType2[NotebookEditorRevealType2["Default"] = 0] = "Default";
  NotebookEditorRevealType2[NotebookEditorRevealType2["InCenter"] = 1] = "InCenter";
  NotebookEditorRevealType2[NotebookEditorRevealType2["InCenterIfOutsideViewport"] = 2] = "InCenterIfOutsideViewport";
  NotebookEditorRevealType2[NotebookEditorRevealType2["AtTop"] = 3] = "AtTop";
  return NotebookEditorRevealType2;
})(NotebookEditorRevealType || {});
var CandidatePortSource = /* @__PURE__ */ ((CandidatePortSource2) => {
  CandidatePortSource2[CandidatePortSource2["None"] = 0] = "None";
  CandidatePortSource2[CandidatePortSource2["Process"] = 1] = "Process";
  CandidatePortSource2[CandidatePortSource2["Output"] = 2] = "Output";
  CandidatePortSource2[CandidatePortSource2["Hybrid"] = 3] = "Hybrid";
  return CandidatePortSource2;
})(CandidatePortSource || {});
class IdObject {
  static {
    __name(this, "IdObject");
  }
  _id;
  static _n = 0;
  static mixin(object) {
    object._id = IdObject._n++;
    return object;
  }
}
var ISuggestDataDtoField = /* @__PURE__ */ ((ISuggestDataDtoField2) => {
  ISuggestDataDtoField2["label"] = "a";
  ISuggestDataDtoField2["kind"] = "b";
  ISuggestDataDtoField2["detail"] = "c";
  ISuggestDataDtoField2["documentation"] = "d";
  ISuggestDataDtoField2["sortText"] = "e";
  ISuggestDataDtoField2["filterText"] = "f";
  ISuggestDataDtoField2["preselect"] = "g";
  ISuggestDataDtoField2["insertText"] = "h";
  ISuggestDataDtoField2["insertTextRules"] = "i";
  ISuggestDataDtoField2["range"] = "j";
  ISuggestDataDtoField2["commitCharacters"] = "k";
  ISuggestDataDtoField2["additionalTextEdits"] = "l";
  ISuggestDataDtoField2["kindModifier"] = "m";
  ISuggestDataDtoField2["commandIdent"] = "n";
  ISuggestDataDtoField2["commandId"] = "o";
  ISuggestDataDtoField2["commandArguments"] = "p";
  return ISuggestDataDtoField2;
})(ISuggestDataDtoField || {});
var ISuggestResultDtoField = /* @__PURE__ */ ((ISuggestResultDtoField2) => {
  ISuggestResultDtoField2["defaultRanges"] = "a";
  ISuggestResultDtoField2["completions"] = "b";
  ISuggestResultDtoField2["isIncomplete"] = "c";
  ISuggestResultDtoField2["duration"] = "d";
  return ISuggestResultDtoField2;
})(ISuggestResultDtoField || {});
class TerminalCompletionListDto {
  static {
    __name(this, "TerminalCompletionListDto");
  }
  /**
   * Resources should be shown in the completions list
   */
  resourceRequestConfig;
  /**
   * The completion items.
   */
  items;
  /**
   * Creates a new completion list.
   *
   * @param items The completion items.
   * @param isIncomplete The list is not complete.
   */
  constructor(items, resourceRequestConfig) {
    this.items = items ?? [];
    this.resourceRequestConfig = resourceRequestConfig;
  }
}
var ExtHostTestingResource = /* @__PURE__ */ ((ExtHostTestingResource2) => {
  ExtHostTestingResource2[ExtHostTestingResource2["Workspace"] = 0] = "Workspace";
  ExtHostTestingResource2[ExtHostTestingResource2["TextDocument"] = 1] = "TextDocument";
  return ExtHostTestingResource2;
})(ExtHostTestingResource || {});
const MainContext = {
  MainThreadAuthentication: createProxyIdentifier("MainThreadAuthentication"),
  MainThreadBulkEdits: createProxyIdentifier("MainThreadBulkEdits"),
  MainThreadLanguageModels: createProxyIdentifier("MainThreadLanguageModels"),
  MainThreadEmbeddings: createProxyIdentifier("MainThreadEmbeddings"),
  MainThreadChatAgents2: createProxyIdentifier("MainThreadChatAgents2"),
  MainThreadCodeMapper: createProxyIdentifier("MainThreadCodeMapper"),
  MainThreadLanguageModelTools: createProxyIdentifier("MainThreadChatSkills"),
  MainThreadClipboard: createProxyIdentifier("MainThreadClipboard"),
  MainThreadCommands: createProxyIdentifier("MainThreadCommands"),
  MainThreadComments: createProxyIdentifier("MainThreadComments"),
  MainThreadConfiguration: createProxyIdentifier("MainThreadConfiguration"),
  MainThreadConsole: createProxyIdentifier("MainThreadConsole"),
  MainThreadDebugService: createProxyIdentifier("MainThreadDebugService"),
  MainThreadDecorations: createProxyIdentifier("MainThreadDecorations"),
  MainThreadDiagnostics: createProxyIdentifier("MainThreadDiagnostics"),
  MainThreadDialogs: createProxyIdentifier("MainThreadDiaglogs"),
  MainThreadDocuments: createProxyIdentifier("MainThreadDocuments"),
  MainThreadDocumentContentProviders: createProxyIdentifier("MainThreadDocumentContentProviders"),
  MainThreadTextEditors: createProxyIdentifier("MainThreadTextEditors"),
  MainThreadEditorInsets: createProxyIdentifier("MainThreadEditorInsets"),
  MainThreadEditorTabs: createProxyIdentifier("MainThreadEditorTabs"),
  MainThreadErrors: createProxyIdentifier("MainThreadErrors"),
  MainThreadTreeViews: createProxyIdentifier("MainThreadTreeViews"),
  MainThreadDownloadService: createProxyIdentifier("MainThreadDownloadService"),
  MainThreadLanguageFeatures: createProxyIdentifier("MainThreadLanguageFeatures"),
  MainThreadLanguages: createProxyIdentifier("MainThreadLanguages"),
  MainThreadLogger: createProxyIdentifier("MainThreadLogger"),
  MainThreadMessageService: createProxyIdentifier("MainThreadMessageService"),
  MainThreadOutputService: createProxyIdentifier("MainThreadOutputService"),
  MainThreadProgress: createProxyIdentifier("MainThreadProgress"),
  MainThreadQuickDiff: createProxyIdentifier("MainThreadQuickDiff"),
  MainThreadQuickOpen: createProxyIdentifier("MainThreadQuickOpen"),
  MainThreadStatusBar: createProxyIdentifier("MainThreadStatusBar"),
  MainThreadSecretState: createProxyIdentifier("MainThreadSecretState"),
  MainThreadStorage: createProxyIdentifier("MainThreadStorage"),
  MainThreadSpeech: createProxyIdentifier("MainThreadSpeechProvider"),
  MainThreadTelemetry: createProxyIdentifier("MainThreadTelemetry"),
  MainThreadTerminalService: createProxyIdentifier("MainThreadTerminalService"),
  MainThreadTerminalShellIntegration: createProxyIdentifier("MainThreadTerminalShellIntegration"),
  MainThreadWebviews: createProxyIdentifier("MainThreadWebviews"),
  MainThreadWebviewPanels: createProxyIdentifier("MainThreadWebviewPanels"),
  MainThreadWebviewViews: createProxyIdentifier("MainThreadWebviewViews"),
  MainThreadCustomEditors: createProxyIdentifier("MainThreadCustomEditors"),
  MainThreadUrls: createProxyIdentifier("MainThreadUrls"),
  MainThreadUriOpeners: createProxyIdentifier("MainThreadUriOpeners"),
  MainThreadProfileContentHandlers: createProxyIdentifier("MainThreadProfileContentHandlers"),
  MainThreadWorkspace: createProxyIdentifier("MainThreadWorkspace"),
  MainThreadFileSystem: createProxyIdentifier("MainThreadFileSystem"),
  MainThreadFileSystemEventService: createProxyIdentifier("MainThreadFileSystemEventService"),
  MainThreadExtensionService: createProxyIdentifier("MainThreadExtensionService"),
  MainThreadSCM: createProxyIdentifier("MainThreadSCM"),
  MainThreadSearch: createProxyIdentifier("MainThreadSearch"),
  MainThreadShare: createProxyIdentifier("MainThreadShare"),
  MainThreadTask: createProxyIdentifier("MainThreadTask"),
  MainThreadWindow: createProxyIdentifier("MainThreadWindow"),
  MainThreadLabelService: createProxyIdentifier("MainThreadLabelService"),
  MainThreadNotebook: createProxyIdentifier("MainThreadNotebook"),
  MainThreadNotebookDocuments: createProxyIdentifier("MainThreadNotebookDocumentsShape"),
  MainThreadNotebookEditors: createProxyIdentifier("MainThreadNotebookEditorsShape"),
  MainThreadNotebookKernels: createProxyIdentifier("MainThreadNotebookKernels"),
  MainThreadNotebookRenderers: createProxyIdentifier("MainThreadNotebookRenderers"),
  MainThreadInteractive: createProxyIdentifier("MainThreadInteractive"),
  MainThreadTheming: createProxyIdentifier("MainThreadTheming"),
  MainThreadTunnelService: createProxyIdentifier("MainThreadTunnelService"),
  MainThreadManagedSockets: createProxyIdentifier("MainThreadManagedSockets"),
  MainThreadTimeline: createProxyIdentifier("MainThreadTimeline"),
  MainThreadTesting: createProxyIdentifier("MainThreadTesting"),
  MainThreadLocalization: createProxyIdentifier("MainThreadLocalizationShape"),
  MainThreadMcp: createProxyIdentifier("MainThreadMcpShape"),
  MainThreadAiRelatedInformation: createProxyIdentifier("MainThreadAiRelatedInformation"),
  MainThreadAiEmbeddingVector: createProxyIdentifier("MainThreadAiEmbeddingVector"),
  MainThreadChatStatus: createProxyIdentifier("MainThreadChatStatus")
};
const ExtHostContext = {
  ExtHostCodeMapper: createProxyIdentifier("ExtHostCodeMapper"),
  ExtHostCommands: createProxyIdentifier("ExtHostCommands"),
  ExtHostConfiguration: createProxyIdentifier("ExtHostConfiguration"),
  ExtHostDiagnostics: createProxyIdentifier("ExtHostDiagnostics"),
  ExtHostDebugService: createProxyIdentifier("ExtHostDebugService"),
  ExtHostDecorations: createProxyIdentifier("ExtHostDecorations"),
  ExtHostDocumentsAndEditors: createProxyIdentifier("ExtHostDocumentsAndEditors"),
  ExtHostDocuments: createProxyIdentifier("ExtHostDocuments"),
  ExtHostDocumentContentProviders: createProxyIdentifier("ExtHostDocumentContentProviders"),
  ExtHostDocumentSaveParticipant: createProxyIdentifier("ExtHostDocumentSaveParticipant"),
  ExtHostEditors: createProxyIdentifier("ExtHostEditors"),
  ExtHostTreeViews: createProxyIdentifier("ExtHostTreeViews"),
  ExtHostFileSystem: createProxyIdentifier("ExtHostFileSystem"),
  ExtHostFileSystemInfo: createProxyIdentifier("ExtHostFileSystemInfo"),
  ExtHostFileSystemEventService: createProxyIdentifier("ExtHostFileSystemEventService"),
  ExtHostLanguages: createProxyIdentifier("ExtHostLanguages"),
  ExtHostLanguageFeatures: createProxyIdentifier("ExtHostLanguageFeatures"),
  ExtHostQuickOpen: createProxyIdentifier("ExtHostQuickOpen"),
  ExtHostQuickDiff: createProxyIdentifier("ExtHostQuickDiff"),
  ExtHostStatusBar: createProxyIdentifier("ExtHostStatusBar"),
  ExtHostShare: createProxyIdentifier("ExtHostShare"),
  ExtHostExtensionService: createProxyIdentifier("ExtHostExtensionService"),
  ExtHostLogLevelServiceShape: createProxyIdentifier("ExtHostLogLevelServiceShape"),
  ExtHostTerminalService: createProxyIdentifier("ExtHostTerminalService"),
  ExtHostTerminalShellIntegration: createProxyIdentifier("ExtHostTerminalShellIntegration"),
  ExtHostSCM: createProxyIdentifier("ExtHostSCM"),
  ExtHostSearch: createProxyIdentifier("ExtHostSearch"),
  ExtHostTask: createProxyIdentifier("ExtHostTask"),
  ExtHostWorkspace: createProxyIdentifier("ExtHostWorkspace"),
  ExtHostWindow: createProxyIdentifier("ExtHostWindow"),
  ExtHostWebviews: createProxyIdentifier("ExtHostWebviews"),
  ExtHostWebviewPanels: createProxyIdentifier("ExtHostWebviewPanels"),
  ExtHostCustomEditors: createProxyIdentifier("ExtHostCustomEditors"),
  ExtHostWebviewViews: createProxyIdentifier("ExtHostWebviewViews"),
  ExtHostEditorInsets: createProxyIdentifier("ExtHostEditorInsets"),
  ExtHostEditorTabs: createProxyIdentifier("ExtHostEditorTabs"),
  ExtHostProgress: createProxyIdentifier("ExtHostProgress"),
  ExtHostComments: createProxyIdentifier("ExtHostComments"),
  ExtHostSecretState: createProxyIdentifier("ExtHostSecretState"),
  ExtHostStorage: createProxyIdentifier("ExtHostStorage"),
  ExtHostUrls: createProxyIdentifier("ExtHostUrls"),
  ExtHostUriOpeners: createProxyIdentifier("ExtHostUriOpeners"),
  ExtHostProfileContentHandlers: createProxyIdentifier("ExtHostProfileContentHandlers"),
  ExtHostOutputService: createProxyIdentifier("ExtHostOutputService"),
  ExtHostLabelService: createProxyIdentifier("ExtHostLabelService"),
  ExtHostNotebook: createProxyIdentifier("ExtHostNotebook"),
  ExtHostNotebookDocuments: createProxyIdentifier("ExtHostNotebookDocuments"),
  ExtHostNotebookEditors: createProxyIdentifier("ExtHostNotebookEditors"),
  ExtHostNotebookKernels: createProxyIdentifier("ExtHostNotebookKernels"),
  ExtHostNotebookRenderers: createProxyIdentifier("ExtHostNotebookRenderers"),
  ExtHostNotebookDocumentSaveParticipant: createProxyIdentifier("ExtHostNotebookDocumentSaveParticipant"),
  ExtHostInteractive: createProxyIdentifier("ExtHostInteractive"),
  ExtHostChatAgents2: createProxyIdentifier("ExtHostChatAgents"),
  ExtHostLanguageModelTools: createProxyIdentifier("ExtHostChatSkills"),
  ExtHostChatProvider: createProxyIdentifier("ExtHostChatProvider"),
  ExtHostSpeech: createProxyIdentifier("ExtHostSpeech"),
  ExtHostEmbeddings: createProxyIdentifier("ExtHostEmbeddings"),
  ExtHostAiRelatedInformation: createProxyIdentifier("ExtHostAiRelatedInformation"),
  ExtHostAiEmbeddingVector: createProxyIdentifier("ExtHostAiEmbeddingVector"),
  ExtHostTheming: createProxyIdentifier("ExtHostTheming"),
  ExtHostTunnelService: createProxyIdentifier("ExtHostTunnelService"),
  ExtHostManagedSockets: createProxyIdentifier("ExtHostManagedSockets"),
  ExtHostAuthentication: createProxyIdentifier("ExtHostAuthentication"),
  ExtHostTimeline: createProxyIdentifier("ExtHostTimeline"),
  ExtHostTesting: createProxyIdentifier("ExtHostTesting"),
  ExtHostTelemetry: createProxyIdentifier("ExtHostTelemetry"),
  ExtHostLocalization: createProxyIdentifier("ExtHostLocalization"),
  ExtHostMcp: createProxyIdentifier("ExtHostMcp")
};
export {
  CandidatePortSource,
  CellOutputKind,
  ExtHostContext,
  ExtHostTestingResource,
  ISuggestDataDtoField,
  ISuggestResultDtoField,
  IdObject,
  MainContext,
  NotebookEditorRevealType,
  TabInputKind,
  TabModelOperationKind,
  TerminalCompletionListDto,
  TextEditorRevealType,
  WebviewEditorCapabilities,
  WebviewMessageArrayBufferViewType
};
//# sourceMappingURL=extHost.protocol.js.map
