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
import { EditorInput } from "./editorInput.js";
import { ByteSize, IFileService, getLargeFileConfirmationLimit } from "../../../platform/files/common/files.js";
import { ILabelService } from "../../../platform/label/common/label.js";
import { dirname, isEqual } from "../../../base/common/resources.js";
import { IFilesConfigurationService } from "../../services/filesConfiguration/common/filesConfigurationService.js";
import { isConfigured } from "../../../platform/configuration/common/configuration.js";
import { ITextResourceConfigurationService } from "../../../editor/common/services/textResourceConfiguration.js";
import { ICustomEditorLabelService } from "../../services/editor/common/customEditorLabelService.js";
let AbstractResourceEditorInput = class AbstractResourceEditorInput2 extends EditorInput {
  static {
    __name(this, "AbstractResourceEditorInput");
  }
  get capabilities() {
    let capabilities = 32;
    if (this.fileService.hasProvider(this.resource)) {
      if (this.filesConfigurationService.isReadonly(this.resource)) {
        capabilities |= 2;
      }
    } else {
      capabilities |= 4;
    }
    if (!(capabilities & 2)) {
      capabilities |= 128;
    }
    return capabilities;
  }
  get preferredResource() {
    return this._preferredResource;
  }
  constructor(resource, preferredResource, labelService, fileService, filesConfigurationService, textResourceConfigurationService, customEditorLabelService) {
    super();
    this.resource = resource;
    this.labelService = labelService;
    this.fileService = fileService;
    this.filesConfigurationService = filesConfigurationService;
    this.textResourceConfigurationService = textResourceConfigurationService;
    this.customEditorLabelService = customEditorLabelService;
    this._name = void 0;
    this._shortDescription = void 0;
    this._mediumDescription = void 0;
    this._longDescription = void 0;
    this._shortTitle = void 0;
    this._mediumTitle = void 0;
    this._longTitle = void 0;
    this._preferredResource = preferredResource || resource;
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
    if (scheme === this._preferredResource.scheme) {
      this.updateLabel();
    }
  }
  updateLabel() {
    this._name = void 0;
    this._shortDescription = void 0;
    this._mediumDescription = void 0;
    this._longDescription = void 0;
    this._shortTitle = void 0;
    this._mediumTitle = void 0;
    this._longTitle = void 0;
    this._onDidChangeLabel.fire();
  }
  setPreferredResource(preferredResource) {
    if (!isEqual(preferredResource, this._preferredResource)) {
      this._preferredResource = preferredResource;
      this.updateLabel();
    }
  }
  getName() {
    if (typeof this._name !== "string") {
      this._name = this.customEditorLabelService.getName(this._preferredResource) ?? this.labelService.getUriBasenameLabel(this._preferredResource);
    }
    return this._name;
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
      this._shortDescription = this.labelService.getUriBasenameLabel(dirname(this._preferredResource));
    }
    return this._shortDescription;
  }
  get mediumDescription() {
    if (typeof this._mediumDescription !== "string") {
      this._mediumDescription = this.labelService.getUriLabel(dirname(this._preferredResource), { relative: true });
    }
    return this._mediumDescription;
  }
  get longDescription() {
    if (typeof this._longDescription !== "string") {
      this._longDescription = this.labelService.getUriLabel(dirname(this._preferredResource));
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
      this._mediumTitle = this.labelService.getUriLabel(this._preferredResource, { relative: true });
    }
    return this._mediumTitle;
  }
  get longTitle() {
    if (typeof this._longTitle !== "string") {
      this._longTitle = this.labelService.getUriLabel(this._preferredResource);
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
  isReadonly() {
    return this.filesConfigurationService.isReadonly(this.resource);
  }
  ensureLimits(options) {
    if (options?.limits) {
      return options.limits;
    }
    const defaultSizeLimit = getLargeFileConfirmationLimit(this.resource);
    let configuredSizeLimit;
    const configuredSizeLimitMb = this.textResourceConfigurationService.inspect(this.resource, null, "workbench.editorLargeFileConfirmation");
    if (isConfigured(configuredSizeLimitMb)) {
      configuredSizeLimit = configuredSizeLimitMb.value * ByteSize.MB;
    }
    return {
      size: configuredSizeLimit ?? defaultSizeLimit
    };
  }
};
AbstractResourceEditorInput = __decorate([
  __param(2, ILabelService),
  __param(3, IFileService),
  __param(4, IFilesConfigurationService),
  __param(5, ITextResourceConfigurationService),
  __param(6, ICustomEditorLabelService)
], AbstractResourceEditorInput);
export {
  AbstractResourceEditorInput
};
//# sourceMappingURL=resourceEditorInput.js.map
