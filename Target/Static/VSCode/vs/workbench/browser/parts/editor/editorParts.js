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
import { localize } from "../../../../nls.js";
import { EditorGroupLayout, GroupDirection, GroupLocation, GroupOrientation, GroupsArrangement, GroupsOrder, IAuxiliaryEditorPart, IEditorGroupContextKeyProvider, IEditorDropTargetDelegate, IEditorGroupsService, IEditorSideGroup, IEditorWorkingSet, IFindGroupScope, IMergeGroupOptions, IEditorWorkingSetOptions, IEditorPart } from "../../../services/editor/common/editorGroupsService.js";
import { Emitter } from "../../../../base/common/event.js";
import { DisposableMap, DisposableStore, IDisposable, toDisposable } from "../../../../base/common/lifecycle.js";
import { GroupIdentifier } from "../../../common/editor.js";
import { EditorPart, IEditorPartUIState, MainEditorPart } from "./editorPart.js";
import { IEditorGroupView, IEditorPartsView } from "./editor.js";
import { InstantiationType, registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { distinct } from "../../../../base/common/arrays.js";
import { AuxiliaryEditorPart, IAuxiliaryEditorPartOpenOptions } from "./auxiliaryEditorPart.js";
import { MultiWindowParts } from "../../part.js";
import { DeferredPromise } from "../../../../base/common/async.js";
import { IStorageService, IStorageValueChangeEvent, StorageScope, StorageTarget } from "../../../../platform/storage/common/storage.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { IAuxiliaryWindowOpenOptions, IAuxiliaryWindowService } from "../../../services/auxiliaryWindow/browser/auxiliaryWindowService.js";
import { generateUuid } from "../../../../base/common/uuid.js";
import { ContextKeyValue, IContextKey, IContextKeyService, RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { isHTMLElement } from "../../../../base/browser/dom.js";
import { ServiceCollection } from "../../../../platform/instantiation/common/serviceCollection.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
let EditorParts = class extends MultiWindowParts {
  constructor(instantiationService, storageService, themeService, auxiliaryWindowService, contextKeyService) {
    super("workbench.editorParts", themeService, storageService);
    this.instantiationService = instantiationService;
    this.storageService = storageService;
    this.auxiliaryWindowService = auxiliaryWindowService;
    this.contextKeyService = contextKeyService;
    this.mainPart = this._register(this.createMainEditorPart());
    this._register(this.registerPart(this.mainPart));
    this.mostRecentActiveParts = [this.mainPart];
    this.restoreParts();
    this.registerListeners();
  }
  static {
    __name(this, "EditorParts");
  }
  mainPart;
  mostRecentActiveParts;
  registerListeners() {
    this._register(this.onDidChangeMementoValue(StorageScope.WORKSPACE, this._store)((e) => this.onDidChangeMementoState(e)));
    this.whenReady.then(() => this.registerGroupsContextKeyListeners());
  }
  createMainEditorPart() {
    return this.instantiationService.createInstance(MainEditorPart, this);
  }
  //#region Scoped Instantiation Services
  mapPartToInstantiationService = /* @__PURE__ */ new Map();
  getScopedInstantiationService(part) {
    if (part === this.mainPart) {
      if (!this.mapPartToInstantiationService.has(part.windowId)) {
        this.instantiationService.invokeFunction((accessor) => {
          const editorService = accessor.get(IEditorService);
          this.mapPartToInstantiationService.set(part.windowId, this._register(this.instantiationService.createChild(new ServiceCollection(
            [IEditorService, editorService.createScoped("main", this._store)]
          ))));
        });
      }
    }
    return this.mapPartToInstantiationService.get(part.windowId) ?? this.instantiationService;
  }
  //#endregion
  //#region Auxiliary Editor Parts
  _onDidCreateAuxiliaryEditorPart = this._register(new Emitter());
  onDidCreateAuxiliaryEditorPart = this._onDidCreateAuxiliaryEditorPart.event;
  async createAuxiliaryEditorPart(options) {
    const { part, instantiationService, disposables } = await this.instantiationService.createInstance(AuxiliaryEditorPart, this).create(this.getGroupsLabel(this._parts.size), options);
    this.mapPartToInstantiationService.set(part.windowId, instantiationService);
    disposables.add(toDisposable(() => this.mapPartToInstantiationService.delete(part.windowId)));
    this._onDidAddGroup.fire(part.activeGroup);
    this._onDidCreateAuxiliaryEditorPart.fire(part);
    return part;
  }
  //#endregion
  //#region Registration
  registerPart(part) {
    const disposables = this._register(new DisposableStore());
    disposables.add(super.registerPart(part));
    this.registerEditorPartListeners(part, disposables);
    return disposables;
  }
  unregisterPart(part) {
    super.unregisterPart(part);
    this.parts.forEach((part2, index) => {
      if (part2 === this.mainPart) {
        return;
      }
      part2.notifyGroupsLabelChange(this.getGroupsLabel(index));
    });
  }
  registerEditorPartListeners(part, disposables) {
    disposables.add(part.onDidFocus(() => {
      this.doUpdateMostRecentActive(part, true);
      if (this._parts.size > 1) {
        this._onDidActiveGroupChange.fire(this.activeGroup);
      }
    }));
    disposables.add(toDisposable(() => this.doUpdateMostRecentActive(part)));
    disposables.add(part.onDidChangeActiveGroup((group) => this._onDidActiveGroupChange.fire(group)));
    disposables.add(part.onDidAddGroup((group) => this._onDidAddGroup.fire(group)));
    disposables.add(part.onDidRemoveGroup((group) => this._onDidRemoveGroup.fire(group)));
    disposables.add(part.onDidMoveGroup((group) => this._onDidMoveGroup.fire(group)));
    disposables.add(part.onDidActivateGroup((group) => this._onDidActivateGroup.fire(group)));
    disposables.add(part.onDidChangeGroupMaximized((maximized) => this._onDidChangeGroupMaximized.fire(maximized)));
    disposables.add(part.onDidChangeGroupIndex((group) => this._onDidChangeGroupIndex.fire(group)));
    disposables.add(part.onDidChangeGroupLocked((group) => this._onDidChangeGroupLocked.fire(group)));
  }
  doUpdateMostRecentActive(part, makeMostRecentlyActive) {
    const index = this.mostRecentActiveParts.indexOf(part);
    if (index !== -1) {
      this.mostRecentActiveParts.splice(index, 1);
    }
    if (makeMostRecentlyActive) {
      this.mostRecentActiveParts.unshift(part);
    }
  }
  getGroupsLabel(index) {
    return localize("groupLabel", "Window {0}", index + 1);
  }
  getPart(groupOrElement) {
    if (this._parts.size > 1) {
      if (isHTMLElement(groupOrElement)) {
        const element = groupOrElement;
        return this.getPartByDocument(element.ownerDocument);
      } else {
        const group = groupOrElement;
        let id;
        if (typeof group === "number") {
          id = group;
        } else {
          id = group.id;
        }
        for (const part of this._parts) {
          if (part.hasGroup(id)) {
            return part;
          }
        }
      }
    }
    return this.mainPart;
  }
  //#endregion
  //#region Lifecycle / State
  static EDITOR_PARTS_UI_STATE_STORAGE_KEY = "editorparts.state";
  workspaceMemento = this.getMemento(StorageScope.WORKSPACE, StorageTarget.USER);
  _isReady = false;
  get isReady() {
    return this._isReady;
  }
  whenReadyPromise = new DeferredPromise();
  whenReady = this.whenReadyPromise.p;
  whenRestoredPromise = new DeferredPromise();
  whenRestored = this.whenRestoredPromise.p;
  async restoreParts() {
    await this.mainPart.whenReady;
    if (this.mainPart.willRestoreState) {
      const state = this.loadState();
      if (state) {
        await this.restoreState(state);
      }
    }
    const mostRecentActivePart = this.mostRecentActiveParts.at(0);
    mostRecentActivePart?.activeGroup.focus();
    this._isReady = true;
    this.whenReadyPromise.complete();
    await Promise.allSettled(this.parts.map((part) => part.whenRestored));
    this.whenRestoredPromise.complete();
  }
  loadState() {
    return this.workspaceMemento[EditorParts.EDITOR_PARTS_UI_STATE_STORAGE_KEY];
  }
  saveState() {
    const state = this.createState();
    if (state.auxiliary.length === 0) {
      delete this.workspaceMemento[EditorParts.EDITOR_PARTS_UI_STATE_STORAGE_KEY];
    } else {
      this.workspaceMemento[EditorParts.EDITOR_PARTS_UI_STATE_STORAGE_KEY] = state;
    }
  }
  createState() {
    return {
      auxiliary: this.parts.filter((part) => part !== this.mainPart).map((part) => {
        const auxiliaryWindow = this.auxiliaryWindowService.getWindow(part.windowId);
        return {
          state: part.createState(),
          ...auxiliaryWindow?.createState()
        };
      }),
      mru: this.mostRecentActiveParts.map((part) => this.parts.indexOf(part))
    };
  }
  async restoreState(state) {
    if (state.auxiliary.length) {
      const auxiliaryEditorPartPromises = [];
      for (const auxiliaryEditorPartState of state.auxiliary) {
        auxiliaryEditorPartPromises.push(this.createAuxiliaryEditorPart(auxiliaryEditorPartState));
      }
      await Promise.allSettled(auxiliaryEditorPartPromises);
      if (state.mru.length === this.parts.length) {
        this.mostRecentActiveParts = state.mru.map((index) => this.parts[index]);
      } else {
        this.mostRecentActiveParts = [...this.parts];
      }
      await Promise.allSettled(this.parts.map((part) => part.whenReady));
    }
  }
  get hasRestorableState() {
    return this.parts.some((part) => part.hasRestorableState);
  }
  onDidChangeMementoState(e) {
    if (e.external && e.scope === StorageScope.WORKSPACE) {
      this.reloadMemento(e.scope);
      const state = this.loadState();
      if (state) {
        this.applyState(state);
      }
    }
  }
  async applyState(state) {
    for (const part of this.parts) {
      if (part === this.mainPart) {
        continue;
      }
      for (const group of part.getGroups(GroupsOrder.MOST_RECENTLY_ACTIVE)) {
        await group.closeAllEditors({ excludeConfirming: true });
      }
      const closed = part.close();
      if (!closed) {
        return false;
      }
    }
    if (state !== "empty") {
      await this.restoreState(state);
    }
    return true;
  }
  //#endregion
  //#region Working Sets
  static EDITOR_WORKING_SETS_STORAGE_KEY = "editor.workingSets";
  editorWorkingSets = (() => {
    const workingSetsRaw = this.storageService.get(EditorParts.EDITOR_WORKING_SETS_STORAGE_KEY, StorageScope.WORKSPACE);
    if (workingSetsRaw) {
      return JSON.parse(workingSetsRaw);
    }
    return [];
  })();
  saveWorkingSet(name) {
    const workingSet = {
      id: generateUuid(),
      name,
      main: this.mainPart.createState(),
      auxiliary: this.createState()
    };
    this.editorWorkingSets.push(workingSet);
    this.saveWorkingSets();
    return {
      id: workingSet.id,
      name: workingSet.name
    };
  }
  getWorkingSets() {
    return this.editorWorkingSets.map((workingSet) => ({ id: workingSet.id, name: workingSet.name }));
  }
  deleteWorkingSet(workingSet) {
    const index = this.indexOfWorkingSet(workingSet);
    if (typeof index === "number") {
      this.editorWorkingSets.splice(index, 1);
      this.saveWorkingSets();
    }
  }
  async applyWorkingSet(workingSet, options) {
    let workingSetState;
    if (workingSet === "empty") {
      workingSetState = "empty";
    } else {
      workingSetState = this.editorWorkingSets[this.indexOfWorkingSet(workingSet) ?? -1];
    }
    if (!workingSetState) {
      return false;
    }
    const applied = await this.applyState(workingSetState === "empty" ? workingSetState : workingSetState.auxiliary);
    if (!applied) {
      return false;
    }
    await this.mainPart.applyState(workingSetState === "empty" ? workingSetState : workingSetState.main, options);
    if (!options?.preserveFocus) {
      const mostRecentActivePart = this.mostRecentActiveParts.at(0);
      if (mostRecentActivePart) {
        await mostRecentActivePart.whenReady;
        mostRecentActivePart.activeGroup.focus();
      }
    }
    return true;
  }
  indexOfWorkingSet(workingSet) {
    for (let i = 0; i < this.editorWorkingSets.length; i++) {
      if (this.editorWorkingSets[i].id === workingSet.id) {
        return i;
      }
    }
    return void 0;
  }
  saveWorkingSets() {
    this.storageService.store(EditorParts.EDITOR_WORKING_SETS_STORAGE_KEY, JSON.stringify(this.editorWorkingSets), StorageScope.WORKSPACE, StorageTarget.MACHINE);
  }
  //#endregion
  //#region Events
  _onDidActiveGroupChange = this._register(new Emitter());
  onDidChangeActiveGroup = this._onDidActiveGroupChange.event;
  _onDidAddGroup = this._register(new Emitter());
  onDidAddGroup = this._onDidAddGroup.event;
  _onDidRemoveGroup = this._register(new Emitter());
  onDidRemoveGroup = this._onDidRemoveGroup.event;
  _onDidMoveGroup = this._register(new Emitter());
  onDidMoveGroup = this._onDidMoveGroup.event;
  _onDidActivateGroup = this._register(new Emitter());
  onDidActivateGroup = this._onDidActivateGroup.event;
  _onDidChangeGroupIndex = this._register(new Emitter());
  onDidChangeGroupIndex = this._onDidChangeGroupIndex.event;
  _onDidChangeGroupLocked = this._register(new Emitter());
  onDidChangeGroupLocked = this._onDidChangeGroupLocked.event;
  _onDidChangeGroupMaximized = this._register(new Emitter());
  onDidChangeGroupMaximized = this._onDidChangeGroupMaximized.event;
  //#endregion
  //#region Group Management
  get activeGroup() {
    return this.activePart.activeGroup;
  }
  get sideGroup() {
    return this.activePart.sideGroup;
  }
  get groups() {
    return this.getGroups();
  }
  get count() {
    return this.groups.length;
  }
  getGroups(order = GroupsOrder.CREATION_TIME) {
    if (this._parts.size > 1) {
      let parts;
      switch (order) {
        case GroupsOrder.GRID_APPEARANCE:
        // we currently do not have a way to compute by appearance over multiple windows
        case GroupsOrder.CREATION_TIME:
          parts = this.parts;
          break;
        case GroupsOrder.MOST_RECENTLY_ACTIVE:
          parts = distinct([...this.mostRecentActiveParts, ...this.parts]);
          break;
      }
      return parts.map((part) => part.getGroups(order)).flat();
    }
    return this.mainPart.getGroups(order);
  }
  getGroup(identifier) {
    if (this._parts.size > 1) {
      for (const part of this._parts) {
        const group = part.getGroup(identifier);
        if (group) {
          return group;
        }
      }
    }
    return this.mainPart.getGroup(identifier);
  }
  assertGroupView(group) {
    let groupView;
    if (typeof group === "number") {
      groupView = this.getGroup(group);
    } else {
      groupView = group;
    }
    if (!groupView) {
      throw new Error("Invalid editor group provided!");
    }
    return groupView;
  }
  activateGroup(group) {
    return this.getPart(group).activateGroup(group);
  }
  getSize(group) {
    return this.getPart(group).getSize(group);
  }
  setSize(group, size) {
    this.getPart(group).setSize(group, size);
  }
  arrangeGroups(arrangement, group = this.activePart.activeGroup) {
    this.getPart(group).arrangeGroups(arrangement, group);
  }
  toggleMaximizeGroup(group = this.activePart.activeGroup) {
    this.getPart(group).toggleMaximizeGroup(group);
  }
  toggleExpandGroup(group = this.activePart.activeGroup) {
    this.getPart(group).toggleExpandGroup(group);
  }
  restoreGroup(group) {
    return this.getPart(group).restoreGroup(group);
  }
  applyLayout(layout) {
    this.activePart.applyLayout(layout);
  }
  getLayout() {
    return this.activePart.getLayout();
  }
  get orientation() {
    return this.activePart.orientation;
  }
  setGroupOrientation(orientation) {
    this.activePart.setGroupOrientation(orientation);
  }
  findGroup(scope, source = this.activeGroup, wrap) {
    const sourcePart = this.getPart(source);
    if (this._parts.size > 1) {
      const groups = this.getGroups(GroupsOrder.GRID_APPEARANCE);
      if (scope.location === GroupLocation.FIRST || scope.location === GroupLocation.LAST) {
        return scope.location === GroupLocation.FIRST ? groups[0] : groups[groups.length - 1];
      }
      const group = sourcePart.findGroup(scope, source, false);
      if (group) {
        return group;
      }
      if (scope.location === GroupLocation.NEXT || scope.location === GroupLocation.PREVIOUS) {
        const sourceGroup = this.assertGroupView(source);
        const index = groups.indexOf(sourceGroup);
        if (scope.location === GroupLocation.NEXT) {
          let nextGroup = groups[index + 1];
          if (!nextGroup && wrap) {
            nextGroup = groups[0];
          }
          return nextGroup;
        } else {
          let previousGroup = groups[index - 1];
          if (!previousGroup && wrap) {
            previousGroup = groups[groups.length - 1];
          }
          return previousGroup;
        }
      }
    }
    return sourcePart.findGroup(scope, source, wrap);
  }
  addGroup(location, direction) {
    return this.getPart(location).addGroup(location, direction);
  }
  removeGroup(group) {
    this.getPart(group).removeGroup(group);
  }
  moveGroup(group, location, direction) {
    return this.getPart(group).moveGroup(group, location, direction);
  }
  mergeGroup(group, target, options) {
    return this.getPart(group).mergeGroup(group, target, options);
  }
  mergeAllGroups(target, options) {
    return this.activePart.mergeAllGroups(target, options);
  }
  copyGroup(group, location, direction) {
    return this.getPart(group).copyGroup(group, location, direction);
  }
  createEditorDropTarget(container, delegate) {
    return this.getPart(container).createEditorDropTarget(container, delegate);
  }
  //#endregion
  //#region Editor Group Context Key Handling
  globalContextKeys = /* @__PURE__ */ new Map();
  scopedContextKeys = /* @__PURE__ */ new Map();
  registerGroupsContextKeyListeners() {
    this._register(this.onDidChangeActiveGroup(() => this.updateGlobalContextKeys()));
    this.groups.forEach((group) => this.registerGroupContextKeyProvidersListeners(group));
    this._register(this.onDidAddGroup((group) => this.registerGroupContextKeyProvidersListeners(group)));
    this._register(this.onDidRemoveGroup((group) => {
      this.scopedContextKeys.delete(group.id);
      this.registeredContextKeys.delete(group.id);
      this.contextKeyProviderDisposables.deleteAndDispose(group.id);
    }));
  }
  updateGlobalContextKeys() {
    const activeGroupScopedContextKeys = this.scopedContextKeys.get(this.activeGroup.id);
    if (!activeGroupScopedContextKeys) {
      return;
    }
    for (const [key, globalContextKey] of this.globalContextKeys) {
      const scopedContextKey = activeGroupScopedContextKeys.get(key);
      if (scopedContextKey) {
        globalContextKey.set(scopedContextKey.get());
      } else {
        globalContextKey.reset();
      }
    }
  }
  bind(contextKey, group) {
    let globalContextKey = this.globalContextKeys.get(contextKey.key);
    if (!globalContextKey) {
      globalContextKey = contextKey.bindTo(this.contextKeyService);
      this.globalContextKeys.set(contextKey.key, globalContextKey);
    }
    let groupScopedContextKeys = this.scopedContextKeys.get(group.id);
    if (!groupScopedContextKeys) {
      groupScopedContextKeys = /* @__PURE__ */ new Map();
      this.scopedContextKeys.set(group.id, groupScopedContextKeys);
    }
    let scopedContextKey = groupScopedContextKeys.get(contextKey.key);
    if (!scopedContextKey) {
      scopedContextKey = contextKey.bindTo(group.scopedContextKeyService);
      groupScopedContextKeys.set(contextKey.key, scopedContextKey);
    }
    const that = this;
    return {
      get() {
        return scopedContextKey.get();
      },
      set(value) {
        if (that.activeGroup === group) {
          globalContextKey.set(value);
        }
        scopedContextKey.set(value);
      },
      reset() {
        if (that.activeGroup === group) {
          globalContextKey.reset();
        }
        scopedContextKey.reset();
      }
    };
  }
  contextKeyProviders = /* @__PURE__ */ new Map();
  registeredContextKeys = /* @__PURE__ */ new Map();
  registerContextKeyProvider(provider) {
    if (this.contextKeyProviders.has(provider.contextKey.key) || this.globalContextKeys.has(provider.contextKey.key)) {
      throw new Error(`A context key provider for key ${provider.contextKey.key} already exists.`);
    }
    this.contextKeyProviders.set(provider.contextKey.key, provider);
    const setContextKeyForGroups = /* @__PURE__ */ __name(() => {
      for (const group of this.groups) {
        this.updateRegisteredContextKey(group, provider);
      }
    }, "setContextKeyForGroups");
    setContextKeyForGroups();
    const onDidChange = provider.onDidChange?.(() => setContextKeyForGroups());
    return toDisposable(() => {
      onDidChange?.dispose();
      this.globalContextKeys.delete(provider.contextKey.key);
      this.scopedContextKeys.forEach((scopedContextKeys) => scopedContextKeys.delete(provider.contextKey.key));
      this.contextKeyProviders.delete(provider.contextKey.key);
      this.registeredContextKeys.forEach((registeredContextKeys) => registeredContextKeys.delete(provider.contextKey.key));
    });
  }
  contextKeyProviderDisposables = this._register(new DisposableMap());
  registerGroupContextKeyProvidersListeners(group) {
    const disposable = group.onDidActiveEditorChange(() => {
      for (const contextKeyProvider of this.contextKeyProviders.values()) {
        this.updateRegisteredContextKey(group, contextKeyProvider);
      }
    });
    this.contextKeyProviderDisposables.set(group.id, disposable);
  }
  updateRegisteredContextKey(group, provider) {
    let groupRegisteredContextKeys = this.registeredContextKeys.get(group.id);
    if (!groupRegisteredContextKeys) {
      groupRegisteredContextKeys = /* @__PURE__ */ new Map();
      this.registeredContextKeys.set(group.id, groupRegisteredContextKeys);
    }
    let scopedRegisteredContextKey = groupRegisteredContextKeys.get(provider.contextKey.key);
    if (!scopedRegisteredContextKey) {
      scopedRegisteredContextKey = this.bind(provider.contextKey, group);
      groupRegisteredContextKeys.set(provider.contextKey.key, scopedRegisteredContextKey);
    }
    scopedRegisteredContextKey.set(provider.getGroupContextKeyValue(group));
  }
  //#endregion
  //#region Main Editor Part Only
  get partOptions() {
    return this.mainPart.partOptions;
  }
  get onDidChangeEditorPartOptions() {
    return this.mainPart.onDidChangeEditorPartOptions;
  }
  //#endregion
};
EditorParts = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IStorageService),
  __decorateParam(2, IThemeService),
  __decorateParam(3, IAuxiliaryWindowService),
  __decorateParam(4, IContextKeyService)
], EditorParts);
registerSingleton(IEditorGroupsService, EditorParts, InstantiationType.Eager);
export {
  EditorParts
};
//# sourceMappingURL=editorParts.js.map
