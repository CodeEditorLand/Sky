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
import "./media/customEditor.css";
import { coalesce } from "../../../../base/common/arrays.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { Disposable, DisposableStore, IDisposable, toDisposable } from "../../../../base/common/lifecycle.js";
import { Schemas } from "../../../../base/common/network.js";
import { extname, isEqual } from "../../../../base/common/resources.js";
import { assertIsDefined } from "../../../../base/common/types.js";
import { URI } from "../../../../base/common/uri.js";
import { RedoCommand, UndoCommand } from "../../../../editor/browser/editorExtensions.js";
import { IResourceEditorInput } from "../../../../platform/editor/common/editor.js";
import { FileOperation, IFileService } from "../../../../platform/files/common/files.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.js";
import { DEFAULT_EDITOR_ASSOCIATION, EditorExtensions, GroupIdentifier, IEditorFactoryRegistry, IResourceDiffEditorInput } from "../../../common/editor.js";
import { DiffEditorInput } from "../../../common/editor/diffEditorInput.js";
import { EditorInput } from "../../../common/editor/editorInput.js";
import { CONTEXT_ACTIVE_CUSTOM_EDITOR_ID, CONTEXT_FOCUSED_CUSTOM_EDITOR_IS_EDITABLE, CustomEditorCapabilities, CustomEditorInfo, CustomEditorInfoCollection, ICustomEditorModelManager, ICustomEditorService } from "../common/customEditor.js";
import { CustomEditorModelManager } from "../common/customEditorModelManager.js";
import { IEditorGroup, IEditorGroupContextKeyProvider, IEditorGroupsService } from "../../../services/editor/common/editorGroupsService.js";
import { IEditorResolverService, IEditorType, RegisteredEditorPriority } from "../../../services/editor/common/editorResolverService.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { ContributedCustomEditors } from "../common/contributedCustomEditors.js";
import { CustomEditorInput } from "./customEditorInput.js";
let CustomEditorService = class extends Disposable {
  constructor(fileService, storageService, editorService, editorGroupService, instantiationService, uriIdentityService, editorResolverService) {
    super();
    this.editorService = editorService;
    this.editorGroupService = editorGroupService;
    this.instantiationService = instantiationService;
    this.uriIdentityService = uriIdentityService;
    this.editorResolverService = editorResolverService;
    this._models = new CustomEditorModelManager(this.uriIdentityService);
    this._contributedEditors = this._register(new ContributedCustomEditors(storageService));
    this.editorResolverService.bufferChangeEvents(this.registerContributionPoints.bind(this));
    this._register(this._contributedEditors.onChange(() => {
      this.editorResolverService.bufferChangeEvents(this.registerContributionPoints.bind(this));
      this._onDidChangeEditorTypes.fire();
    }));
    const activeCustomEditorContextKeyProvider = {
      contextKey: CONTEXT_ACTIVE_CUSTOM_EDITOR_ID,
      getGroupContextKeyValue: /* @__PURE__ */ __name((group) => this.getActiveCustomEditorId(group), "getGroupContextKeyValue"),
      onDidChange: this.onDidChangeEditorTypes
    };
    const customEditorIsEditableContextKeyProvider = {
      contextKey: CONTEXT_FOCUSED_CUSTOM_EDITOR_IS_EDITABLE,
      getGroupContextKeyValue: /* @__PURE__ */ __name((group) => this.getCustomEditorIsEditable(group), "getGroupContextKeyValue"),
      onDidChange: this.onDidChangeEditorTypes
    };
    this._register(this.editorGroupService.registerContextKeyProvider(activeCustomEditorContextKeyProvider));
    this._register(this.editorGroupService.registerContextKeyProvider(customEditorIsEditableContextKeyProvider));
    this._register(fileService.onDidRunOperation((e) => {
      if (e.isOperation(FileOperation.MOVE)) {
        this.handleMovedFileInOpenedFileEditors(e.resource, this.uriIdentityService.asCanonicalUri(e.target.resource));
      }
    }));
    const PRIORITY = 105;
    this._register(UndoCommand.addImplementation(PRIORITY, "custom-editor", () => {
      return this.withActiveCustomEditor((editor) => editor.undo());
    }));
    this._register(RedoCommand.addImplementation(PRIORITY, "custom-editor", () => {
      return this.withActiveCustomEditor((editor) => editor.redo());
    }));
  }
  static {
    __name(this, "CustomEditorService");
  }
  _serviceBrand;
  _contributedEditors;
  _untitledCounter = 0;
  _editorResolverDisposables = this._register(new DisposableStore());
  _editorCapabilities = /* @__PURE__ */ new Map();
  _models;
  _onDidChangeEditorTypes = this._register(new Emitter());
  onDidChangeEditorTypes = this._onDidChangeEditorTypes.event;
  _fileEditorFactory = Registry.as(EditorExtensions.EditorFactory).getFileEditorFactory();
  getEditorTypes() {
    return [...this._contributedEditors];
  }
  withActiveCustomEditor(f) {
    const activeEditor = this.editorService.activeEditor;
    if (activeEditor instanceof CustomEditorInput) {
      const result = f(activeEditor);
      if (result) {
        return result;
      }
      return true;
    }
    return false;
  }
  registerContributionPoints() {
    this._editorResolverDisposables.clear();
    for (const contributedEditor of this._contributedEditors) {
      for (const globPattern of contributedEditor.selector) {
        if (!globPattern.filenamePattern) {
          continue;
        }
        this._editorResolverDisposables.add(this.editorResolverService.registerEditor(
          globPattern.filenamePattern,
          {
            id: contributedEditor.id,
            label: contributedEditor.displayName,
            detail: contributedEditor.providerDisplayName,
            priority: contributedEditor.priority
          },
          {
            singlePerResource: /* @__PURE__ */ __name(() => !(this.getCustomEditorCapabilities(contributedEditor.id)?.supportsMultipleEditorsPerDocument ?? false), "singlePerResource")
          },
          {
            createEditorInput: /* @__PURE__ */ __name(({ resource }, group) => {
              return { editor: CustomEditorInput.create(this.instantiationService, resource, contributedEditor.id, group.id) };
            }, "createEditorInput"),
            createUntitledEditorInput: /* @__PURE__ */ __name(({ resource }, group) => {
              return { editor: CustomEditorInput.create(this.instantiationService, resource ?? URI.from({ scheme: Schemas.untitled, authority: `Untitled-${this._untitledCounter++}` }), contributedEditor.id, group.id) };
            }, "createUntitledEditorInput"),
            createDiffEditorInput: /* @__PURE__ */ __name((diffEditorInput, group) => {
              return { editor: this.createDiffEditorInput(diffEditorInput, contributedEditor.id, group) };
            }, "createDiffEditorInput")
          }
        ));
      }
    }
  }
  createDiffEditorInput(editor, editorID, group) {
    const modifiedOverride = CustomEditorInput.create(this.instantiationService, assertIsDefined(editor.modified.resource), editorID, group.id, { customClasses: "modified" });
    const originalOverride = CustomEditorInput.create(this.instantiationService, assertIsDefined(editor.original.resource), editorID, group.id, { customClasses: "original" });
    return this.instantiationService.createInstance(DiffEditorInput, editor.label, editor.description, originalOverride, modifiedOverride, true);
  }
  get models() {
    return this._models;
  }
  getCustomEditor(viewType) {
    return this._contributedEditors.get(viewType);
  }
  getContributedCustomEditors(resource) {
    return new CustomEditorInfoCollection(this._contributedEditors.getContributedEditors(resource));
  }
  getUserConfiguredCustomEditors(resource) {
    const resourceAssocations = this.editorResolverService.getAssociationsForResource(resource);
    return new CustomEditorInfoCollection(
      coalesce(resourceAssocations.map((association) => this._contributedEditors.get(association.viewType)))
    );
  }
  getAllCustomEditors(resource) {
    return new CustomEditorInfoCollection([
      ...this.getUserConfiguredCustomEditors(resource).allEditors,
      ...this.getContributedCustomEditors(resource).allEditors
    ]);
  }
  registerCustomEditorCapabilities(viewType, options) {
    if (this._editorCapabilities.has(viewType)) {
      throw new Error(`Capabilities for ${viewType} already set`);
    }
    this._editorCapabilities.set(viewType, options);
    return toDisposable(() => {
      this._editorCapabilities.delete(viewType);
    });
  }
  getCustomEditorCapabilities(viewType) {
    return this._editorCapabilities.get(viewType);
  }
  getActiveCustomEditorId(group) {
    const activeEditorPane = group.activeEditorPane;
    const resource = activeEditorPane?.input?.resource;
    if (!resource) {
      return "";
    }
    return activeEditorPane?.input instanceof CustomEditorInput ? activeEditorPane.input.viewType : "";
  }
  getCustomEditorIsEditable(group) {
    const activeEditorPane = group.activeEditorPane;
    const resource = activeEditorPane?.input?.resource;
    if (!resource) {
      return false;
    }
    return activeEditorPane?.input instanceof CustomEditorInput;
  }
  async handleMovedFileInOpenedFileEditors(oldResource, newResource) {
    if (extname(oldResource).toLowerCase() === extname(newResource).toLowerCase()) {
      return;
    }
    const possibleEditors = this.getAllCustomEditors(newResource);
    if (!possibleEditors.allEditors.some((editor) => editor.priority !== RegisteredEditorPriority.option)) {
      return;
    }
    const editorsToReplace = /* @__PURE__ */ new Map();
    for (const group of this.editorGroupService.groups) {
      for (const editor of group.editors) {
        if (this._fileEditorFactory.isFileEditor(editor) && !(editor instanceof CustomEditorInput) && isEqual(editor.resource, newResource)) {
          let entry = editorsToReplace.get(group.id);
          if (!entry) {
            entry = [];
            editorsToReplace.set(group.id, entry);
          }
          entry.push(editor);
        }
      }
    }
    if (!editorsToReplace.size) {
      return;
    }
    for (const [group, entries] of editorsToReplace) {
      this.editorService.replaceEditors(entries.map((editor) => {
        let replacement;
        if (possibleEditors.defaultEditor) {
          const viewType = possibleEditors.defaultEditor.id;
          replacement = CustomEditorInput.create(this.instantiationService, newResource, viewType, group);
        } else {
          replacement = { resource: newResource, options: { override: DEFAULT_EDITOR_ASSOCIATION.id } };
        }
        return {
          editor,
          replacement,
          options: {
            preserveFocus: true
          }
        };
      }), group);
    }
  }
};
CustomEditorService = __decorateClass([
  __decorateParam(0, IFileService),
  __decorateParam(1, IStorageService),
  __decorateParam(2, IEditorService),
  __decorateParam(3, IEditorGroupsService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IUriIdentityService),
  __decorateParam(6, IEditorResolverService)
], CustomEditorService);
export {
  CustomEditorService
};
//# sourceMappingURL=customEditors.js.map
