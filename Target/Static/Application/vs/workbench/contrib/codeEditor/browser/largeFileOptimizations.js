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
import * as nls from "../../../../nls.js";
import * as path from "../../../../base/common/path.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { registerEditorContribution } from "../../../../editor/browser/editorExtensions.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { INotificationService, Severity } from "../../../../platform/notification/common/notification.js";
let LargeFileOptimizationsWarner = class LargeFileOptimizationsWarner2 extends Disposable {
  static {
    __name(this, "LargeFileOptimizationsWarner");
  }
  static {
    this.ID = "editor.contrib.largeFileOptimizationsWarner";
  }
  constructor(_editor, _notificationService, _configurationService) {
    super();
    this._editor = _editor;
    this._notificationService = _notificationService;
    this._configurationService = _configurationService;
    this._register(this._editor.onDidChangeModel((e) => this._update()));
    this._update();
  }
  _update() {
    const model = this._editor.getModel();
    if (!model) {
      return;
    }
    if (model.isTooLargeForTokenization()) {
      const message = nls.localize({
        key: "largeFile",
        comment: [
          "Variable 0 will be a file name."
        ]
      }, "{0}: tokenization, wrapping, folding, codelens, word highlighting and sticky scroll have been turned off for this large file in order to reduce memory usage and avoid freezing or crashing.", path.basename(model.uri.path));
      this._notificationService.prompt(Severity.Info, message, [
        {
          label: nls.localize("removeOptimizations", "Forcefully Enable Features"),
          run: /* @__PURE__ */ __name(() => {
            this._configurationService.updateValue(`editor.largeFileOptimizations`, false).then(() => {
              this._notificationService.info(nls.localize("reopenFilePrompt", "Please reopen file in order for this setting to take effect."));
            }, (err) => {
              this._notificationService.error(err);
            });
          }, "run")
        }
      ], { neverShowAgain: { id: "editor.contrib.largeFileOptimizationsWarner" } });
    }
  }
};
LargeFileOptimizationsWarner = __decorate([
  __param(1, INotificationService),
  __param(2, IConfigurationService)
], LargeFileOptimizationsWarner);
registerEditorContribution(
  LargeFileOptimizationsWarner.ID,
  LargeFileOptimizationsWarner,
  1
  /* EditorContributionInstantiation.AfterFirstRender */
);
export {
  LargeFileOptimizationsWarner
};
//# sourceMappingURL=largeFileOptimizations.js.map
