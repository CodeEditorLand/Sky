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
var DiffEditorInput_1;
import { localize } from "../../../nls.js";
import { AbstractSideBySideEditorInputSerializer, SideBySideEditorInput } from "./sideBySideEditorInput.js";
import { TEXT_DIFF_EDITOR_ID, BINARY_DIFF_EDITOR_ID, isResourceDiffEditorInput } from "../editor.js";
import { BaseTextEditorModel } from "./textEditorModel.js";
import { DiffEditorModel } from "./diffEditorModel.js";
import { TextDiffEditorModel } from "./textDiffEditorModel.js";
import { IEditorService } from "../../services/editor/common/editorService.js";
import { shorten } from "../../../base/common/labels.js";
import { isResolvedEditorModel } from "../../../platform/editor/common/editor.js";
let DiffEditorInput = class DiffEditorInput2 extends SideBySideEditorInput {
  static {
    __name(this, "DiffEditorInput");
  }
  static {
    DiffEditorInput_1 = this;
  }
  static {
    this.ID = "workbench.editors.diffEditorInput";
  }
  get typeId() {
    return DiffEditorInput_1.ID;
  }
  get editorId() {
    return this.modified.editorId === this.original.editorId ? this.modified.editorId : void 0;
  }
  get capabilities() {
    let capabilities = super.capabilities;
    if (this.labels.forceDescription) {
      capabilities |= 64;
    }
    return capabilities;
  }
  constructor(preferredName, preferredDescription, original, modified, forceOpenAsBinary, editorService) {
    super(preferredName, preferredDescription, original, modified, editorService);
    this.original = original;
    this.modified = modified;
    this.forceOpenAsBinary = forceOpenAsBinary;
    this.cachedModel = void 0;
    this.labels = this.computeLabels();
  }
  computeLabels() {
    let name;
    let forceDescription = false;
    if (this.preferredName) {
      name = this.preferredName;
    } else {
      const originalName = this.original.getName();
      const modifiedName = this.modified.getName();
      name = localize("sideBySideLabels", "{0} \u2194 {1}", originalName, modifiedName);
      forceDescription = originalName === modifiedName;
    }
    let shortDescription;
    let mediumDescription;
    let longDescription;
    if (this.preferredDescription) {
      shortDescription = this.preferredDescription;
      mediumDescription = this.preferredDescription;
      longDescription = this.preferredDescription;
    } else {
      shortDescription = this.computeLabel(this.original.getDescription(
        0
        /* Verbosity.SHORT */
      ), this.modified.getDescription(
        0
        /* Verbosity.SHORT */
      ));
      longDescription = this.computeLabel(this.original.getDescription(
        2
        /* Verbosity.LONG */
      ), this.modified.getDescription(
        2
        /* Verbosity.LONG */
      ));
      const originalMediumDescription = this.original.getDescription(
        1
        /* Verbosity.MEDIUM */
      );
      const modifiedMediumDescription = this.modified.getDescription(
        1
        /* Verbosity.MEDIUM */
      );
      if (typeof originalMediumDescription === "string" && typeof modifiedMediumDescription === "string" && // we can only `shorten` when both sides are strings...
      (originalMediumDescription || modifiedMediumDescription)) {
        const [shortenedOriginalMediumDescription, shortenedModifiedMediumDescription] = shorten([originalMediumDescription, modifiedMediumDescription]);
        mediumDescription = this.computeLabel(shortenedOriginalMediumDescription, shortenedModifiedMediumDescription);
      }
    }
    let shortTitle = this.computeLabel(this.original.getTitle(
      0
      /* Verbosity.SHORT */
    ) ?? this.original.getName(), this.modified.getTitle(
      0
      /* Verbosity.SHORT */
    ) ?? this.modified.getName(), " \u2194 ");
    let mediumTitle = this.computeLabel(this.original.getTitle(
      1
      /* Verbosity.MEDIUM */
    ) ?? this.original.getName(), this.modified.getTitle(
      1
      /* Verbosity.MEDIUM */
    ) ?? this.modified.getName(), " \u2194 ");
    let longTitle = this.computeLabel(this.original.getTitle(
      2
      /* Verbosity.LONG */
    ) ?? this.original.getName(), this.modified.getTitle(
      2
      /* Verbosity.LONG */
    ) ?? this.modified.getName(), " \u2194 ");
    const preferredTitle = this.getPreferredTitle();
    if (preferredTitle) {
      shortTitle = `${preferredTitle} (${shortTitle})`;
      mediumTitle = `${preferredTitle} (${mediumTitle})`;
      longTitle = `${preferredTitle} (${longTitle})`;
    }
    return { name, shortDescription, mediumDescription, longDescription, forceDescription, shortTitle, mediumTitle, longTitle };
  }
  computeLabel(originalLabel, modifiedLabel, separator = " - ") {
    if (!originalLabel || !modifiedLabel) {
      return void 0;
    }
    if (originalLabel === modifiedLabel) {
      return modifiedLabel;
    }
    return `${originalLabel}${separator}${modifiedLabel}`;
  }
  getName() {
    return this.labels.name;
  }
  getDescription(verbosity = 1) {
    switch (verbosity) {
      case 0:
        return this.labels.shortDescription;
      case 2:
        return this.labels.longDescription;
      case 1:
      default:
        return this.labels.mediumDescription;
    }
  }
  getTitle(verbosity) {
    switch (verbosity) {
      case 0:
        return this.labels.shortTitle;
      case 2:
        return this.labels.longTitle;
      default:
      case 1:
        return this.labels.mediumTitle;
    }
  }
  async resolve() {
    const resolvedModel = await this.createModel();
    this.cachedModel?.dispose();
    this.cachedModel = resolvedModel;
    return this.cachedModel;
  }
  prefersEditorPane(editorPanes) {
    if (this.forceOpenAsBinary) {
      return editorPanes.find((editorPane) => editorPane.typeId === BINARY_DIFF_EDITOR_ID);
    }
    return editorPanes.find((editorPane) => editorPane.typeId === TEXT_DIFF_EDITOR_ID);
  }
  async createModel() {
    const [originalEditorModel, modifiedEditorModel] = await Promise.all([
      this.original.resolve(),
      this.modified.resolve()
    ]);
    if (modifiedEditorModel instanceof BaseTextEditorModel && originalEditorModel instanceof BaseTextEditorModel) {
      return new TextDiffEditorModel(originalEditorModel, modifiedEditorModel);
    }
    return new DiffEditorModel(isResolvedEditorModel(originalEditorModel) ? originalEditorModel : void 0, isResolvedEditorModel(modifiedEditorModel) ? modifiedEditorModel : void 0);
  }
  toUntyped(options) {
    const untyped = super.toUntyped(options);
    if (untyped) {
      return {
        ...untyped,
        modified: untyped.primary,
        original: untyped.secondary
      };
    }
    return void 0;
  }
  matches(otherInput) {
    if (this === otherInput) {
      return true;
    }
    if (otherInput instanceof DiffEditorInput_1) {
      return this.modified.matches(otherInput.modified) && this.original.matches(otherInput.original) && otherInput.forceOpenAsBinary === this.forceOpenAsBinary;
    }
    if (isResourceDiffEditorInput(otherInput)) {
      return this.modified.matches(otherInput.modified) && this.original.matches(otherInput.original);
    }
    return false;
  }
  dispose() {
    if (this.cachedModel) {
      this.cachedModel.dispose();
      this.cachedModel = void 0;
    }
    super.dispose();
  }
};
DiffEditorInput = DiffEditorInput_1 = __decorate([
  __param(5, IEditorService)
], DiffEditorInput);
class DiffEditorInputSerializer extends AbstractSideBySideEditorInputSerializer {
  static {
    __name(this, "DiffEditorInputSerializer");
  }
  createEditorInput(instantiationService, name, description, secondaryInput, primaryInput) {
    return instantiationService.createInstance(DiffEditorInput, name, description, secondaryInput, primaryInput, void 0);
  }
}
export {
  DiffEditorInput,
  DiffEditorInputSerializer
};
//# sourceMappingURL=diffEditorInput.js.map
