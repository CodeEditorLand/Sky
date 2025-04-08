var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import "./standaloneCodeEditorService.js";
import "./standaloneLayoutService.js";
import "../../../platform/undoRedo/common/undoRedoService.js";
import "../../common/services/languageFeatureDebounce.js";
import "../../common/services/semanticTokensStylingService.js";
import "../../common/services/languageFeaturesService.js";
import "../../browser/services/hoverService/hoverService.js";
import * as strings from "../../../base/common/strings.js";
import * as dom from "../../../base/browser/dom.js";
import { StandardKeyboardEvent } from "../../../base/browser/keyboardEvent.js";
import { Emitter, Event, IValueWithChangeEvent, ValueWithChangeEvent } from "../../../base/common/event.js";
import { ResolvedKeybinding, KeyCodeChord, Keybinding, decodeKeybinding } from "../../../base/common/keybindings.js";
import { IDisposable, IReference, ImmortalReference, toDisposable, DisposableStore, Disposable, combinedDisposable } from "../../../base/common/lifecycle.js";
import { OS, isLinux, isMacintosh } from "../../../base/common/platform.js";
import Severity from "../../../base/common/severity.js";
import { URI } from "../../../base/common/uri.js";
import { IBulkEditOptions, IBulkEditResult, IBulkEditService, ResourceEdit, ResourceTextEdit } from "../../browser/services/bulkEditService.js";
import { isDiffEditorConfigurationKey, isEditorConfigurationKey } from "../../common/config/editorConfigurationSchema.js";
import { EditOperation, ISingleEditOperation } from "../../common/core/editOperation.js";
import { IPosition, Position as Pos } from "../../common/core/position.js";
import { Range } from "../../common/core/range.js";
import { ITextModel, ITextSnapshot } from "../../common/model.js";
import { IModelService } from "../../common/services/model.js";
import { IResolvedTextEditorModel, ITextModelContentProvider, ITextModelService } from "../../common/services/resolverService.js";
import { ITextResourceConfigurationService, ITextResourcePropertiesService, ITextResourceConfigurationChangeEvent } from "../../common/services/textResourceConfiguration.js";
import { CommandsRegistry, ICommandEvent, ICommandHandler, ICommandService } from "../../../platform/commands/common/commands.js";
import { IConfigurationChangeEvent, IConfigurationData, IConfigurationOverrides, IConfigurationService, IConfigurationModel, IConfigurationValue, ConfigurationTarget } from "../../../platform/configuration/common/configuration.js";
import { Configuration, ConfigurationModel, ConfigurationChangeEvent } from "../../../platform/configuration/common/configurationModels.js";
import { IContextKeyService, ContextKeyExpression } from "../../../platform/contextkey/common/contextkey.js";
import { IConfirmation, IConfirmationResult, IDialogService, IInputResult, IPrompt, IPromptResult, IPromptWithCustomCancel, IPromptResultWithCancel, IPromptWithDefaultCancel, IPromptBaseButton } from "../../../platform/dialogs/common/dialogs.js";
import { createDecorator, IInstantiationService, ServiceIdentifier } from "../../../platform/instantiation/common/instantiation.js";
import { AbstractKeybindingService } from "../../../platform/keybinding/common/abstractKeybindingService.js";
import { IKeybindingService, IKeyboardEvent, KeybindingsSchemaContribution } from "../../../platform/keybinding/common/keybinding.js";
import { KeybindingResolver } from "../../../platform/keybinding/common/keybindingResolver.js";
import { IKeybindingItem, KeybindingsRegistry } from "../../../platform/keybinding/common/keybindingsRegistry.js";
import { ResolvedKeybindingItem } from "../../../platform/keybinding/common/resolvedKeybindingItem.js";
import { USLayoutResolvedKeybinding } from "../../../platform/keybinding/common/usLayoutResolvedKeybinding.js";
import { ILabelService, ResourceLabelFormatter, IFormatterChangeEvent, Verbosity } from "../../../platform/label/common/label.js";
import { INotification, INotificationHandle, INotificationService, IPromptChoice, IPromptOptions, NoOpNotification, IStatusMessageOptions, INotificationSource, INotificationSourceFilter, NotificationsFilter } from "../../../platform/notification/common/notification.js";
import { IProgressRunner, IEditorProgressService, IProgressService, IProgress, IProgressCompositeOptions, IProgressDialogOptions, IProgressNotificationOptions, IProgressOptions, IProgressStep, IProgressWindowOptions } from "../../../platform/progress/common/progress.js";
import { ITelemetryService, TelemetryLevel } from "../../../platform/telemetry/common/telemetry.js";
import { ISingleFolderWorkspaceIdentifier, IWorkspaceIdentifier, IWorkspace, IWorkspaceContextService, IWorkspaceFolder, IWorkspaceFoldersChangeEvent, IWorkspaceFoldersWillChangeEvent, WorkbenchState, WorkspaceFolder, STANDALONE_EDITOR_WORKSPACE_ID } from "../../../platform/workspace/common/workspace.js";
import { ILayoutService } from "../../../platform/layout/browser/layoutService.js";
import { StandaloneServicesNLS } from "../../common/standaloneStrings.js";
import { basename } from "../../../base/common/resources.js";
import { ICodeEditorService } from "../../browser/services/codeEditorService.js";
import { ConsoleLogger, ILogService } from "../../../platform/log/common/log.js";
import { IWorkspaceTrustManagementService, IWorkspaceTrustTransitionParticipant, IWorkspaceTrustUriInfo } from "../../../platform/workspace/common/workspaceTrust.js";
import { EditorOption } from "../../common/config/editorOptions.js";
import { ICodeEditor, IDiffEditor } from "../../browser/editorBrowser.js";
import { IContextMenuService, IContextViewDelegate, IContextViewService, IOpenContextView } from "../../../platform/contextview/browser/contextView.js";
import { ContextViewService } from "../../../platform/contextview/browser/contextViewService.js";
import { LanguageService } from "../../common/services/languageService.js";
import { ContextMenuService } from "../../../platform/contextview/browser/contextMenuService.js";
import { getSingletonServiceDescriptors, InstantiationType, registerSingleton } from "../../../platform/instantiation/common/extensions.js";
import { OpenerService } from "../../browser/services/openerService.js";
import { IEditorWorkerService } from "../../common/services/editorWorker.js";
import { EditorWorkerService } from "../../browser/services/editorWorkerService.js";
import { ILanguageService } from "../../common/languages/language.js";
import { MarkerDecorationsService } from "../../common/services/markerDecorationsService.js";
import { IMarkerDecorationsService } from "../../common/services/markerDecorations.js";
import { ModelService } from "../../common/services/modelService.js";
import { StandaloneQuickInputService } from "./quickInput/standaloneQuickInputService.js";
import { StandaloneThemeService } from "./standaloneThemeService.js";
import { IStandaloneThemeService } from "../common/standaloneTheme.js";
import { AccessibilityService } from "../../../platform/accessibility/browser/accessibilityService.js";
import { IAccessibilityService } from "../../../platform/accessibility/common/accessibility.js";
import { IMenuService } from "../../../platform/actions/common/actions.js";
import { MenuService } from "../../../platform/actions/common/menuService.js";
import { BrowserClipboardService } from "../../../platform/clipboard/browser/clipboardService.js";
import { IClipboardService } from "../../../platform/clipboard/common/clipboardService.js";
import { ContextKeyService } from "../../../platform/contextkey/browser/contextKeyService.js";
import { SyncDescriptor } from "../../../platform/instantiation/common/descriptors.js";
import { InstantiationService } from "../../../platform/instantiation/common/instantiationService.js";
import { ServiceCollection } from "../../../platform/instantiation/common/serviceCollection.js";
import { IListService, ListService } from "../../../platform/list/browser/listService.js";
import { IMarkerService } from "../../../platform/markers/common/markers.js";
import { MarkerService } from "../../../platform/markers/common/markerService.js";
import { IOpenerService } from "../../../platform/opener/common/opener.js";
import { IQuickInputService } from "../../../platform/quickinput/common/quickInput.js";
import { IStorageService, InMemoryStorageService } from "../../../platform/storage/common/storage.js";
import { DefaultConfiguration } from "../../../platform/configuration/common/configurations.js";
import { WorkspaceEdit } from "../../common/languages.js";
import { AccessibilitySignal, AccessibilityModality, IAccessibilitySignalService, Sound } from "../../../platform/accessibilitySignal/browser/accessibilitySignalService.js";
import { ILanguageFeaturesService } from "../../common/services/languageFeatures.js";
import { ILanguageConfigurationService } from "../../common/languages/languageConfigurationRegistry.js";
import { LogService } from "../../../platform/log/common/logService.js";
import { getEditorFeatures } from "../../common/editorFeatures.js";
import { onUnexpectedError } from "../../../base/common/errors.js";
import { ExtensionKind, IEnvironmentService, IExtensionHostDebugParams } from "../../../platform/environment/common/environment.js";
import { mainWindow } from "../../../base/browser/window.js";
import { ResourceMap } from "../../../base/common/map.js";
import { ITreeSitterParserService } from "../../common/services/treeSitterParserService.js";
import { StandaloneTreeSitterParserService } from "./standaloneTreeSitterService.js";
import { IWebWorkerDescriptor } from "../../../base/browser/webWorkerFactory.js";
class SimpleModel {
  static {
    __name(this, "SimpleModel");
  }
  model;
  _onWillDispose;
  constructor(model) {
    this.model = model;
    this._onWillDispose = new Emitter();
  }
  get onWillDispose() {
    return this._onWillDispose.event;
  }
  resolve() {
    return Promise.resolve();
  }
  get textEditorModel() {
    return this.model;
  }
  createSnapshot() {
    return this.model.createSnapshot();
  }
  isReadonly() {
    return false;
  }
  disposed = false;
  dispose() {
    this.disposed = true;
    this._onWillDispose.fire();
  }
  isDisposed() {
    return this.disposed;
  }
  isResolved() {
    return true;
  }
  getLanguageId() {
    return this.model.getLanguageId();
  }
}
let StandaloneTextModelService = class {
  constructor(modelService) {
    this.modelService = modelService;
  }
  static {
    __name(this, "StandaloneTextModelService");
  }
  _serviceBrand;
  createModelReference(resource) {
    const model = this.modelService.getModel(resource);
    if (!model) {
      return Promise.reject(new Error(`Model not found`));
    }
    return Promise.resolve(new ImmortalReference(new SimpleModel(model)));
  }
  registerTextModelContentProvider(scheme, provider) {
    return {
      dispose: /* @__PURE__ */ __name(function() {
      }, "dispose")
    };
  }
  canHandleResource(resource) {
    return false;
  }
};
StandaloneTextModelService = __decorateClass([
  __decorateParam(0, IModelService)
], StandaloneTextModelService);
class StandaloneEditorProgressService {
  static {
    __name(this, "StandaloneEditorProgressService");
  }
  static NULL_PROGRESS_RUNNER = {
    done: /* @__PURE__ */ __name(() => {
    }, "done"),
    total: /* @__PURE__ */ __name(() => {
    }, "total"),
    worked: /* @__PURE__ */ __name(() => {
    }, "worked")
  };
  show() {
    return StandaloneEditorProgressService.NULL_PROGRESS_RUNNER;
  }
  async showWhile(promise, delay) {
    await promise;
  }
}
class StandaloneProgressService {
  static {
    __name(this, "StandaloneProgressService");
  }
  withProgress(_options, task, onDidCancel) {
    return task({
      report: /* @__PURE__ */ __name(() => {
      }, "report")
    });
  }
}
class StandaloneEnvironmentService {
  static {
    __name(this, "StandaloneEnvironmentService");
  }
  stateResource = URI.from({ scheme: "monaco", authority: "stateResource" });
  userRoamingDataHome = URI.from({ scheme: "monaco", authority: "userRoamingDataHome" });
  keyboardLayoutResource = URI.from({ scheme: "monaco", authority: "keyboardLayoutResource" });
  argvResource = URI.from({ scheme: "monaco", authority: "argvResource" });
  untitledWorkspacesHome = URI.from({ scheme: "monaco", authority: "untitledWorkspacesHome" });
  workspaceStorageHome = URI.from({ scheme: "monaco", authority: "workspaceStorageHome" });
  localHistoryHome = URI.from({ scheme: "monaco", authority: "localHistoryHome" });
  cacheHome = URI.from({ scheme: "monaco", authority: "cacheHome" });
  userDataSyncHome = URI.from({ scheme: "monaco", authority: "userDataSyncHome" });
  sync = void 0;
  continueOn = void 0;
  editSessionId = void 0;
  debugExtensionHost = { port: null, break: false };
  isExtensionDevelopment = false;
  disableExtensions = false;
  enableExtensions = void 0;
  extensionDevelopmentLocationURI = void 0;
  extensionDevelopmentKind = void 0;
  extensionTestsLocationURI = void 0;
  logsHome = URI.from({ scheme: "monaco", authority: "logsHome" });
  logLevel = void 0;
  extensionLogLevel = void 0;
  verbose = false;
  isBuilt = false;
  disableTelemetry = false;
  serviceMachineIdResource = URI.from({ scheme: "monaco", authority: "serviceMachineIdResource" });
  policyFile = void 0;
}
class StandaloneDialogService {
  static {
    __name(this, "StandaloneDialogService");
  }
  _serviceBrand;
  onWillShowDialog = Event.None;
  onDidShowDialog = Event.None;
  async confirm(confirmation) {
    const confirmed = this.doConfirm(confirmation.message, confirmation.detail);
    return {
      confirmed,
      checkboxChecked: false
      // unsupported
    };
  }
  doConfirm(message, detail) {
    let messageText = message;
    if (detail) {
      messageText = messageText + "\n\n" + detail;
    }
    return mainWindow.confirm(messageText);
  }
  async prompt(prompt) {
    let result = void 0;
    const confirmed = this.doConfirm(prompt.message, prompt.detail);
    if (confirmed) {
      const promptButtons = [...prompt.buttons ?? []];
      if (prompt.cancelButton && typeof prompt.cancelButton !== "string" && typeof prompt.cancelButton !== "boolean") {
        promptButtons.push(prompt.cancelButton);
      }
      result = await promptButtons[0]?.run({ checkboxChecked: false });
    }
    return { result };
  }
  async info(message, detail) {
    await this.prompt({ type: Severity.Info, message, detail });
  }
  async warn(message, detail) {
    await this.prompt({ type: Severity.Warning, message, detail });
  }
  async error(message, detail) {
    await this.prompt({ type: Severity.Error, message, detail });
  }
  input() {
    return Promise.resolve({ confirmed: false });
  }
  about() {
    return Promise.resolve(void 0);
  }
}
class StandaloneNotificationService {
  static {
    __name(this, "StandaloneNotificationService");
  }
  onDidAddNotification = Event.None;
  onDidRemoveNotification = Event.None;
  onDidChangeFilter = Event.None;
  _serviceBrand;
  static NO_OP = new NoOpNotification();
  info(message) {
    return this.notify({ severity: Severity.Info, message });
  }
  warn(message) {
    return this.notify({ severity: Severity.Warning, message });
  }
  error(error) {
    return this.notify({ severity: Severity.Error, message: error });
  }
  notify(notification) {
    switch (notification.severity) {
      case Severity.Error:
        console.error(notification.message);
        break;
      case Severity.Warning:
        console.warn(notification.message);
        break;
      default:
        console.log(notification.message);
        break;
    }
    return StandaloneNotificationService.NO_OP;
  }
  prompt(severity, message, choices, options) {
    return StandaloneNotificationService.NO_OP;
  }
  status(message, options) {
    return Disposable.None;
  }
  setFilter(filter) {
  }
  getFilter(source) {
    return NotificationsFilter.OFF;
  }
  getFilters() {
    return [];
  }
  removeFilter(sourceId) {
  }
}
let StandaloneCommandService = class {
  static {
    __name(this, "StandaloneCommandService");
  }
  _instantiationService;
  _onWillExecuteCommand = new Emitter();
  _onDidExecuteCommand = new Emitter();
  onWillExecuteCommand = this._onWillExecuteCommand.event;
  onDidExecuteCommand = this._onDidExecuteCommand.event;
  constructor(instantiationService) {
    this._instantiationService = instantiationService;
  }
  executeCommand(id, ...args) {
    const command = CommandsRegistry.getCommand(id);
    if (!command) {
      return Promise.reject(new Error(`command '${id}' not found`));
    }
    try {
      this._onWillExecuteCommand.fire({ commandId: id, args });
      const result = this._instantiationService.invokeFunction.apply(this._instantiationService, [command.handler, ...args]);
      this._onDidExecuteCommand.fire({ commandId: id, args });
      return Promise.resolve(result);
    } catch (err) {
      return Promise.reject(err);
    }
  }
};
StandaloneCommandService = __decorateClass([
  __decorateParam(0, IInstantiationService)
], StandaloneCommandService);
let StandaloneKeybindingService = class extends AbstractKeybindingService {
  static {
    __name(this, "StandaloneKeybindingService");
  }
  _cachedResolver;
  _dynamicKeybindings;
  _domNodeListeners;
  constructor(contextKeyService, commandService, telemetryService, notificationService, logService, codeEditorService) {
    super(contextKeyService, commandService, telemetryService, notificationService, logService);
    this._cachedResolver = null;
    this._dynamicKeybindings = [];
    this._domNodeListeners = [];
    const addContainer = /* @__PURE__ */ __name((domNode) => {
      const disposables = new DisposableStore();
      disposables.add(dom.addDisposableListener(domNode, dom.EventType.KEY_DOWN, (e) => {
        const keyEvent = new StandardKeyboardEvent(e);
        const shouldPreventDefault = this._dispatch(keyEvent, keyEvent.target);
        if (shouldPreventDefault) {
          keyEvent.preventDefault();
          keyEvent.stopPropagation();
        }
      }));
      disposables.add(dom.addDisposableListener(domNode, dom.EventType.KEY_UP, (e) => {
        const keyEvent = new StandardKeyboardEvent(e);
        const shouldPreventDefault = this._singleModifierDispatch(keyEvent, keyEvent.target);
        if (shouldPreventDefault) {
          keyEvent.preventDefault();
        }
      }));
      this._domNodeListeners.push(new DomNodeListeners(domNode, disposables));
    }, "addContainer");
    const removeContainer = /* @__PURE__ */ __name((domNode) => {
      for (let i = 0; i < this._domNodeListeners.length; i++) {
        const domNodeListeners = this._domNodeListeners[i];
        if (domNodeListeners.domNode === domNode) {
          this._domNodeListeners.splice(i, 1);
          domNodeListeners.dispose();
        }
      }
    }, "removeContainer");
    const addCodeEditor = /* @__PURE__ */ __name((codeEditor) => {
      if (codeEditor.getOption(EditorOption.inDiffEditor)) {
        return;
      }
      addContainer(codeEditor.getContainerDomNode());
    }, "addCodeEditor");
    const removeCodeEditor = /* @__PURE__ */ __name((codeEditor) => {
      if (codeEditor.getOption(EditorOption.inDiffEditor)) {
        return;
      }
      removeContainer(codeEditor.getContainerDomNode());
    }, "removeCodeEditor");
    this._register(codeEditorService.onCodeEditorAdd(addCodeEditor));
    this._register(codeEditorService.onCodeEditorRemove(removeCodeEditor));
    codeEditorService.listCodeEditors().forEach(addCodeEditor);
    const addDiffEditor = /* @__PURE__ */ __name((diffEditor) => {
      addContainer(diffEditor.getContainerDomNode());
    }, "addDiffEditor");
    const removeDiffEditor = /* @__PURE__ */ __name((diffEditor) => {
      removeContainer(diffEditor.getContainerDomNode());
    }, "removeDiffEditor");
    this._register(codeEditorService.onDiffEditorAdd(addDiffEditor));
    this._register(codeEditorService.onDiffEditorRemove(removeDiffEditor));
    codeEditorService.listDiffEditors().forEach(addDiffEditor);
  }
  addDynamicKeybinding(command, keybinding, handler, when) {
    return combinedDisposable(
      CommandsRegistry.registerCommand(command, handler),
      this.addDynamicKeybindings([{
        keybinding,
        command,
        when
      }])
    );
  }
  addDynamicKeybindings(rules) {
    const entries = rules.map((rule) => {
      const keybinding = decodeKeybinding(rule.keybinding, OS);
      return {
        keybinding,
        command: rule.command ?? null,
        commandArgs: rule.commandArgs,
        when: rule.when,
        weight1: 1e3,
        weight2: 0,
        extensionId: null,
        isBuiltinExtension: false
      };
    });
    this._dynamicKeybindings = this._dynamicKeybindings.concat(entries);
    this.updateResolver();
    return toDisposable(() => {
      for (let i = 0; i < this._dynamicKeybindings.length; i++) {
        if (this._dynamicKeybindings[i] === entries[0]) {
          this._dynamicKeybindings.splice(i, entries.length);
          this.updateResolver();
          return;
        }
      }
    });
  }
  updateResolver() {
    this._cachedResolver = null;
    this._onDidUpdateKeybindings.fire();
  }
  _getResolver() {
    if (!this._cachedResolver) {
      const defaults = this._toNormalizedKeybindingItems(KeybindingsRegistry.getDefaultKeybindings(), true);
      const overrides = this._toNormalizedKeybindingItems(this._dynamicKeybindings, false);
      this._cachedResolver = new KeybindingResolver(defaults, overrides, (str) => this._log(str));
    }
    return this._cachedResolver;
  }
  _documentHasFocus() {
    return mainWindow.document.hasFocus();
  }
  _toNormalizedKeybindingItems(items, isDefault) {
    const result = [];
    let resultLen = 0;
    for (const item of items) {
      const when = item.when || void 0;
      const keybinding = item.keybinding;
      if (!keybinding) {
        result[resultLen++] = new ResolvedKeybindingItem(void 0, item.command, item.commandArgs, when, isDefault, null, false);
      } else {
        const resolvedKeybindings = USLayoutResolvedKeybinding.resolveKeybinding(keybinding, OS);
        for (const resolvedKeybinding of resolvedKeybindings) {
          result[resultLen++] = new ResolvedKeybindingItem(resolvedKeybinding, item.command, item.commandArgs, when, isDefault, null, false);
        }
      }
    }
    return result;
  }
  resolveKeybinding(keybinding) {
    return USLayoutResolvedKeybinding.resolveKeybinding(keybinding, OS);
  }
  resolveKeyboardEvent(keyboardEvent) {
    const chord = new KeyCodeChord(
      keyboardEvent.ctrlKey,
      keyboardEvent.shiftKey,
      keyboardEvent.altKey,
      keyboardEvent.metaKey,
      keyboardEvent.keyCode
    );
    return new USLayoutResolvedKeybinding([chord], OS);
  }
  resolveUserBinding(userBinding) {
    return [];
  }
  _dumpDebugInfo() {
    return "";
  }
  _dumpDebugInfoJSON() {
    return "";
  }
  registerSchemaContribution(contribution) {
  }
  /**
   * not yet supported
   */
  enableKeybindingHoldMode(commandId) {
    return void 0;
  }
};
StandaloneKeybindingService = __decorateClass([
  __decorateParam(0, IContextKeyService),
  __decorateParam(1, ICommandService),
  __decorateParam(2, ITelemetryService),
  __decorateParam(3, INotificationService),
  __decorateParam(4, ILogService),
  __decorateParam(5, ICodeEditorService)
], StandaloneKeybindingService);
class DomNodeListeners extends Disposable {
  constructor(domNode, disposables) {
    super();
    this.domNode = domNode;
    this._register(disposables);
  }
  static {
    __name(this, "DomNodeListeners");
  }
}
function isConfigurationOverrides(thing) {
  return thing && typeof thing === "object" && (!thing.overrideIdentifier || typeof thing.overrideIdentifier === "string") && (!thing.resource || thing.resource instanceof URI);
}
__name(isConfigurationOverrides, "isConfigurationOverrides");
let StandaloneConfigurationService = class {
  constructor(logService) {
    this.logService = logService;
    const defaultConfiguration = new DefaultConfiguration(logService);
    this._configuration = new Configuration(
      defaultConfiguration.reload(),
      ConfigurationModel.createEmptyModel(logService),
      ConfigurationModel.createEmptyModel(logService),
      ConfigurationModel.createEmptyModel(logService),
      ConfigurationModel.createEmptyModel(logService),
      ConfigurationModel.createEmptyModel(logService),
      new ResourceMap(),
      ConfigurationModel.createEmptyModel(logService),
      new ResourceMap(),
      logService
    );
    defaultConfiguration.dispose();
  }
  static {
    __name(this, "StandaloneConfigurationService");
  }
  _onDidChangeConfiguration = new Emitter();
  onDidChangeConfiguration = this._onDidChangeConfiguration.event;
  _configuration;
  getValue(arg1, arg2) {
    const section = typeof arg1 === "string" ? arg1 : void 0;
    const overrides = isConfigurationOverrides(arg1) ? arg1 : isConfigurationOverrides(arg2) ? arg2 : {};
    return this._configuration.getValue(section, overrides, void 0);
  }
  updateValues(values) {
    const previous = { data: this._configuration.toData() };
    const changedKeys = [];
    for (const entry of values) {
      const [key, value] = entry;
      if (this.getValue(key) === value) {
        continue;
      }
      this._configuration.updateValue(key, value);
      changedKeys.push(key);
    }
    if (changedKeys.length > 0) {
      const configurationChangeEvent = new ConfigurationChangeEvent({ keys: changedKeys, overrides: [] }, previous, this._configuration, void 0, this.logService);
      configurationChangeEvent.source = ConfigurationTarget.MEMORY;
      this._onDidChangeConfiguration.fire(configurationChangeEvent);
    }
    return Promise.resolve();
  }
  updateValue(key, value, arg3, arg4) {
    return this.updateValues([[key, value]]);
  }
  inspect(key, options = {}) {
    return this._configuration.inspect(key, options, void 0);
  }
  keys() {
    return this._configuration.keys(void 0);
  }
  reloadConfiguration() {
    return Promise.resolve(void 0);
  }
  getConfigurationData() {
    const emptyModel = {
      contents: {},
      keys: [],
      overrides: []
    };
    return {
      defaults: emptyModel,
      policy: emptyModel,
      application: emptyModel,
      userLocal: emptyModel,
      userRemote: emptyModel,
      workspace: emptyModel,
      folders: []
    };
  }
};
StandaloneConfigurationService = __decorateClass([
  __decorateParam(0, ILogService)
], StandaloneConfigurationService);
let StandaloneResourceConfigurationService = class {
  constructor(configurationService, modelService, languageService) {
    this.configurationService = configurationService;
    this.modelService = modelService;
    this.languageService = languageService;
    this.configurationService.onDidChangeConfiguration((e) => {
      this._onDidChangeConfiguration.fire({ affectedKeys: e.affectedKeys, affectsConfiguration: /* @__PURE__ */ __name((resource, configuration) => e.affectsConfiguration(configuration), "affectsConfiguration") });
    });
  }
  static {
    __name(this, "StandaloneResourceConfigurationService");
  }
  _onDidChangeConfiguration = new Emitter();
  onDidChangeConfiguration = this._onDidChangeConfiguration.event;
  getValue(resource, arg2, arg3) {
    const position = Pos.isIPosition(arg2) ? arg2 : null;
    const section = position ? typeof arg3 === "string" ? arg3 : void 0 : typeof arg2 === "string" ? arg2 : void 0;
    const language = resource ? this.getLanguage(resource, position) : void 0;
    if (typeof section === "undefined") {
      return this.configurationService.getValue({
        resource,
        overrideIdentifier: language
      });
    }
    return this.configurationService.getValue(section, {
      resource,
      overrideIdentifier: language
    });
  }
  inspect(resource, position, section) {
    const language = resource ? this.getLanguage(resource, position) : void 0;
    return this.configurationService.inspect(section, { resource, overrideIdentifier: language });
  }
  getLanguage(resource, position) {
    const model = this.modelService.getModel(resource);
    if (model) {
      return position ? model.getLanguageIdAtPosition(position.lineNumber, position.column) : model.getLanguageId();
    }
    return this.languageService.guessLanguageIdByFilepathOrFirstLine(resource);
  }
  updateValue(resource, key, value, configurationTarget) {
    return this.configurationService.updateValue(key, value, { resource }, configurationTarget);
  }
};
StandaloneResourceConfigurationService = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, IModelService),
  __decorateParam(2, ILanguageService)
], StandaloneResourceConfigurationService);
let StandaloneResourcePropertiesService = class {
  constructor(configurationService) {
    this.configurationService = configurationService;
  }
  static {
    __name(this, "StandaloneResourcePropertiesService");
  }
  getEOL(resource, language) {
    const eol = this.configurationService.getValue("files.eol", { overrideIdentifier: language, resource });
    if (eol && typeof eol === "string" && eol !== "auto") {
      return eol;
    }
    return isLinux || isMacintosh ? "\n" : "\r\n";
  }
};
StandaloneResourcePropertiesService = __decorateClass([
  __decorateParam(0, IConfigurationService)
], StandaloneResourcePropertiesService);
class StandaloneTelemetryService {
  static {
    __name(this, "StandaloneTelemetryService");
  }
  telemetryLevel = TelemetryLevel.NONE;
  sessionId = "someValue.sessionId";
  machineId = "someValue.machineId";
  sqmId = "someValue.sqmId";
  devDeviceId = "someValue.devDeviceId";
  firstSessionDate = "someValue.firstSessionDate";
  sendErrorTelemetry = false;
  setEnabled() {
  }
  setExperimentProperty() {
  }
  publicLog() {
  }
  publicLog2() {
  }
  publicLogError() {
  }
  publicLogError2() {
  }
}
class StandaloneWorkspaceContextService {
  static {
    __name(this, "StandaloneWorkspaceContextService");
  }
  _serviceBrand;
  static SCHEME = "inmemory";
  _onDidChangeWorkspaceName = new Emitter();
  onDidChangeWorkspaceName = this._onDidChangeWorkspaceName.event;
  _onWillChangeWorkspaceFolders = new Emitter();
  onWillChangeWorkspaceFolders = this._onWillChangeWorkspaceFolders.event;
  _onDidChangeWorkspaceFolders = new Emitter();
  onDidChangeWorkspaceFolders = this._onDidChangeWorkspaceFolders.event;
  _onDidChangeWorkbenchState = new Emitter();
  onDidChangeWorkbenchState = this._onDidChangeWorkbenchState.event;
  workspace;
  constructor() {
    const resource = URI.from({ scheme: StandaloneWorkspaceContextService.SCHEME, authority: "model", path: "/" });
    this.workspace = { id: STANDALONE_EDITOR_WORKSPACE_ID, folders: [new WorkspaceFolder({ uri: resource, name: "", index: 0 })] };
  }
  getCompleteWorkspace() {
    return Promise.resolve(this.getWorkspace());
  }
  getWorkspace() {
    return this.workspace;
  }
  getWorkbenchState() {
    if (this.workspace) {
      if (this.workspace.configuration) {
        return WorkbenchState.WORKSPACE;
      }
      return WorkbenchState.FOLDER;
    }
    return WorkbenchState.EMPTY;
  }
  getWorkspaceFolder(resource) {
    return resource && resource.scheme === StandaloneWorkspaceContextService.SCHEME ? this.workspace.folders[0] : null;
  }
  isInsideWorkspace(resource) {
    return resource && resource.scheme === StandaloneWorkspaceContextService.SCHEME;
  }
  isCurrentWorkspace(workspaceIdOrFolder) {
    return true;
  }
}
function updateConfigurationService(configurationService, source, isDiffEditor) {
  if (!source) {
    return;
  }
  if (!(configurationService instanceof StandaloneConfigurationService)) {
    return;
  }
  const toUpdate = [];
  Object.keys(source).forEach((key) => {
    if (isEditorConfigurationKey(key)) {
      toUpdate.push([`editor.${key}`, source[key]]);
    }
    if (isDiffEditor && isDiffEditorConfigurationKey(key)) {
      toUpdate.push([`diffEditor.${key}`, source[key]]);
    }
  });
  if (toUpdate.length > 0) {
    configurationService.updateValues(toUpdate);
  }
}
__name(updateConfigurationService, "updateConfigurationService");
let StandaloneBulkEditService = class {
  constructor(_modelService) {
    this._modelService = _modelService;
  }
  static {
    __name(this, "StandaloneBulkEditService");
  }
  hasPreviewHandler() {
    return false;
  }
  setPreviewHandler() {
    return Disposable.None;
  }
  async apply(editsIn, _options) {
    const edits = Array.isArray(editsIn) ? editsIn : ResourceEdit.convert(editsIn);
    const textEdits = /* @__PURE__ */ new Map();
    for (const edit of edits) {
      if (!(edit instanceof ResourceTextEdit)) {
        throw new Error("bad edit - only text edits are supported");
      }
      const model = this._modelService.getModel(edit.resource);
      if (!model) {
        throw new Error("bad edit - model not found");
      }
      if (typeof edit.versionId === "number" && model.getVersionId() !== edit.versionId) {
        throw new Error("bad state - model changed in the meantime");
      }
      let array = textEdits.get(model);
      if (!array) {
        array = [];
        textEdits.set(model, array);
      }
      array.push(EditOperation.replaceMove(Range.lift(edit.textEdit.range), edit.textEdit.text));
    }
    let totalEdits = 0;
    let totalFiles = 0;
    for (const [model, edits2] of textEdits) {
      model.pushStackElement();
      model.pushEditOperations([], edits2, () => []);
      model.pushStackElement();
      totalFiles += 1;
      totalEdits += edits2.length;
    }
    return {
      ariaSummary: strings.format(StandaloneServicesNLS.bulkEditServiceSummary, totalEdits, totalFiles),
      isApplied: totalEdits > 0
    };
  }
};
StandaloneBulkEditService = __decorateClass([
  __decorateParam(0, IModelService)
], StandaloneBulkEditService);
class StandaloneUriLabelService {
  static {
    __name(this, "StandaloneUriLabelService");
  }
  onDidChangeFormatters = Event.None;
  getUriLabel(resource, options) {
    if (resource.scheme === "file") {
      return resource.fsPath;
    }
    return resource.path;
  }
  getUriBasenameLabel(resource) {
    return basename(resource);
  }
  getWorkspaceLabel(workspace, options) {
    return "";
  }
  getSeparator(scheme, authority) {
    return "/";
  }
  registerFormatter(formatter) {
    throw new Error("Not implemented");
  }
  registerCachedFormatter(formatter) {
    return this.registerFormatter(formatter);
  }
  getHostLabel() {
    return "";
  }
  getHostTooltip() {
    return void 0;
  }
}
let StandaloneContextViewService = class extends ContextViewService {
  constructor(layoutService, _codeEditorService) {
    super(layoutService);
    this._codeEditorService = _codeEditorService;
  }
  static {
    __name(this, "StandaloneContextViewService");
  }
  showContextView(delegate, container, shadowRoot) {
    if (!container) {
      const codeEditor = this._codeEditorService.getFocusedCodeEditor() || this._codeEditorService.getActiveCodeEditor();
      if (codeEditor) {
        container = codeEditor.getContainerDomNode();
      }
    }
    return super.showContextView(delegate, container, shadowRoot);
  }
};
StandaloneContextViewService = __decorateClass([
  __decorateParam(0, ILayoutService),
  __decorateParam(1, ICodeEditorService)
], StandaloneContextViewService);
class StandaloneWorkspaceTrustManagementService {
  static {
    __name(this, "StandaloneWorkspaceTrustManagementService");
  }
  _serviceBrand;
  _neverEmitter = new Emitter();
  onDidChangeTrust = this._neverEmitter.event;
  onDidChangeTrustedFolders = this._neverEmitter.event;
  workspaceResolved = Promise.resolve();
  workspaceTrustInitialized = Promise.resolve();
  acceptsOutOfWorkspaceFiles = true;
  isWorkspaceTrusted() {
    return true;
  }
  isWorkspaceTrustForced() {
    return false;
  }
  canSetParentFolderTrust() {
    return false;
  }
  async setParentFolderTrust(trusted) {
  }
  canSetWorkspaceTrust() {
    return false;
  }
  async setWorkspaceTrust(trusted) {
  }
  getUriTrustInfo(uri) {
    throw new Error("Method not supported.");
  }
  async setUrisTrust(uri, trusted) {
  }
  getTrustedUris() {
    return [];
  }
  async setTrustedUris(uris) {
  }
  addWorkspaceTrustTransitionParticipant(participant) {
    throw new Error("Method not supported.");
  }
}
class StandaloneLanguageService extends LanguageService {
  static {
    __name(this, "StandaloneLanguageService");
  }
  constructor() {
    super();
  }
}
class StandaloneLogService extends LogService {
  static {
    __name(this, "StandaloneLogService");
  }
  constructor() {
    super(new ConsoleLogger());
  }
}
let StandaloneContextMenuService = class extends ContextMenuService {
  static {
    __name(this, "StandaloneContextMenuService");
  }
  constructor(telemetryService, notificationService, contextViewService, keybindingService, menuService, contextKeyService) {
    super(telemetryService, notificationService, contextViewService, keybindingService, menuService, contextKeyService);
    this.configure({ blockMouse: false });
  }
};
StandaloneContextMenuService = __decorateClass([
  __decorateParam(0, ITelemetryService),
  __decorateParam(1, INotificationService),
  __decorateParam(2, IContextViewService),
  __decorateParam(3, IKeybindingService),
  __decorateParam(4, IMenuService),
  __decorateParam(5, IContextKeyService)
], StandaloneContextMenuService);
const standaloneEditorWorkerDescriptor = {
  esmModuleLocation: void 0,
  label: "editorWorkerService"
};
let StandaloneEditorWorkerService = class extends EditorWorkerService {
  static {
    __name(this, "StandaloneEditorWorkerService");
  }
  constructor(modelService, configurationService, logService, languageConfigurationService, languageFeaturesService) {
    super(standaloneEditorWorkerDescriptor, modelService, configurationService, logService, languageConfigurationService, languageFeaturesService);
  }
};
StandaloneEditorWorkerService = __decorateClass([
  __decorateParam(0, IModelService),
  __decorateParam(1, ITextResourceConfigurationService),
  __decorateParam(2, ILogService),
  __decorateParam(3, ILanguageConfigurationService),
  __decorateParam(4, ILanguageFeaturesService)
], StandaloneEditorWorkerService);
class StandaloneAccessbilitySignalService {
  static {
    __name(this, "StandaloneAccessbilitySignalService");
  }
  _serviceBrand;
  async playSignal(cue, options) {
  }
  async playSignals(cues) {
  }
  getEnabledState(signal, userGesture, modality) {
    return ValueWithChangeEvent.const(false);
  }
  getDelayMs(signal, modality) {
    return 0;
  }
  isSoundEnabled(cue) {
    return false;
  }
  isAnnouncementEnabled(cue) {
    return false;
  }
  onSoundEnabledChanged(cue) {
    return Event.None;
  }
  async playSound(cue, allowManyInParallel) {
  }
  playSignalLoop(cue) {
    return toDisposable(() => {
    });
  }
}
registerSingleton(ILogService, StandaloneLogService, InstantiationType.Eager);
registerSingleton(IConfigurationService, StandaloneConfigurationService, InstantiationType.Eager);
registerSingleton(ITextResourceConfigurationService, StandaloneResourceConfigurationService, InstantiationType.Eager);
registerSingleton(ITextResourcePropertiesService, StandaloneResourcePropertiesService, InstantiationType.Eager);
registerSingleton(IWorkspaceContextService, StandaloneWorkspaceContextService, InstantiationType.Eager);
registerSingleton(ILabelService, StandaloneUriLabelService, InstantiationType.Eager);
registerSingleton(ITelemetryService, StandaloneTelemetryService, InstantiationType.Eager);
registerSingleton(IDialogService, StandaloneDialogService, InstantiationType.Eager);
registerSingleton(IEnvironmentService, StandaloneEnvironmentService, InstantiationType.Eager);
registerSingleton(INotificationService, StandaloneNotificationService, InstantiationType.Eager);
registerSingleton(IMarkerService, MarkerService, InstantiationType.Eager);
registerSingleton(ILanguageService, StandaloneLanguageService, InstantiationType.Eager);
registerSingleton(IStandaloneThemeService, StandaloneThemeService, InstantiationType.Eager);
registerSingleton(IModelService, ModelService, InstantiationType.Eager);
registerSingleton(IMarkerDecorationsService, MarkerDecorationsService, InstantiationType.Eager);
registerSingleton(IContextKeyService, ContextKeyService, InstantiationType.Eager);
registerSingleton(IProgressService, StandaloneProgressService, InstantiationType.Eager);
registerSingleton(IEditorProgressService, StandaloneEditorProgressService, InstantiationType.Eager);
registerSingleton(IStorageService, InMemoryStorageService, InstantiationType.Eager);
registerSingleton(IEditorWorkerService, StandaloneEditorWorkerService, InstantiationType.Eager);
registerSingleton(IBulkEditService, StandaloneBulkEditService, InstantiationType.Eager);
registerSingleton(IWorkspaceTrustManagementService, StandaloneWorkspaceTrustManagementService, InstantiationType.Eager);
registerSingleton(ITextModelService, StandaloneTextModelService, InstantiationType.Eager);
registerSingleton(IAccessibilityService, AccessibilityService, InstantiationType.Eager);
registerSingleton(IListService, ListService, InstantiationType.Eager);
registerSingleton(ICommandService, StandaloneCommandService, InstantiationType.Eager);
registerSingleton(IKeybindingService, StandaloneKeybindingService, InstantiationType.Eager);
registerSingleton(IQuickInputService, StandaloneQuickInputService, InstantiationType.Eager);
registerSingleton(IContextViewService, StandaloneContextViewService, InstantiationType.Eager);
registerSingleton(IOpenerService, OpenerService, InstantiationType.Eager);
registerSingleton(IClipboardService, BrowserClipboardService, InstantiationType.Eager);
registerSingleton(IContextMenuService, StandaloneContextMenuService, InstantiationType.Eager);
registerSingleton(IMenuService, MenuService, InstantiationType.Eager);
registerSingleton(IAccessibilitySignalService, StandaloneAccessbilitySignalService, InstantiationType.Eager);
registerSingleton(ITreeSitterParserService, StandaloneTreeSitterParserService, InstantiationType.Eager);
var StandaloneServices;
((StandaloneServices2) => {
  const serviceCollection = new ServiceCollection();
  for (const [id, descriptor] of getSingletonServiceDescriptors()) {
    serviceCollection.set(id, descriptor);
  }
  const instantiationService = new InstantiationService(serviceCollection, true);
  serviceCollection.set(IInstantiationService, instantiationService);
  function get(serviceId) {
    if (!initialized) {
      initialize({});
    }
    const r = serviceCollection.get(serviceId);
    if (!r) {
      throw new Error("Missing service " + serviceId);
    }
    if (r instanceof SyncDescriptor) {
      return instantiationService.invokeFunction((accessor) => accessor.get(serviceId));
    } else {
      return r;
    }
  }
  StandaloneServices2.get = get;
  __name(get, "get");
  let initialized = false;
  const onDidInitialize = new Emitter();
  function initialize(overrides) {
    if (initialized) {
      return instantiationService;
    }
    initialized = true;
    for (const [id, descriptor] of getSingletonServiceDescriptors()) {
      if (!serviceCollection.get(id)) {
        serviceCollection.set(id, descriptor);
      }
    }
    for (const serviceId in overrides) {
      if (overrides.hasOwnProperty(serviceId)) {
        const serviceIdentifier = createDecorator(serviceId);
        const r = serviceCollection.get(serviceIdentifier);
        if (r instanceof SyncDescriptor) {
          serviceCollection.set(serviceIdentifier, overrides[serviceId]);
        }
      }
    }
    const editorFeatures = getEditorFeatures();
    for (const feature of editorFeatures) {
      try {
        instantiationService.createInstance(feature);
      } catch (err) {
        onUnexpectedError(err);
      }
    }
    onDidInitialize.fire();
    return instantiationService;
  }
  StandaloneServices2.initialize = initialize;
  __name(initialize, "initialize");
  function withServices(callback) {
    if (initialized) {
      return callback();
    }
    const disposable = new DisposableStore();
    const listener = disposable.add(onDidInitialize.event(() => {
      listener.dispose();
      disposable.add(callback());
    }));
    return disposable;
  }
  StandaloneServices2.withServices = withServices;
  __name(withServices, "withServices");
})(StandaloneServices || (StandaloneServices = {}));
export {
  StandaloneCommandService,
  StandaloneConfigurationService,
  StandaloneKeybindingService,
  StandaloneNotificationService,
  StandaloneServices,
  updateConfigurationService
};
//# sourceMappingURL=standaloneServices.js.map
