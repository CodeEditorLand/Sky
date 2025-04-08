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
import { getWindow } from "../../../../base/browser/dom.js";
import { CodeWindow } from "../../../../base/browser/window.js";
import { toAction } from "../../../../base/common/actions.js";
import { VSBuffer } from "../../../../base/common/buffer.js";
import { IMarkdownString } from "../../../../base/common/htmlContent.js";
import { IReference } from "../../../../base/common/lifecycle.js";
import { Schemas } from "../../../../base/common/network.js";
import { basename } from "../../../../base/common/path.js";
import { dirname, isEqual } from "../../../../base/common/resources.js";
import { assertIsDefined } from "../../../../base/common/types.js";
import { URI } from "../../../../base/common/uri.js";
import { localize } from "../../../../nls.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IFileDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import { IResourceEditorInput } from "../../../../platform/editor/common/editor.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ILabelService } from "../../../../platform/label/common/label.js";
import { IUndoRedoService } from "../../../../platform/undoRedo/common/undoRedo.js";
import { EditorInputCapabilities, GroupIdentifier, IMoveResult, IRevertOptions, ISaveOptions, IUntypedEditorInput, Verbosity, createEditorOpenError } from "../../../common/editor.js";
import { EditorInput } from "../../../common/editor/editorInput.js";
import { ICustomEditorLabelService } from "../../../services/editor/common/customEditorLabelService.js";
import { ICustomEditorModel, ICustomEditorService } from "../common/customEditor.js";
import { IOverlayWebview, IWebviewService } from "../../webview/browser/webview.js";
import { IWebviewWorkbenchService, LazilyResolvedWebviewEditorInput } from "../../webviewPanel/browser/webviewWorkbenchService.js";
import { IEditorGroupsService } from "../../../services/editor/common/editorGroupsService.js";
import { IFilesConfigurationService } from "../../../services/filesConfiguration/common/filesConfigurationService.js";
import { IWorkbenchLayoutService } from "../../../services/layout/browser/layoutService.js";
import { IUntitledTextEditorService } from "../../../services/untitled/common/untitledTextEditorService.js";
let CustomEditorInput = class extends LazilyResolvedWebviewEditorInput {
  constructor(init, webview, options, webviewWorkbenchService, instantiationService, labelService, customEditorService, fileDialogService, undoRedoService, fileService, filesConfigurationService, editorGroupsService, layoutService, customEditorLabelService) {
    super({ providedId: init.viewType, viewType: init.viewType, name: "" }, webview, webviewWorkbenchService);
    this.instantiationService = instantiationService;
    this.labelService = labelService;
    this.customEditorService = customEditorService;
    this.fileDialogService = fileDialogService;
    this.undoRedoService = undoRedoService;
    this.fileService = fileService;
    this.filesConfigurationService = filesConfigurationService;
    this.editorGroupsService = editorGroupsService;
    this.layoutService = layoutService;
    this.customEditorLabelService = customEditorLabelService;
    this._editorResource = init.resource;
    this.oldResource = options.oldResource;
    this._defaultDirtyState = options.startsDirty;
    this._backupId = options.backupId;
    this._untitledDocumentData = options.untitledDocumentData;
    this.registerListeners();
  }
  static {
    __name(this, "CustomEditorInput");
  }
  static create(instantiationService, resource, viewType, group, options) {
    return instantiationService.invokeFunction((accessor) => {
      const untitledString = accessor.get(IUntitledTextEditorService).getValue(resource);
      const untitledDocumentData = untitledString ? VSBuffer.fromString(untitledString) : void 0;
      const webview = accessor.get(IWebviewService).createWebviewOverlay({
        providedViewType: viewType,
        title: void 0,
        options: { customClasses: options?.customClasses },
        contentOptions: {},
        extension: void 0
      });
      const input = instantiationService.createInstance(CustomEditorInput, { resource, viewType }, webview, { untitledDocumentData, oldResource: options?.oldResource });
      if (typeof group !== "undefined") {
        input.updateGroup(group);
      }
      return input;
    });
  }
  static typeId = "workbench.editors.webviewEditor";
  _editorResource;
  oldResource;
  _defaultDirtyState;
  _backupId;
  _untitledDocumentData;
  get resource() {
    return this._editorResource;
  }
  _modelRef;
  registerListeners() {
    this._register(this.labelService.onDidChangeFormatters((e) => this.onLabelEvent(e.scheme)));
    this._register(this.fileService.onDidChangeFileSystemProviderRegistrations((e) => this.onLabelEvent(e.scheme)));
    this._register(this.fileService.onDidChangeFileSystemProviderCapabilities((e) => this.onLabelEvent(e.scheme)));
    this._register(this.customEditorLabelService.onDidChange(() => this.updateLabel()));
    this._register(this.filesConfigurationService.onDidChangeReadonly(() => this._onDidChangeCapabilities.fire()));
  }
  onLabelEvent(scheme) {
    if (scheme === this.resource.scheme) {
      this.updateLabel();
    }
  }
  updateLabel() {
    this._editorName = void 0;
    this._shortDescription = void 0;
    this._mediumDescription = void 0;
    this._longDescription = void 0;
    this._shortTitle = void 0;
    this._mediumTitle = void 0;
    this._longTitle = void 0;
    this._onDidChangeLabel.fire();
  }
  get typeId() {
    return CustomEditorInput.typeId;
  }
  get editorId() {
    return this.viewType;
  }
  get capabilities() {
    let capabilities = EditorInputCapabilities.None;
    capabilities |= EditorInputCapabilities.CanDropIntoEditor;
    if (!this.customEditorService.getCustomEditorCapabilities(this.viewType)?.supportsMultipleEditorsPerDocument) {
      capabilities |= EditorInputCapabilities.Singleton;
    }
    if (this._modelRef) {
      if (this._modelRef.object.isReadonly()) {
        capabilities |= EditorInputCapabilities.Readonly;
      }
    } else {
      if (this.filesConfigurationService.isReadonly(this.resource)) {
        capabilities |= EditorInputCapabilities.Readonly;
      }
    }
    if (this.resource.scheme === Schemas.untitled) {
      capabilities |= EditorInputCapabilities.Untitled;
    }
    return capabilities;
  }
  _editorName = void 0;
  getName() {
    if (typeof this._editorName !== "string") {
      this._editorName = this.customEditorLabelService.getName(this.resource) ?? basename(this.labelService.getUriLabel(this.resource));
    }
    return this._editorName;
  }
  getDescription(verbosity = Verbosity.MEDIUM) {
    switch (verbosity) {
      case Verbosity.SHORT:
        return this.shortDescription;
      case Verbosity.LONG:
        return this.longDescription;
      case Verbosity.MEDIUM:
      default:
        return this.mediumDescription;
    }
  }
  _shortDescription = void 0;
  get shortDescription() {
    if (typeof this._shortDescription !== "string") {
      this._shortDescription = this.labelService.getUriBasenameLabel(dirname(this.resource));
    }
    return this._shortDescription;
  }
  _mediumDescription = void 0;
  get mediumDescription() {
    if (typeof this._mediumDescription !== "string") {
      this._mediumDescription = this.labelService.getUriLabel(dirname(this.resource), { relative: true });
    }
    return this._mediumDescription;
  }
  _longDescription = void 0;
  get longDescription() {
    if (typeof this._longDescription !== "string") {
      this._longDescription = this.labelService.getUriLabel(dirname(this.resource));
    }
    return this._longDescription;
  }
  _shortTitle = void 0;
  get shortTitle() {
    if (typeof this._shortTitle !== "string") {
      this._shortTitle = this.getName();
    }
    return this._shortTitle;
  }
  _mediumTitle = void 0;
  get mediumTitle() {
    if (typeof this._mediumTitle !== "string") {
      this._mediumTitle = this.labelService.getUriLabel(this.resource, { relative: true });
    }
    return this._mediumTitle;
  }
  _longTitle = void 0;
  get longTitle() {
    if (typeof this._longTitle !== "string") {
      this._longTitle = this.labelService.getUriLabel(this.resource);
    }
    return this._longTitle;
  }
  getTitle(verbosity) {
    switch (verbosity) {
      case Verbosity.SHORT:
        return this.shortTitle;
      case Verbosity.LONG:
        return this.longTitle;
      default:
      case Verbosity.MEDIUM:
        return this.mediumTitle;
    }
  }
  matches(other) {
    if (super.matches(other)) {
      return true;
    }
    return this === other || other instanceof CustomEditorInput && this.viewType === other.viewType && isEqual(this.resource, other.resource);
  }
  copy() {
    return CustomEditorInput.create(this.instantiationService, this.resource, this.viewType, this.group, this.webview.options);
  }
  isReadonly() {
    if (!this._modelRef) {
      return this.filesConfigurationService.isReadonly(this.resource);
    }
    return this._modelRef.object.isReadonly();
  }
  isDirty() {
    if (!this._modelRef) {
      return !!this._defaultDirtyState;
    }
    return this._modelRef.object.isDirty();
  }
  async save(groupId, options) {
    if (!this._modelRef) {
      return void 0;
    }
    const target = await this._modelRef.object.saveCustomEditor(options);
    if (!target) {
      return void 0;
    }
    if (!isEqual(target, this.resource)) {
      return { resource: target };
    }
    return this;
  }
  async saveAs(groupId, options) {
    if (!this._modelRef) {
      return void 0;
    }
    const dialogPath = this._editorResource;
    const target = await this.fileDialogService.pickFileToSave(dialogPath, options?.availableFileSystems);
    if (!target) {
      return void 0;
    }
    if (!await this._modelRef.object.saveCustomEditorAs(this._editorResource, target, options)) {
      return void 0;
    }
    return (await this.rename(groupId, target))?.editor;
  }
  async revert(group, options) {
    if (this._modelRef) {
      return this._modelRef.object.revert(options);
    }
    this._defaultDirtyState = false;
    this._onDidChangeDirty.fire();
  }
  async resolve() {
    await super.resolve();
    if (this.isDisposed()) {
      return null;
    }
    if (!this._modelRef) {
      const oldCapabilities = this.capabilities;
      this._modelRef = this._register(assertIsDefined(await this.customEditorService.models.tryRetain(this.resource, this.viewType)));
      this._register(this._modelRef.object.onDidChangeDirty(() => this._onDidChangeDirty.fire()));
      this._register(this._modelRef.object.onDidChangeReadonly(() => this._onDidChangeCapabilities.fire()));
      if (this._untitledDocumentData) {
        this._defaultDirtyState = true;
      }
      if (this.isDirty()) {
        this._onDidChangeDirty.fire();
      }
      if (this.capabilities !== oldCapabilities) {
        this._onDidChangeCapabilities.fire();
      }
    }
    return null;
  }
  async rename(group, newResource) {
    return { editor: { resource: newResource } };
  }
  undo() {
    assertIsDefined(this._modelRef);
    return this.undoRedoService.undo(this.resource);
  }
  redo() {
    assertIsDefined(this._modelRef);
    return this.undoRedoService.redo(this.resource);
  }
  _moveHandler;
  onMove(handler) {
    this._moveHandler = handler;
  }
  transfer(other) {
    if (!super.transfer(other)) {
      return;
    }
    other._moveHandler = this._moveHandler;
    this._moveHandler = void 0;
    return other;
  }
  get backupId() {
    if (this._modelRef) {
      return this._modelRef.object.backupId;
    }
    return this._backupId;
  }
  get untitledDocumentData() {
    return this._untitledDocumentData;
  }
  toUntyped() {
    return {
      resource: this.resource,
      options: {
        override: this.viewType
      }
    };
  }
  claim(claimant, targetWindow, scopedContextKeyService) {
    if (this.doCanMove(targetWindow.vscodeWindowId) !== true) {
      throw createEditorOpenError(localize("editorUnsupportedInWindow", "Unable to open the editor in this window, it contains modifications that can only be saved in the original window."), [
        toAction({
          id: "openInOriginalWindow",
          label: localize("reopenInOriginalWindow", "Open in Original Window"),
          run: /* @__PURE__ */ __name(async () => {
            const originalPart = this.editorGroupsService.getPart(this.layoutService.getContainer(getWindow(this.webview.container).window));
            const currentPart = this.editorGroupsService.getPart(this.layoutService.getContainer(targetWindow.window));
            currentPart.activeGroup.moveEditor(this, originalPart.activeGroup);
          }, "run")
        })
      ], { forceMessage: true });
    }
    return super.claim(claimant, targetWindow, scopedContextKeyService);
  }
  canMove(sourceGroup, targetGroup) {
    const resolvedTargetGroup = this.editorGroupsService.getGroup(targetGroup);
    if (resolvedTargetGroup) {
      const canMove = this.doCanMove(resolvedTargetGroup.windowId);
      if (typeof canMove === "string") {
        return canMove;
      }
    }
    return super.canMove(sourceGroup, targetGroup);
  }
  doCanMove(targetWindowId) {
    if (this.isModified() && this._modelRef?.object.canHotExit === false) {
      const sourceWindowId = getWindow(this.webview.container).vscodeWindowId;
      if (sourceWindowId !== targetWindowId) {
        return localize("editorCannotMove", "Unable to move '{0}': The editor contains changes that can only be saved in its current window.", this.getName());
      }
    }
    return true;
  }
};
CustomEditorInput = __decorateClass([
  __decorateParam(3, IWebviewWorkbenchService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, ILabelService),
  __decorateParam(6, ICustomEditorService),
  __decorateParam(7, IFileDialogService),
  __decorateParam(8, IUndoRedoService),
  __decorateParam(9, IFileService),
  __decorateParam(10, IFilesConfigurationService),
  __decorateParam(11, IEditorGroupsService),
  __decorateParam(12, IWorkbenchLayoutService),
  __decorateParam(13, ICustomEditorLabelService)
], CustomEditorInput);
export {
  CustomEditorInput
};
//# sourceMappingURL=customEditorInput.js.map
