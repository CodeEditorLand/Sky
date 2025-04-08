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
import { Barrier } from "../../../base/common/async.js";
import { isUriComponents, URI, UriComponents } from "../../../base/common/uri.js";
import { Event, Emitter } from "../../../base/common/event.js";
import { IObservable, observableValue, observableValueOpts, transaction } from "../../../base/common/observable.js";
import { IDisposable, DisposableStore, combinedDisposable, dispose, Disposable } from "../../../base/common/lifecycle.js";
import { ISCMService, ISCMRepository, ISCMProvider, ISCMResource, ISCMResourceGroup, ISCMResourceDecorations, IInputValidation, ISCMViewService, InputValidationType, ISCMActionButtonDescriptor } from "../../contrib/scm/common/scm.js";
import { ExtHostContext, MainThreadSCMShape, ExtHostSCMShape, SCMProviderFeatures, SCMRawResourceSplices, SCMGroupFeatures, MainContext, SCMHistoryItemDto, SCMHistoryItemRefsChangeEventDto, SCMHistoryItemRefDto } from "../common/extHost.protocol.js";
import { Command } from "../../../editor/common/languages.js";
import { extHostNamedCustomer, IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { CancellationToken } from "../../../base/common/cancellation.js";
import { MarshalledId } from "../../../base/common/marshallingIds.js";
import { ThemeIcon } from "../../../base/common/themables.js";
import { IMarkdownString } from "../../../base/common/htmlContent.js";
import { IQuickDiffService, QuickDiffProvider } from "../../contrib/scm/common/quickDiff.js";
import { ISCMHistoryItem, ISCMHistoryItemChange, ISCMHistoryItemRef, ISCMHistoryItemRefsChangeEvent, ISCMHistoryOptions, ISCMHistoryProvider } from "../../contrib/scm/common/history.js";
import { ResourceTree } from "../../../base/common/resourceTree.js";
import { IUriIdentityService } from "../../../platform/uriIdentity/common/uriIdentity.js";
import { IWorkspaceContextService } from "../../../platform/workspace/common/workspace.js";
import { basename } from "../../../base/common/resources.js";
import { ILanguageService } from "../../../editor/common/languages/language.js";
import { IModelService } from "../../../editor/common/services/model.js";
import { ITextModelContentProvider, ITextModelService } from "../../../editor/common/services/resolverService.js";
import { Schemas } from "../../../base/common/network.js";
import { ITextModel } from "../../../editor/common/model.js";
import { structuralEquals } from "../../../base/common/equals.js";
import { historyItemBaseRefColor, historyItemRefColor, historyItemRemoteRefColor } from "../../contrib/scm/browser/scmHistory.js";
import { ColorIdentifier } from "../../../platform/theme/common/colorUtils.js";
function getIconFromIconDto(iconDto) {
  if (iconDto === void 0) {
    return void 0;
  } else if (ThemeIcon.isThemeIcon(iconDto)) {
    return iconDto;
  } else if (isUriComponents(iconDto)) {
    return URI.revive(iconDto);
  } else {
    const icon = iconDto;
    return { light: URI.revive(icon.light), dark: URI.revive(icon.dark) };
  }
}
__name(getIconFromIconDto, "getIconFromIconDto");
function toISCMHistoryItem(historyItemDto) {
  const authorIcon = getIconFromIconDto(historyItemDto.authorIcon);
  const references = historyItemDto.references?.map((r) => ({
    ...r,
    icon: getIconFromIconDto(r.icon)
  }));
  return { ...historyItemDto, authorIcon, references };
}
__name(toISCMHistoryItem, "toISCMHistoryItem");
function toISCMHistoryItemRef(historyItemRefDto, color) {
  return historyItemRefDto ? { ...historyItemRefDto, icon: getIconFromIconDto(historyItemRefDto.icon), color } : void 0;
}
__name(toISCMHistoryItemRef, "toISCMHistoryItemRef");
class SCMInputBoxContentProvider extends Disposable {
  constructor(textModelService, modelService, languageService) {
    super();
    this.modelService = modelService;
    this.languageService = languageService;
    this._register(textModelService.registerTextModelContentProvider(Schemas.vscodeSourceControl, this));
  }
  static {
    __name(this, "SCMInputBoxContentProvider");
  }
  async provideTextContent(resource) {
    const existing = this.modelService.getModel(resource);
    if (existing) {
      return existing;
    }
    return this.modelService.createModel("", this.languageService.createById("scminput"), resource);
  }
}
class MainThreadSCMResourceGroup {
  constructor(sourceControlHandle, handle, provider, features, label, id, multiDiffEditorEnableViewChanges, _uriIdentService) {
    this.sourceControlHandle = sourceControlHandle;
    this.handle = handle;
    this.provider = provider;
    this.features = features;
    this.label = label;
    this.id = id;
    this.multiDiffEditorEnableViewChanges = multiDiffEditorEnableViewChanges;
    this._uriIdentService = _uriIdentService;
  }
  static {
    __name(this, "MainThreadSCMResourceGroup");
  }
  resources = [];
  _resourceTree;
  get resourceTree() {
    if (!this._resourceTree) {
      const rootUri = this.provider.rootUri ?? URI.file("/");
      this._resourceTree = new ResourceTree(this, rootUri, this._uriIdentService.extUri);
      for (const resource of this.resources) {
        this._resourceTree.add(resource.sourceUri, resource);
      }
    }
    return this._resourceTree;
  }
  _onDidChange = new Emitter();
  onDidChange = this._onDidChange.event;
  _onDidChangeResources = new Emitter();
  onDidChangeResources = this._onDidChangeResources.event;
  get hideWhenEmpty() {
    return !!this.features.hideWhenEmpty;
  }
  get contextValue() {
    return this.features.contextValue;
  }
  toJSON() {
    return {
      $mid: MarshalledId.ScmResourceGroup,
      sourceControlHandle: this.sourceControlHandle,
      groupHandle: this.handle
    };
  }
  splice(start, deleteCount, toInsert) {
    this.resources.splice(start, deleteCount, ...toInsert);
    this._resourceTree = void 0;
    this._onDidChangeResources.fire();
  }
  $updateGroup(features) {
    this.features = { ...this.features, ...features };
    this._onDidChange.fire();
  }
  $updateGroupLabel(label) {
    this.label = label;
    this._onDidChange.fire();
  }
}
class MainThreadSCMResource {
  constructor(proxy, sourceControlHandle, groupHandle, handle, sourceUri, resourceGroup, decorations, contextValue, command, multiDiffEditorOriginalUri, multiDiffEditorModifiedUri) {
    this.proxy = proxy;
    this.sourceControlHandle = sourceControlHandle;
    this.groupHandle = groupHandle;
    this.handle = handle;
    this.sourceUri = sourceUri;
    this.resourceGroup = resourceGroup;
    this.decorations = decorations;
    this.contextValue = contextValue;
    this.command = command;
    this.multiDiffEditorOriginalUri = multiDiffEditorOriginalUri;
    this.multiDiffEditorModifiedUri = multiDiffEditorModifiedUri;
  }
  static {
    __name(this, "MainThreadSCMResource");
  }
  open(preserveFocus) {
    return this.proxy.$executeResourceCommand(this.sourceControlHandle, this.groupHandle, this.handle, preserveFocus);
  }
  toJSON() {
    return {
      $mid: MarshalledId.ScmResource,
      sourceControlHandle: this.sourceControlHandle,
      groupHandle: this.groupHandle,
      handle: this.handle
    };
  }
}
class MainThreadSCMHistoryProvider {
  constructor(proxy, handle) {
    this.proxy = proxy;
    this.handle = handle;
  }
  static {
    __name(this, "MainThreadSCMHistoryProvider");
  }
  _historyItemRef = observableValueOpts({
    owner: this,
    equalsFn: structuralEquals
  }, void 0);
  get historyItemRef() {
    return this._historyItemRef;
  }
  _historyItemRemoteRef = observableValueOpts({
    owner: this,
    equalsFn: structuralEquals
  }, void 0);
  get historyItemRemoteRef() {
    return this._historyItemRemoteRef;
  }
  _historyItemBaseRef = observableValueOpts({
    owner: this,
    equalsFn: structuralEquals
  }, void 0);
  get historyItemBaseRef() {
    return this._historyItemBaseRef;
  }
  _historyItemRefChanges = observableValue(this, { added: [], modified: [], removed: [], silent: false });
  get historyItemRefChanges() {
    return this._historyItemRefChanges;
  }
  async resolveHistoryItemRefsCommonAncestor(historyItemRefs) {
    return this.proxy.$resolveHistoryItemRefsCommonAncestor(this.handle, historyItemRefs, CancellationToken.None);
  }
  async provideHistoryItemRefs(historyItemsRefs) {
    const historyItemRefs = await this.proxy.$provideHistoryItemRefs(this.handle, historyItemsRefs, CancellationToken.None);
    return historyItemRefs?.map((ref) => ({ ...ref, icon: getIconFromIconDto(ref.icon) }));
  }
  async provideHistoryItems(options) {
    const historyItems = await this.proxy.$provideHistoryItems(this.handle, options, CancellationToken.None);
    return historyItems?.map((historyItem) => toISCMHistoryItem(historyItem));
  }
  async provideHistoryItemChanges(historyItemId, historyItemParentId) {
    const changes = await this.proxy.$provideHistoryItemChanges(this.handle, historyItemId, historyItemParentId, CancellationToken.None);
    return changes?.map((change) => ({
      uri: URI.revive(change.uri),
      originalUri: change.originalUri && URI.revive(change.originalUri),
      modifiedUri: change.modifiedUri && URI.revive(change.modifiedUri)
    }));
  }
  $onDidChangeCurrentHistoryItemRefs(historyItemRef, historyItemRemoteRef, historyItemBaseRef) {
    transaction((tx) => {
      this._historyItemRef.set(toISCMHistoryItemRef(historyItemRef, historyItemRefColor), tx);
      this._historyItemRemoteRef.set(toISCMHistoryItemRef(historyItemRemoteRef, historyItemRemoteRefColor), tx);
      this._historyItemBaseRef.set(toISCMHistoryItemRef(historyItemBaseRef, historyItemBaseRefColor), tx);
    });
  }
  $onDidChangeHistoryItemRefs(historyItemRefs) {
    const added = historyItemRefs.added.map((ref) => toISCMHistoryItemRef(ref));
    const modified = historyItemRefs.modified.map((ref) => toISCMHistoryItemRef(ref));
    const removed = historyItemRefs.removed.map((ref) => toISCMHistoryItemRef(ref));
    this._historyItemRefChanges.set({ added, modified, removed, silent: historyItemRefs.silent }, void 0);
  }
}
class MainThreadSCMProvider {
  constructor(proxy, _handle, _providerId, _label, _rootUri, _inputBoxTextModel, _quickDiffService, _uriIdentService, _workspaceContextService) {
    this.proxy = proxy;
    this._handle = _handle;
    this._providerId = _providerId;
    this._label = _label;
    this._rootUri = _rootUri;
    this._inputBoxTextModel = _inputBoxTextModel;
    this._quickDiffService = _quickDiffService;
    this._uriIdentService = _uriIdentService;
    this._workspaceContextService = _workspaceContextService;
    if (_rootUri) {
      const folder = this._workspaceContextService.getWorkspaceFolder(_rootUri);
      if (folder?.uri.toString() === _rootUri.toString()) {
        this._name = folder.name;
      } else if (_rootUri.path !== "/") {
        this._name = basename(_rootUri);
      }
    }
  }
  static {
    __name(this, "MainThreadSCMProvider");
  }
  static ID_HANDLE = 0;
  _id = `scm${MainThreadSCMProvider.ID_HANDLE++}`;
  get id() {
    return this._id;
  }
  groups = [];
  _onDidChangeResourceGroups = new Emitter();
  onDidChangeResourceGroups = this._onDidChangeResourceGroups.event;
  _onDidChangeResources = new Emitter();
  onDidChangeResources = this._onDidChangeResources.event;
  _groupsByHandle = /* @__PURE__ */ Object.create(null);
  // get groups(): ISequence<ISCMResourceGroup> {
  // 	return {
  // 		elements: this._groups,
  // 		onDidSplice: this._onDidSplice.event
  // 	};
  // 	// return this._groups
  // 	// 	.filter(g => g.resources.elements.length > 0 || !g.features.hideWhenEmpty);
  // }
  features = {};
  get handle() {
    return this._handle;
  }
  get label() {
    return this._label;
  }
  get rootUri() {
    return this._rootUri;
  }
  get inputBoxTextModel() {
    return this._inputBoxTextModel;
  }
  get contextValue() {
    return this._providerId;
  }
  get acceptInputCommand() {
    return this.features.acceptInputCommand;
  }
  _count = observableValue(this, void 0);
  get count() {
    return this._count;
  }
  _statusBarCommands = observableValue(this, void 0);
  get statusBarCommands() {
    return this._statusBarCommands;
  }
  _name;
  get name() {
    return this._name ?? this._label;
  }
  _commitTemplate = observableValue(this, "");
  get commitTemplate() {
    return this._commitTemplate;
  }
  _actionButton = observableValue(this, void 0);
  get actionButton() {
    return this._actionButton;
  }
  _quickDiff;
  isSCM = true;
  visible = true;
  _historyProvider = observableValue(this, void 0);
  get historyProvider() {
    return this._historyProvider;
  }
  $updateSourceControl(features) {
    this.features = { ...this.features, ...features };
    if (typeof features.commitTemplate !== "undefined") {
      this._commitTemplate.set(features.commitTemplate, void 0);
    }
    if (typeof features.actionButton !== "undefined") {
      this._actionButton.set(features.actionButton ?? void 0, void 0);
    }
    if (typeof features.count !== "undefined") {
      this._count.set(features.count, void 0);
    }
    if (typeof features.statusBarCommands !== "undefined") {
      this._statusBarCommands.set(features.statusBarCommands, void 0);
    }
    if (features.hasQuickDiffProvider && !this._quickDiff) {
      this._quickDiff = this._quickDiffService.addQuickDiffProvider({
        label: features.quickDiffLabel ?? this.label,
        rootUri: this.rootUri,
        isSCM: this.isSCM,
        visible: this.visible,
        getOriginalResource: /* @__PURE__ */ __name((uri) => this.getOriginalResource(uri), "getOriginalResource")
      });
    } else if (features.hasQuickDiffProvider === false && this._quickDiff) {
      this._quickDiff.dispose();
      this._quickDiff = void 0;
    }
    if (features.hasHistoryProvider && !this.historyProvider.get()) {
      const historyProvider = new MainThreadSCMHistoryProvider(this.proxy, this.handle);
      this._historyProvider.set(historyProvider, void 0);
    } else if (features.hasHistoryProvider === false && this.historyProvider.get()) {
      this._historyProvider.set(void 0, void 0);
    }
  }
  $registerGroups(_groups) {
    const groups = _groups.map(([handle, id, label, features, multiDiffEditorEnableViewChanges]) => {
      const group = new MainThreadSCMResourceGroup(
        this.handle,
        handle,
        this,
        features,
        label,
        id,
        multiDiffEditorEnableViewChanges,
        this._uriIdentService
      );
      this._groupsByHandle[handle] = group;
      return group;
    });
    this.groups.splice(this.groups.length, 0, ...groups);
    this._onDidChangeResourceGroups.fire();
  }
  $updateGroup(handle, features) {
    const group = this._groupsByHandle[handle];
    if (!group) {
      return;
    }
    group.$updateGroup(features);
  }
  $updateGroupLabel(handle, label) {
    const group = this._groupsByHandle[handle];
    if (!group) {
      return;
    }
    group.$updateGroupLabel(label);
  }
  $spliceGroupResourceStates(splices) {
    for (const [groupHandle, groupSlices] of splices) {
      const group = this._groupsByHandle[groupHandle];
      if (!group) {
        console.warn(`SCM group ${groupHandle} not found in provider ${this.label}`);
        continue;
      }
      groupSlices.reverse();
      for (const [start, deleteCount, rawResources] of groupSlices) {
        const resources = rawResources.map((rawResource) => {
          const [handle, sourceUri, icons, tooltip, strikeThrough, faded, contextValue, command, multiDiffEditorOriginalUri, multiDiffEditorModifiedUri] = rawResource;
          const [light, dark] = icons;
          const icon = ThemeIcon.isThemeIcon(light) ? light : URI.revive(light);
          const iconDark = (ThemeIcon.isThemeIcon(dark) ? dark : URI.revive(dark)) || icon;
          const decorations = {
            icon,
            iconDark,
            tooltip,
            strikeThrough,
            faded
          };
          return new MainThreadSCMResource(
            this.proxy,
            this.handle,
            groupHandle,
            handle,
            URI.revive(sourceUri),
            group,
            decorations,
            contextValue || void 0,
            command,
            URI.revive(multiDiffEditorOriginalUri),
            URI.revive(multiDiffEditorModifiedUri)
          );
        });
        group.splice(start, deleteCount, resources);
      }
    }
    this._onDidChangeResources.fire();
  }
  $unregisterGroup(handle) {
    const group = this._groupsByHandle[handle];
    if (!group) {
      return;
    }
    delete this._groupsByHandle[handle];
    this.groups.splice(this.groups.indexOf(group), 1);
    this._onDidChangeResourceGroups.fire();
  }
  async getOriginalResource(uri) {
    if (!this.features.hasQuickDiffProvider) {
      return null;
    }
    const result = await this.proxy.$provideOriginalResource(this.handle, uri, CancellationToken.None);
    return result && URI.revive(result);
  }
  $onDidChangeHistoryProviderCurrentHistoryItemRefs(historyItemRef, historyItemRemoteRef, historyItemBaseRef) {
    if (!this.historyProvider.get()) {
      return;
    }
    this._historyProvider.get()?.$onDidChangeCurrentHistoryItemRefs(historyItemRef, historyItemRemoteRef, historyItemBaseRef);
  }
  $onDidChangeHistoryProviderHistoryItemRefs(historyItemRefs) {
    if (!this.historyProvider.get()) {
      return;
    }
    this._historyProvider.get()?.$onDidChangeHistoryItemRefs(historyItemRefs);
  }
  toJSON() {
    return {
      $mid: MarshalledId.ScmProvider,
      handle: this.handle
    };
  }
  dispose() {
    this._quickDiff?.dispose();
  }
}
let MainThreadSCM = class {
  constructor(extHostContext, scmService, scmViewService, languageService, modelService, textModelService, quickDiffService, _uriIdentService, workspaceContextService) {
    this.scmService = scmService;
    this.scmViewService = scmViewService;
    this.languageService = languageService;
    this.modelService = modelService;
    this.textModelService = textModelService;
    this.quickDiffService = quickDiffService;
    this._uriIdentService = _uriIdentService;
    this.workspaceContextService = workspaceContextService;
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostSCM);
    this._disposables.add(new SCMInputBoxContentProvider(this.textModelService, this.modelService, this.languageService));
  }
  _proxy;
  _repositories = /* @__PURE__ */ new Map();
  _repositoryBarriers = /* @__PURE__ */ new Map();
  _repositoryDisposables = /* @__PURE__ */ new Map();
  _disposables = new DisposableStore();
  dispose() {
    dispose(this._repositories.values());
    this._repositories.clear();
    dispose(this._repositoryDisposables.values());
    this._repositoryDisposables.clear();
    this._disposables.dispose();
  }
  async $registerSourceControl(handle, id, label, rootUri, inputBoxDocumentUri) {
    this._repositoryBarriers.set(handle, new Barrier());
    const inputBoxTextModelRef = await this.textModelService.createModelReference(URI.revive(inputBoxDocumentUri));
    const provider = new MainThreadSCMProvider(this._proxy, handle, id, label, rootUri ? URI.revive(rootUri) : void 0, inputBoxTextModelRef.object.textEditorModel, this.quickDiffService, this._uriIdentService, this.workspaceContextService);
    const repository = this.scmService.registerSCMProvider(provider);
    this._repositories.set(handle, repository);
    const disposable = combinedDisposable(
      inputBoxTextModelRef,
      Event.filter(this.scmViewService.onDidFocusRepository, (r) => r === repository)((_) => this._proxy.$setSelectedSourceControl(handle)),
      repository.input.onDidChange(({ value }) => this._proxy.$onInputBoxValueChange(handle, value))
    );
    this._repositoryDisposables.set(handle, disposable);
    if (this.scmViewService.focusedRepository === repository) {
      setTimeout(() => this._proxy.$setSelectedSourceControl(handle), 0);
    }
    if (repository.input.value) {
      setTimeout(() => this._proxy.$onInputBoxValueChange(handle, repository.input.value), 0);
    }
    this._repositoryBarriers.get(handle)?.open();
  }
  async $updateSourceControl(handle, features) {
    await this._repositoryBarriers.get(handle)?.wait();
    const repository = this._repositories.get(handle);
    if (!repository) {
      return;
    }
    const provider = repository.provider;
    provider.$updateSourceControl(features);
  }
  async $unregisterSourceControl(handle) {
    await this._repositoryBarriers.get(handle)?.wait();
    const repository = this._repositories.get(handle);
    if (!repository) {
      return;
    }
    this._repositoryDisposables.get(handle).dispose();
    this._repositoryDisposables.delete(handle);
    repository.dispose();
    this._repositories.delete(handle);
  }
  async $registerGroups(sourceControlHandle, groups, splices) {
    await this._repositoryBarriers.get(sourceControlHandle)?.wait();
    const repository = this._repositories.get(sourceControlHandle);
    if (!repository) {
      return;
    }
    const provider = repository.provider;
    provider.$registerGroups(groups);
    provider.$spliceGroupResourceStates(splices);
  }
  async $updateGroup(sourceControlHandle, groupHandle, features) {
    await this._repositoryBarriers.get(sourceControlHandle)?.wait();
    const repository = this._repositories.get(sourceControlHandle);
    if (!repository) {
      return;
    }
    const provider = repository.provider;
    provider.$updateGroup(groupHandle, features);
  }
  async $updateGroupLabel(sourceControlHandle, groupHandle, label) {
    await this._repositoryBarriers.get(sourceControlHandle)?.wait();
    const repository = this._repositories.get(sourceControlHandle);
    if (!repository) {
      return;
    }
    const provider = repository.provider;
    provider.$updateGroupLabel(groupHandle, label);
  }
  async $spliceResourceStates(sourceControlHandle, splices) {
    await this._repositoryBarriers.get(sourceControlHandle)?.wait();
    const repository = this._repositories.get(sourceControlHandle);
    if (!repository) {
      return;
    }
    const provider = repository.provider;
    provider.$spliceGroupResourceStates(splices);
  }
  async $unregisterGroup(sourceControlHandle, handle) {
    await this._repositoryBarriers.get(sourceControlHandle)?.wait();
    const repository = this._repositories.get(sourceControlHandle);
    if (!repository) {
      return;
    }
    const provider = repository.provider;
    provider.$unregisterGroup(handle);
  }
  async $setInputBoxValue(sourceControlHandle, value) {
    await this._repositoryBarriers.get(sourceControlHandle)?.wait();
    const repository = this._repositories.get(sourceControlHandle);
    if (!repository) {
      return;
    }
    repository.input.setValue(value, false);
  }
  async $setInputBoxPlaceholder(sourceControlHandle, placeholder) {
    await this._repositoryBarriers.get(sourceControlHandle)?.wait();
    const repository = this._repositories.get(sourceControlHandle);
    if (!repository) {
      return;
    }
    repository.input.placeholder = placeholder;
  }
  async $setInputBoxEnablement(sourceControlHandle, enabled) {
    await this._repositoryBarriers.get(sourceControlHandle)?.wait();
    const repository = this._repositories.get(sourceControlHandle);
    if (!repository) {
      return;
    }
    repository.input.enabled = enabled;
  }
  async $setInputBoxVisibility(sourceControlHandle, visible) {
    await this._repositoryBarriers.get(sourceControlHandle)?.wait();
    const repository = this._repositories.get(sourceControlHandle);
    if (!repository) {
      return;
    }
    repository.input.visible = visible;
  }
  async $showValidationMessage(sourceControlHandle, message, type) {
    await this._repositoryBarriers.get(sourceControlHandle)?.wait();
    const repository = this._repositories.get(sourceControlHandle);
    if (!repository) {
      return;
    }
    repository.input.showValidationMessage(message, type);
  }
  async $setValidationProviderIsEnabled(sourceControlHandle, enabled) {
    await this._repositoryBarriers.get(sourceControlHandle)?.wait();
    const repository = this._repositories.get(sourceControlHandle);
    if (!repository) {
      return;
    }
    if (enabled) {
      repository.input.validateInput = async (value, pos) => {
        const result = await this._proxy.$validateInput(sourceControlHandle, value, pos);
        return result && { message: result[0], type: result[1] };
      };
    } else {
      repository.input.validateInput = async () => void 0;
    }
  }
  async $onDidChangeHistoryProviderCurrentHistoryItemRefs(sourceControlHandle, historyItemRef, historyItemRemoteRef, historyItemBaseRef) {
    await this._repositoryBarriers.get(sourceControlHandle)?.wait();
    const repository = this._repositories.get(sourceControlHandle);
    if (!repository) {
      return;
    }
    const provider = repository.provider;
    provider.$onDidChangeHistoryProviderCurrentHistoryItemRefs(historyItemRef, historyItemRemoteRef, historyItemBaseRef);
  }
  async $onDidChangeHistoryProviderHistoryItemRefs(sourceControlHandle, historyItemRefs) {
    await this._repositoryBarriers.get(sourceControlHandle)?.wait();
    const repository = this._repositories.get(sourceControlHandle);
    if (!repository) {
      return;
    }
    const provider = repository.provider;
    provider.$onDidChangeHistoryProviderHistoryItemRefs(historyItemRefs);
  }
};
__name(MainThreadSCM, "MainThreadSCM");
MainThreadSCM = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadSCM),
  __decorateParam(1, ISCMService),
  __decorateParam(2, ISCMViewService),
  __decorateParam(3, ILanguageService),
  __decorateParam(4, IModelService),
  __decorateParam(5, ITextModelService),
  __decorateParam(6, IQuickDiffService),
  __decorateParam(7, IUriIdentityService),
  __decorateParam(8, IWorkspaceContextService)
], MainThreadSCM);
export {
  MainThreadSCM
};
//# sourceMappingURL=mainThreadSCM.js.map
