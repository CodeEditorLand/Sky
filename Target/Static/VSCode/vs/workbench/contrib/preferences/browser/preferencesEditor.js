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
import { Disposable, DisposableStore } from "../../../../base/common/lifecycle.js";
import { ICodeEditor } from "../../../../editor/browser/editorBrowser.js";
import { ConfigurationTarget } from "../../../../platform/configuration/common/configuration.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { IPreferencesRenderer, UserSettingsRenderer, WorkspaceSettingsRenderer } from "./preferencesRenderers.js";
import { IPreferencesService } from "../../../services/preferences/common/preferences.js";
import { SettingsEditorModel } from "../../../services/preferences/common/preferencesModels.js";
let SettingsEditorContribution = class extends Disposable {
  constructor(editor, instantiationService, preferencesService, workspaceContextService) {
    super();
    this.editor = editor;
    this.instantiationService = instantiationService;
    this.preferencesService = preferencesService;
    this.workspaceContextService = workspaceContextService;
    this._createPreferencesRenderer();
    this._register(this.editor.onDidChangeModel((e) => this._createPreferencesRenderer()));
    this._register(this.workspaceContextService.onDidChangeWorkbenchState(() => this._createPreferencesRenderer()));
  }
  static {
    __name(this, "SettingsEditorContribution");
  }
  static ID = "editor.contrib.settings";
  currentRenderer;
  disposables = this._register(new DisposableStore());
  async _createPreferencesRenderer() {
    this.disposables.clear();
    this.currentRenderer = void 0;
    const model = this.editor.getModel();
    if (model && /\.(json|code-workspace)$/.test(model.uri.path)) {
      const settingsModel = await this.preferencesService.createPreferencesEditorModel(model.uri);
      if (settingsModel instanceof SettingsEditorModel && this.editor.getModel()) {
        this.disposables.add(settingsModel);
        switch (settingsModel.configurationTarget) {
          case ConfigurationTarget.WORKSPACE:
            this.currentRenderer = this.disposables.add(this.instantiationService.createInstance(WorkspaceSettingsRenderer, this.editor, settingsModel));
            break;
          default:
            this.currentRenderer = this.disposables.add(this.instantiationService.createInstance(UserSettingsRenderer, this.editor, settingsModel));
            break;
        }
      }
      this.currentRenderer?.render();
    }
  }
};
SettingsEditorContribution = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IPreferencesService),
  __decorateParam(3, IWorkspaceContextService)
], SettingsEditorContribution);
export {
  SettingsEditorContribution
};
//# sourceMappingURL=preferencesEditor.js.map
