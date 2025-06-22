var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { getWindow } from "../../../../base/browser/dom.js";
import { toAction } from "../../../../base/common/actions.js";
import { VSBuffer } from "../../../../base/common/buffer.js";
import { Schemas } from "../../../../base/common/network.js";
import { basename } from "../../../../base/common/path.js";
import { dirname, isEqual } from "../../../../base/common/resources.js";
import { assertReturnsDefined } from "../../../../base/common/types.js";
import { localize } from "../../../../nls.js";
import { IFileDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ILabelService } from "../../../../platform/label/common/label.js";
import { IUndoRedoService } from "../../../../platform/undoRedo/common/undoRedo.js";
import { createEditorOpenError } from "../../../common/editor.js";
import { ICustomEditorLabelService } from "../../../services/editor/common/customEditorLabelService.js";
import { ICustomEditorService } from "../common/customEditor.js";
import { IWebviewService } from "../../webview/browser/webview.js";
import { IWebviewWorkbenchService, LazilyResolvedWebviewEditorInput } from "../../webviewPanel/browser/webviewWorkbenchService.js";
import { IEditorGroupsService } from "../../../services/editor/common/editorGroupsService.js";
import { IFilesConfigurationService } from "../../../services/filesConfiguration/common/filesConfigurationService.js";
import { IWorkbenchLayoutService } from "../../../services/layout/browser/layoutService.js";
import { IUntitledTextEditorService } from "../../../services/untitled/common/untitledTextEditorService.js";
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
var CustomEditorInput_1;
let CustomEditorInput = class CustomEditorInput2 extends LazilyResolvedWebviewEditorInput {
  static {
    __name(this, "CustomEditorInput");
  }
  static {
    CustomEditorInput_1 = this;
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
      const input = instantiationService.createInstance(CustomEditorInput_1, { resource, viewType }, webview, { untitledDocumentData, oldResource: options?.oldResource });
      if (typeof group !== "undefined") {
        input.updateGroup(group);
      }
      return input;
    });
  }
  static {
    this.typeId = "workbench.editors.webviewEditor";
  }
  get resource() {
    return this._editorResource;
  }
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
    this._editorName = void 0;
    this._shortDescription = void 0;
    this._mediumDescription = void 0;
    this._longDescription = void 0;
    this._shortTitle = void 0;
    this._mediumTitle = void 0;
    this._longTitle = void 0;
    this._editorResource = init.resource;
    this.oldResource = options.oldResource;
    this._defaultDirtyState = options.startsDirty;
    this._backupId = options.backupId;
    this._untitledDocumentData = options.untitledDocumentData;
    this.registerListeners();
  }
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
    return CustomEditorInput_1.typeId;
  }
  get editorId() {
    return this.viewType;
  }
  get capabilities() {
    let capabilities = 0;
    capabilities |= 128;
    if (!this.customEditorService.getCustomEditorCapabilities(this.viewType)?.supportsMultipleEditorsPerDocument) {
      capabilities |= 8;
    }
    if (this._modelRef) {
      if (this._modelRef.object.isReadonly()) {
        capabilities |= 2;
      }
    } else {
      if (this.filesConfigurationService.isReadonly(this.resource)) {
        capabilities |= 2;
      }
    }
    if (this.resource.scheme === Schemas.untitled) {
      capabilities |= 4;
    }
    return capabilities;
  }
  getName() {
    if (typeof this._editorName !== "string") {
      this._editorName = this.customEditorLabelService.getName(this.resource) ?? basename(this.labelService.getUriLabel(this.resource));
    }
    return this._editorName;
  }
  getDescription(verbosity = 1) {
    switch (verbosity) {
      case 0:
        return this.shortDescription;
      case 2:
        return this.longDescription;
      case 1:
      default:
        return this.mediumDescription;
    }
  }
  get shortDescription() {
    if (typeof this._shortDescription !== "string") {
      this._shortDescription = this.labelService.getUriBasenameLabel(dirname(this.resource));
    }
    return this._shortDescription;
  }
  get mediumDescription() {
    if (typeof this._mediumDescription !== "string") {
      this._mediumDescription = this.labelService.getUriLabel(dirname(this.resource), { relative: true });
    }
    return this._mediumDescription;
  }
  get longDescription() {
    if (typeof this._longDescription !== "string") {
      this._longDescription = this.labelService.getUriLabel(dirname(this.resource));
    }
    return this._longDescription;
  }
  get shortTitle() {
    if (typeof this._shortTitle !== "string") {
      this._shortTitle = this.getName();
    }
    return this._shortTitle;
  }
  get mediumTitle() {
    if (typeof this._mediumTitle !== "string") {
      this._mediumTitle = this.labelService.getUriLabel(this.resource, { relative: true });
    }
    return this._mediumTitle;
  }
  get longTitle() {
    if (typeof this._longTitle !== "string") {
      this._longTitle = this.labelService.getUriLabel(this.resource);
    }
    return this._longTitle;
  }
  getTitle(verbosity) {
    switch (verbosity) {
      case 0:
        return this.shortTitle;
      case 2:
        return this.longTitle;
      default:
      case 1:
        return this.mediumTitle;
    }
  }
  matches(other) {
    if (super.matches(other)) {
      return true;
    }
    return this === other || other instanceof CustomEditorInput_1 && this.viewType === other.viewType && isEqual(this.resource, other.resource);
  }
  copy() {
    return CustomEditorInput_1.create(this.instantiationService, this.resource, this.viewType, this.group, this.webview.options);
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
      this._modelRef = this._register(assertReturnsDefined(await this.customEditorService.models.tryRetain(this.resource, this.viewType)));
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
    assertReturnsDefined(this._modelRef);
    return this.undoRedoService.undo(this.resource);
  }
  redo() {
    assertReturnsDefined(this._modelRef);
    return this.undoRedoService.redo(this.resource);
  }
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
CustomEditorInput = CustomEditorInput_1 = __decorate([
  __param(3, IWebviewWorkbenchService),
  __param(4, IInstantiationService),
  __param(5, ILabelService),
  __param(6, ICustomEditorService),
  __param(7, IFileDialogService),
  __param(8, IUndoRedoService),
  __param(9, IFileService),
  __param(10, IFilesConfigurationService),
  __param(11, IEditorGroupsService),
  __param(12, IWorkbenchLayoutService),
  __param(13, ICustomEditorLabelService)
], CustomEditorInput);
export {
  CustomEditorInput
};
//# sourceMappingURL=customEditorInput.js.map
