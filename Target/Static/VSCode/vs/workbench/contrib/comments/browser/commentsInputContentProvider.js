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
import { Disposable } from "../../../../base/common/lifecycle.js";
import { Schemas } from "../../../../base/common/network.js";
import { URI } from "../../../../base/common/uri.js";
import { ICodeEditor } from "../../../../editor/browser/editorBrowser.js";
import { ICodeEditorService } from "../../../../editor/browser/services/codeEditorService.js";
import { IEditorContribution, ScrollType } from "../../../../editor/common/editorCommon.js";
import { ILanguageService } from "../../../../editor/common/languages/language.js";
import { ITextModel } from "../../../../editor/common/model.js";
import { IModelService } from "../../../../editor/common/services/model.js";
import { ITextModelContentProvider, ITextModelService } from "../../../../editor/common/services/resolverService.js";
import { ITextResourceEditorInput } from "../../../../platform/editor/common/editor.js";
import { applyTextEditorOptions } from "../../../common/editor/editorOptions.js";
import { SimpleCommentEditor } from "./simpleCommentEditor.js";
let CommentsInputContentProvider = class extends Disposable {
  constructor(textModelService, codeEditorService, _modelService, _languageService) {
    super();
    this._modelService = _modelService;
    this._languageService = _languageService;
    this._register(textModelService.registerTextModelContentProvider(Schemas.commentsInput, this));
    this._register(codeEditorService.registerCodeEditorOpenHandler(async (input, editor, _sideBySide) => {
      if (!(editor instanceof SimpleCommentEditor)) {
        return null;
      }
      if (editor.getModel()?.uri.toString() !== input.resource.toString()) {
        return null;
      }
      if (input.options) {
        applyTextEditorOptions(input.options, editor, ScrollType.Immediate);
      }
      return editor;
    }));
  }
  static {
    __name(this, "CommentsInputContentProvider");
  }
  static ID = "comments.input.contentProvider";
  async provideTextContent(resource) {
    const existing = this._modelService.getModel(resource);
    return existing ?? this._modelService.createModel("", this._languageService.createById("markdown"), resource);
  }
};
CommentsInputContentProvider = __decorateClass([
  __decorateParam(0, ITextModelService),
  __decorateParam(1, ICodeEditorService),
  __decorateParam(2, IModelService),
  __decorateParam(3, ILanguageService)
], CommentsInputContentProvider);
export {
  CommentsInputContentProvider
};
//# sourceMappingURL=commentsInputContentProvider.js.map
