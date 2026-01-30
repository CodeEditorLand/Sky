var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = function(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
};
var EditorResolverService_1;
import * as glob from "../../../../base/common/glob.js";
import { distinct, insert } from "../../../../base/common/arrays.js";
import { Disposable, DisposableStore, toDisposable } from "../../../../base/common/lifecycle.js";
import { basename, extname, isEqual } from "../../../../base/common/resources.js";
import { URI } from "../../../../base/common/uri.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { EditorActivation, EditorResolution } from "../../../../platform/editor/common/editor.js";
import { DEFAULT_EDITOR_ASSOCIATION, EditorResourceAccessor, isEditorInputWithOptions, isEditorInputWithOptionsAndGroup, isResourceDiffEditorInput, isResourceSideBySideEditorInput, isUntitledResourceEditorInput, isResourceMergeEditorInput, SideBySideEditor, isResourceMultiDiffEditorInput } from "../../../common/editor.js";
import { IEditorGroupsService } from "../common/editorGroupsService.js";
import { Schemas } from "../../../../base/common/network.js";
import { RegisteredEditorPriority, editorsAssociationsSettingId, globMatchesResource, IEditorResolverService, priorityToRank } from "../common/editorResolverService.js";
import { IQuickInputService } from "../../../../platform/quickinput/common/quickInput.js";
import { localize } from "../../../../nls.js";
import { INotificationService, Severity } from "../../../../platform/notification/common/notification.js";
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { IExtensionService } from "../../extensions/common/extensions.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { findGroup } from "../common/editorGroupFinder.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { SideBySideEditorInput } from "../../../common/editor/sideBySideEditorInput.js";
import { PauseableEmitter } from "../../../../base/common/event.js";
let EditorResolverService = class EditorResolverService2 extends Disposable {
  static {
    __name(this, "EditorResolverService");
  }
  static {
    EditorResolverService_1 = this;
  }
  static {
    this.configureDefaultID = "promptOpenWith.configureDefault";
  }
  static {
    this.cacheStorageID = "editorOverrideService.cache";
  }
  static {
    this.conflictingDefaultsStorageID = "editorOverrideService.conflictingDefaults";
  }
  constructor(editorGroupService, instantiationService, configurationService, quickInputService, notificationService, storageService, extensionService, logService) {
    super();
    this.editorGroupService = editorGroupService;
    this.instantiationService = instantiationService;
    this.configurationService = configurationService;
    this.quickInputService = quickInputService;
    this.notificationService = notificationService;
    this.storageService = storageService;
    this.extensionService = extensionService;
    this.logService = logService;
    this._onDidChangeEditorRegistrations = this._register(new PauseableEmitter());
    this.onDidChangeEditorRegistrations = this._onDidChangeEditorRegistrations.event;
    this._editors = /* @__PURE__ */ new Map();
    this._flattenedEditors = /* @__PURE__ */ new Map();
    this._shouldReFlattenEditors = true;
    this.cache = new Set(JSON.parse(this.storageService.get(EditorResolverService_1.cacheStorageID, 0, JSON.stringify([]))));
    this.storageService.remove(
      EditorResolverService_1.cacheStorageID,
      0
      /* StorageScope.PROFILE */
    );
    this._register(this.storageService.onWillSaveState(() => {
      this.cacheEditors();
    }));
    this._register(this.extensionService.onDidRegisterExtensions(() => {
      this.cache = void 0;
    }));
  }
  resolveUntypedInputAndGroup(editor, preferredGroup) {
    const untypedEditor = editor;
    const findGroupResult = this.instantiationService.invokeFunction(findGroup, untypedEditor, preferredGroup);
    if (findGroupResult instanceof Promise) {
      return findGroupResult.then(([group, activation]) => [untypedEditor, group, activation]);
    } else {
      const [group, activation] = findGroupResult;
      return [untypedEditor, group, activation];
    }
  }
  async resolveEditor(editor, preferredGroup) {
    this._flattenedEditors = this._flattenEditorsMap();
    if (isResourceSideBySideEditorInput(editor)) {
      return this.doResolveSideBySideEditor(editor, preferredGroup);
    }
    let resolvedUntypedAndGroup;
    const resolvedUntypedAndGroupResult = this.resolveUntypedInputAndGroup(editor, preferredGroup);
    if (resolvedUntypedAndGroupResult instanceof Promise) {
      resolvedUntypedAndGroup = await resolvedUntypedAndGroupResult;
    } else {
      resolvedUntypedAndGroup = resolvedUntypedAndGroupResult;
    }
    if (!resolvedUntypedAndGroup) {
      return 2;
    }
    const [untypedEditor, group, activation] = resolvedUntypedAndGroup;
    if (activation) {
      untypedEditor.options = { ...untypedEditor.options, activation };
    }
    let resource = EditorResourceAccessor.getCanonicalUri(untypedEditor, { supportSideBySide: SideBySideEditor.PRIMARY });
    if (this.cache && resource && this.resourceMatchesCache(resource)) {
      await this.extensionService.whenInstalledExtensionsRegistered();
    }
    if (resource === void 0) {
      resource = URI.from({ scheme: Schemas.untitled });
    } else if (resource.scheme === void 0 || resource === null) {
      return 2;
    }
    if (untypedEditor.options?.override === EditorResolution.PICK) {
      const picked = await this.doPickEditor(untypedEditor);
      if (!picked) {
        return 1;
      }
      untypedEditor.options = picked;
    }
    let { editor: selectedEditor, conflictingDefault } = this.getEditor(resource, untypedEditor.options?.override);
    if (!selectedEditor && (untypedEditor.options?.override || isEditorInputWithOptions(editor))) {
      return 2;
    } else if (!selectedEditor) {
      const resolvedEditor = this.getEditor(resource, DEFAULT_EDITOR_ASSOCIATION.id);
      selectedEditor = resolvedEditor?.editor;
      conflictingDefault = resolvedEditor?.conflictingDefault;
      if (!selectedEditor) {
        return 2;
      }
    }
    if (isResourceDiffEditorInput(untypedEditor) && untypedEditor.options?.override === void 0) {
      let resource2 = EditorResourceAccessor.getCanonicalUri(untypedEditor, { supportSideBySide: SideBySideEditor.SECONDARY });
      if (!resource2) {
        resource2 = URI.from({ scheme: Schemas.untitled });
      }
      const { editor: selectedEditor2 } = this.getEditor(resource2, void 0);
      if (!selectedEditor2 || selectedEditor.editorInfo.id !== selectedEditor2.editorInfo.id) {
        const { editor: selectedDiff, conflictingDefault: conflictingDefaultDiff } = this.getEditor(resource, DEFAULT_EDITOR_ASSOCIATION.id);
        selectedEditor = selectedDiff;
        conflictingDefault = conflictingDefaultDiff;
      }
      if (!selectedEditor) {
        return 2;
      }
    }
    untypedEditor.options = { override: selectedEditor.editorInfo.id, ...untypedEditor.options };
    if (selectedEditor.editorFactoryObject.createDiffEditorInput === void 0 && isResourceDiffEditorInput(untypedEditor)) {
      return 2;
    }
    const input = await this.doResolveEditor(untypedEditor, group, selectedEditor);
    if (conflictingDefault && input) {
      await this.doHandleConflictingDefaults(resource, selectedEditor.editorInfo.label, untypedEditor, input.editor, group);
    }
    if (input) {
      if (input.editor.editorId !== selectedEditor.editorInfo.id) {
        this.logService.warn(`Editor ID Mismatch: ${input.editor.editorId} !== ${selectedEditor.editorInfo.id}. This will cause bugs. Please ensure editorInput.editorId matches the registered id`);
      }
      return { ...input, group };
    }
    return 1;
  }
  async doResolveSideBySideEditor(editor, preferredGroup) {
    const primaryResolvedEditor = await this.resolveEditor(editor.primary, preferredGroup);
    if (!isEditorInputWithOptionsAndGroup(primaryResolvedEditor)) {
      return 2;
    }
    const secondaryResolvedEditor = await this.resolveEditor(editor.secondary, primaryResolvedEditor.group ?? preferredGroup);
    if (!isEditorInputWithOptionsAndGroup(secondaryResolvedEditor)) {
      return 2;
    }
    return {
      group: primaryResolvedEditor.group ?? secondaryResolvedEditor.group,
      editor: this.instantiationService.createInstance(SideBySideEditorInput, editor.label, editor.description, secondaryResolvedEditor.editor, primaryResolvedEditor.editor),
      options: editor.options
    };
  }
  bufferChangeEvents(callback) {
    this._onDidChangeEditorRegistrations.pause();
    try {
      callback();
    } finally {
      this._onDidChangeEditorRegistrations.resume();
    }
  }
  registerEditor(globPattern, editorInfo, options, editorFactoryObject) {
    let registeredEditor = this._editors.get(globPattern);
    if (registeredEditor === void 0) {
      registeredEditor = /* @__PURE__ */ new Map();
      this._editors.set(globPattern, registeredEditor);
    }
    let editorsWithId = registeredEditor.get(editorInfo.id);
    if (editorsWithId === void 0) {
      editorsWithId = [];
    }
    const remove = insert(editorsWithId, {
      globPattern,
      editorInfo,
      options,
      editorFactoryObject
    });
    registeredEditor.set(editorInfo.id, editorsWithId);
    this._shouldReFlattenEditors = true;
    this._onDidChangeEditorRegistrations.fire();
    return toDisposable(() => {
      remove();
      if (editorsWithId && editorsWithId.length === 0) {
        registeredEditor?.delete(editorInfo.id);
      }
      this._shouldReFlattenEditors = true;
      this._onDidChangeEditorRegistrations.fire();
    });
  }
  getAssociationsForResource(resource) {
    const associations = this.getAllUserAssociations();
    let matchingAssociations = associations.filter((association) => association.filenamePattern && globMatchesResource(association.filenamePattern, resource));
    matchingAssociations = matchingAssociations.sort((a, b) => (b.filenamePattern?.length ?? 0) - (a.filenamePattern?.length ?? 0));
    const allEditors = this._registeredEditors;
    return matchingAssociations.filter((association) => allEditors.find((c) => c.editorInfo.id === association.viewType));
  }
  getAllUserAssociations() {
    const inspectedEditorAssociations = this.configurationService.inspect(editorsAssociationsSettingId) || {};
    const defaultAssociations = inspectedEditorAssociations.defaultValue ?? {};
    const workspaceAssociations = inspectedEditorAssociations.workspaceValue ?? {};
    const userAssociations = inspectedEditorAssociations.userValue ?? {};
    const rawAssociations = { ...workspaceAssociations };
    for (const [key, value] of Object.entries({ ...defaultAssociations, ...userAssociations })) {
      if (rawAssociations[key] === void 0) {
        rawAssociations[key] = value;
      }
    }
    const associations = [];
    for (const [key, value] of Object.entries(rawAssociations)) {
      const association = {
        filenamePattern: key,
        viewType: value
      };
      associations.push(association);
    }
    return associations;
  }
  /**
   * Given the nested nature of the editors map, we merge factories of the same glob and id to make it flat
   * and easier to work with
   */
  _flattenEditorsMap() {
    if (!this._shouldReFlattenEditors) {
      return this._flattenedEditors;
    }
    this._shouldReFlattenEditors = false;
    const editors = /* @__PURE__ */ new Map();
    for (const [glob2, value] of this._editors) {
      const registeredEditors = [];
      for (const editors2 of value.values()) {
        let registeredEditor = void 0;
        for (const editor of editors2) {
          if (!registeredEditor) {
            registeredEditor = {
              editorInfo: editor.editorInfo,
              globPattern: editor.globPattern,
              options: {},
              editorFactoryObject: {}
            };
          }
          registeredEditor.options = { ...registeredEditor.options, ...editor.options };
          registeredEditor.editorFactoryObject = { ...registeredEditor.editorFactoryObject, ...editor.editorFactoryObject };
        }
        if (registeredEditor) {
          registeredEditors.push(registeredEditor);
        }
      }
      editors.set(glob2, registeredEditors);
    }
    return editors;
  }
  /**
   * Returns all editors as an array. Possible to contain duplicates
   */
  get _registeredEditors() {
    return Array.from(this._flattenedEditors.values()).flat();
  }
  updateUserAssociations(globPattern, editorID) {
    const newAssociation = { viewType: editorID, filenamePattern: globPattern };
    const currentAssociations = this.getAllUserAssociations();
    const newSettingObject = /* @__PURE__ */ Object.create(null);
    for (const association of [...currentAssociations, newAssociation]) {
      if (association.filenamePattern) {
        newSettingObject[association.filenamePattern] = association.viewType;
      }
    }
    this.configurationService.updateValue(editorsAssociationsSettingId, newSettingObject);
  }
  findMatchingEditors(resource) {
    const userSettings = this.getAssociationsForResource(resource);
    const matchingEditors = [];
    for (const [key, editors] of this._flattenedEditors) {
      for (const editor of editors) {
        const foundInSettings = userSettings.find((setting) => setting.viewType === editor.editorInfo.id);
        if (foundInSettings && editor.editorInfo.priority !== RegisteredEditorPriority.exclusive || globMatchesResource(key, resource)) {
          matchingEditors.push(editor);
        }
      }
    }
    return matchingEditors.sort((a, b) => {
      if (priorityToRank(b.editorInfo.priority) === priorityToRank(a.editorInfo.priority) && typeof b.globPattern === "string" && typeof a.globPattern === "string") {
        return b.globPattern.length - a.globPattern.length;
      }
      return priorityToRank(b.editorInfo.priority) - priorityToRank(a.editorInfo.priority);
    });
  }
  getEditors(resource) {
    this._flattenedEditors = this._flattenEditorsMap();
    if (URI.isUri(resource)) {
      const editors = this.findMatchingEditors(resource);
      if (editors.find((e) => e.editorInfo.priority === RegisteredEditorPriority.exclusive)) {
        return [];
      }
      return editors.map((editor) => editor.editorInfo);
    }
    return distinct(this._registeredEditors.map((editor) => editor.editorInfo), (editor) => editor.id);
  }
  /**
   * Given a resource and an editorId selects the best possible editor
   * @returns The editor and whether there was another default which conflicted with it
   */
  getEditor(resource, editorId) {
    const findMatchingEditor = /* @__PURE__ */ __name((editors2, viewType) => {
      return editors2.find((editor) => {
        if (editor.options?.canSupportResource !== void 0) {
          return editor.editorInfo.id === viewType && editor.options.canSupportResource(resource);
        }
        return editor.editorInfo.id === viewType;
      });
    }, "findMatchingEditor");
    if (editorId && editorId !== EditorResolution.EXCLUSIVE_ONLY) {
      const registeredEditors = this._registeredEditors;
      return {
        editor: findMatchingEditor(registeredEditors, editorId),
        conflictingDefault: false
      };
    }
    const editors = this.findMatchingEditors(resource);
    const associationsFromSetting = this.getAssociationsForResource(resource);
    const minPriority = editorId === EditorResolution.EXCLUSIVE_ONLY ? RegisteredEditorPriority.exclusive : RegisteredEditorPriority.builtin;
    let possibleEditors = editors.filter((editor) => priorityToRank(editor.editorInfo.priority) >= priorityToRank(minPriority) && editor.editorInfo.id !== DEFAULT_EDITOR_ASSOCIATION.id);
    if (possibleEditors.length === 0) {
      return {
        editor: associationsFromSetting[0] && minPriority !== RegisteredEditorPriority.exclusive ? findMatchingEditor(editors, associationsFromSetting[0].viewType) : void 0,
        conflictingDefault: false
      };
    }
    const selectedViewType = possibleEditors[0].editorInfo.priority === RegisteredEditorPriority.exclusive ? possibleEditors[0].editorInfo.id : associationsFromSetting[0]?.viewType || possibleEditors.find((editor) => !editor.options?.canSupportResource || editor.options.canSupportResource(resource))?.editorInfo.id || possibleEditors[0].editorInfo.id;
    let conflictingDefault = false;
    possibleEditors = possibleEditors.filter((editor) => editor.editorInfo.priority !== RegisteredEditorPriority.exclusive).filter((editor) => !editor.options?.canSupportResource || editor.options.canSupportResource(resource));
    if (associationsFromSetting.length === 0 && possibleEditors.length > 1) {
      conflictingDefault = true;
    }
    return {
      editor: findMatchingEditor(editors, selectedViewType),
      conflictingDefault
    };
  }
  async doResolveEditor(editor, group, selectedEditor) {
    let options = editor.options;
    const resource = EditorResourceAccessor.getCanonicalUri(editor, { supportSideBySide: SideBySideEditor.PRIMARY });
    if (options && typeof options.activation === "undefined") {
      options = { ...options, activation: options.preserveFocus ? EditorActivation.RESTORE : void 0 };
    }
    if (isResourceMergeEditorInput(editor)) {
      if (!selectedEditor.editorFactoryObject.createMergeEditorInput) {
        return;
      }
      const inputWithOptions2 = await selectedEditor.editorFactoryObject.createMergeEditorInput(editor, group);
      return { editor: inputWithOptions2.editor, options: inputWithOptions2.options ?? options };
    }
    if (isResourceDiffEditorInput(editor)) {
      if (!selectedEditor.editorFactoryObject.createDiffEditorInput) {
        return;
      }
      const inputWithOptions2 = await selectedEditor.editorFactoryObject.createDiffEditorInput(editor, group);
      return { editor: inputWithOptions2.editor, options: inputWithOptions2.options ?? options };
    }
    if (isResourceMultiDiffEditorInput(editor)) {
      if (!selectedEditor.editorFactoryObject.createMultiDiffEditorInput) {
        return;
      }
      const inputWithOptions2 = await selectedEditor.editorFactoryObject.createMultiDiffEditorInput(editor, group);
      return { editor: inputWithOptions2.editor, options: inputWithOptions2.options ?? options };
    }
    if (isResourceSideBySideEditorInput(editor)) {
      throw new Error(`Untyped side by side editor input not supported here.`);
    }
    if (isUntitledResourceEditorInput(editor)) {
      if (!selectedEditor.editorFactoryObject.createUntitledEditorInput) {
        return;
      }
      const inputWithOptions2 = await selectedEditor.editorFactoryObject.createUntitledEditorInput(editor, group);
      return { editor: inputWithOptions2.editor, options: inputWithOptions2.options ?? options };
    }
    if (resource === void 0) {
      throw new Error(`Undefined resource on non untitled editor input.`);
    }
    const singleEditorPerResource = typeof selectedEditor.options?.singlePerResource === "function" ? selectedEditor.options.singlePerResource() : selectedEditor.options?.singlePerResource;
    if (singleEditorPerResource) {
      const existingEditors = this.findExistingEditorsForResource(resource, selectedEditor.editorInfo.id);
      if (existingEditors.length) {
        const editor2 = await this.moveExistingEditorForResource(existingEditors, group);
        if (editor2) {
          return { editor: editor2, options };
        } else {
          return;
        }
      }
    }
    if (!selectedEditor.editorFactoryObject.createEditorInput) {
      return;
    }
    const inputWithOptions = await selectedEditor.editorFactoryObject.createEditorInput(editor, group);
    options = inputWithOptions.options ?? options;
    const input = inputWithOptions.editor;
    return { editor: input, options };
  }
  /**
   * Moves the first existing editor for a resource to the target group unless already opened there.
   * Additionally will close any other editors that are open for that resource and viewtype besides the first one found
   * @param resource The resource of the editor
   * @param viewType the viewtype of the editor
   * @param targetGroup The group to move it to
   * @returns The moved editor input or `undefined` if the editor could not be moved
   */
  async moveExistingEditorForResource(existingEditorsForResource, targetGroup) {
    const editorToUse = existingEditorsForResource[0];
    for (const { editor, group } of existingEditorsForResource) {
      if (editor !== editorToUse.editor) {
        const closed = await group.closeEditor(editor);
        if (!closed) {
          return;
        }
      }
    }
    if (targetGroup.id !== editorToUse.group.id) {
      const moved = editorToUse.group.moveEditor(editorToUse.editor, targetGroup);
      if (!moved) {
        return;
      }
    }
    return editorToUse.editor;
  }
  /**
   * Given a resource and an editorId, returns all editors open for that resource and editorId.
   * @param resource The resource specified
   * @param editorId The editorID
   * @returns A list of editors
   */
  findExistingEditorsForResource(resource, editorId) {
    const out = [];
    const orderedGroups = distinct([
      ...this.editorGroupService.groups
    ]);
    for (const group of orderedGroups) {
      for (const editor of group.editors) {
        if (isEqual(editor.resource, resource) && editor.editorId === editorId) {
          out.push({ editor, group });
        }
      }
    }
    return out;
  }
  async doHandleConflictingDefaults(resource, editorName, untypedInput, currentEditor, group) {
    const editors = this.findMatchingEditors(resource);
    const storedChoices = JSON.parse(this.storageService.get(EditorResolverService_1.conflictingDefaultsStorageID, 0, "{}"));
    const globForResource = `*${extname(resource)}`;
    const writeCurrentEditorsToStorage = /* @__PURE__ */ __name(() => {
      storedChoices[globForResource] = [];
      editors.forEach((editor) => storedChoices[globForResource].push(editor.editorInfo.id));
      this.storageService.store(
        EditorResolverService_1.conflictingDefaultsStorageID,
        JSON.stringify(storedChoices),
        0,
        1
        /* StorageTarget.MACHINE */
      );
    }, "writeCurrentEditorsToStorage");
    if (storedChoices[globForResource]?.find((editorID) => editorID === currentEditor.editorId)) {
      return;
    }
    const handle = this.notificationService.prompt(Severity.Warning, localize("editorResolver.conflictingDefaults", "There are multiple default editors available for the resource."), [
      {
        label: localize("editorResolver.configureDefault", "Configure Default"),
        run: /* @__PURE__ */ __name(async () => {
          const picked = await this.doPickEditor(untypedInput, true);
          if (!picked) {
            return;
          }
          untypedInput.options = picked;
          const replacementEditor = await this.resolveEditor(untypedInput, group);
          if (replacementEditor === 1 || replacementEditor === 2) {
            return;
          }
          group.replaceEditors([
            {
              editor: currentEditor,
              replacement: replacementEditor.editor,
              options: replacementEditor.options ?? picked
            }
          ]);
        }, "run")
      },
      {
        label: localize("editorResolver.keepDefault", "Keep {0}", editorName),
        run: writeCurrentEditorsToStorage
      }
    ]);
    const onCloseListener = handle.onDidClose(() => {
      writeCurrentEditorsToStorage();
      onCloseListener.dispose();
    });
  }
  mapEditorsToQuickPickEntry(resource, showDefaultPicker) {
    const currentEditor = this.editorGroupService.activeGroup.findEditors(resource).at(0);
    let registeredEditors = resource.scheme === Schemas.untitled ? this._registeredEditors.filter((e) => e.editorInfo.priority !== RegisteredEditorPriority.exclusive) : this.findMatchingEditors(resource);
    registeredEditors = distinct(registeredEditors, (c) => c.editorInfo.id);
    const defaultSetting = this.getAssociationsForResource(resource)[0]?.viewType;
    registeredEditors = registeredEditors.sort((a, b) => {
      if (a.editorInfo.id === DEFAULT_EDITOR_ASSOCIATION.id) {
        return -1;
      } else if (b.editorInfo.id === DEFAULT_EDITOR_ASSOCIATION.id) {
        return 1;
      } else {
        return priorityToRank(b.editorInfo.priority) - priorityToRank(a.editorInfo.priority);
      }
    });
    const quickPickEntries = [];
    const currentlyActiveLabel = localize("promptOpenWith.currentlyActive", "Active");
    const currentDefaultLabel = localize("promptOpenWith.currentDefault", "Default");
    const currentDefaultAndActiveLabel = localize("promptOpenWith.currentDefaultAndActive", "Active and Default");
    let defaultViewType = defaultSetting;
    if (!defaultViewType && registeredEditors.length > 2 && registeredEditors[1]?.editorInfo.priority !== RegisteredEditorPriority.option) {
      defaultViewType = registeredEditors[1]?.editorInfo.id;
    }
    if (!defaultViewType) {
      defaultViewType = DEFAULT_EDITOR_ASSOCIATION.id;
    }
    registeredEditors.forEach((editor) => {
      const currentViewType = currentEditor?.editorId ?? DEFAULT_EDITOR_ASSOCIATION.id;
      const isActive = currentEditor ? editor.editorInfo.id === currentViewType : false;
      const isDefault = editor.editorInfo.id === defaultViewType;
      const quickPickEntry = {
        id: editor.editorInfo.id,
        label: editor.editorInfo.label,
        description: isActive && isDefault ? currentDefaultAndActiveLabel : isActive ? currentlyActiveLabel : isDefault ? currentDefaultLabel : void 0,
        detail: editor.editorInfo.detail ?? editor.editorInfo.priority
      };
      quickPickEntries.push(quickPickEntry);
    });
    if (!showDefaultPicker && extname(resource) !== "") {
      const separator = { type: "separator" };
      quickPickEntries.push(separator);
      const configureDefaultEntry = {
        id: EditorResolverService_1.configureDefaultID,
        label: localize("promptOpenWith.configureDefault", "Configure default editor for '{0}'...", `*${extname(resource)}`)
      };
      quickPickEntries.push(configureDefaultEntry);
    }
    return quickPickEntries;
  }
  async doPickEditor(editor, showDefaultPicker) {
    let resource = EditorResourceAccessor.getOriginalUri(editor, { supportSideBySide: SideBySideEditor.PRIMARY });
    if (resource === void 0) {
      resource = URI.from({ scheme: Schemas.untitled });
    }
    const editorPicks = this.mapEditorsToQuickPickEntry(resource, showDefaultPicker);
    const disposables = new DisposableStore();
    const editorPicker = disposables.add(this.quickInputService.createQuickPick({ useSeparators: true }));
    const placeHolderMessage = showDefaultPicker ? localize("promptOpenWith.updateDefaultPlaceHolder", "Select new default editor for '{0}'", `*${extname(resource)}`) : localize("promptOpenWith.placeHolder", "Select editor for '{0}'", basename(resource));
    editorPicker.placeholder = placeHolderMessage;
    editorPicker.canAcceptInBackground = true;
    editorPicker.items = editorPicks;
    const firstItem = editorPicker.items.find((item) => item.type === "item");
    if (firstItem) {
      editorPicker.selectedItems = [firstItem];
    }
    const picked = await new Promise((resolve) => {
      disposables.add(editorPicker.onDidAccept((e) => {
        let result = void 0;
        if (editorPicker.selectedItems.length === 1) {
          result = {
            item: editorPicker.selectedItems[0],
            keyMods: editorPicker.keyMods,
            openInBackground: e.inBackground
          };
        }
        if (resource && showDefaultPicker && result?.item.id) {
          this.updateUserAssociations(`*${extname(resource)}`, result.item.id);
        }
        resolve(result);
      }));
      disposables.add(editorPicker.onDidHide(() => {
        disposables.dispose();
        resolve(void 0);
      }));
      disposables.add(editorPicker.onDidTriggerItemButton((e) => {
        resolve({ item: e.item, openInBackground: false });
        if (resource && e.item?.id) {
          this.updateUserAssociations(`*${extname(resource)}`, e.item.id);
        }
      }));
      editorPicker.show();
    });
    editorPicker.dispose();
    if (picked) {
      if (picked.item.id === EditorResolverService_1.configureDefaultID) {
        return this.doPickEditor(editor, true);
      }
      const targetOptions = {
        ...editor.options,
        override: picked.item.id,
        preserveFocus: picked.openInBackground || editor.options?.preserveFocus
      };
      return targetOptions;
    }
    return void 0;
  }
  cacheEditors() {
    const cacheStorage = /* @__PURE__ */ new Set();
    for (const [globPattern, contribPoint] of this._flattenedEditors) {
      const nonOptional = !!contribPoint.find((c) => c.editorInfo.priority !== RegisteredEditorPriority.option && c.editorInfo.id !== DEFAULT_EDITOR_ASSOCIATION.id);
      if (!nonOptional) {
        continue;
      }
      if (glob.isRelativePattern(globPattern)) {
        cacheStorage.add(`${globPattern.pattern}`);
      } else {
        cacheStorage.add(globPattern);
      }
    }
    const userAssociations = this.getAllUserAssociations();
    for (const association of userAssociations) {
      if (association.filenamePattern) {
        cacheStorage.add(association.filenamePattern);
      }
    }
    this.storageService.store(
      EditorResolverService_1.cacheStorageID,
      JSON.stringify(Array.from(cacheStorage)),
      0,
      1
      /* StorageTarget.MACHINE */
    );
  }
  resourceMatchesCache(resource) {
    if (!this.cache) {
      return false;
    }
    for (const cacheEntry of this.cache) {
      if (globMatchesResource(cacheEntry, resource)) {
        return true;
      }
    }
    return false;
  }
};
EditorResolverService = EditorResolverService_1 = __decorate([
  __param(0, IEditorGroupsService),
  __param(1, IInstantiationService),
  __param(2, IConfigurationService),
  __param(3, IQuickInputService),
  __param(4, INotificationService),
  __param(5, IStorageService),
  __param(6, IExtensionService),
  __param(7, ILogService)
], EditorResolverService);
registerSingleton(
  IEditorResolverService,
  EditorResolverService,
  0
  /* InstantiationType.Eager */
);
export {
  EditorResolverService
};
//# sourceMappingURL=editorResolverService.js.map
