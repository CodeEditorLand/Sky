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
import { Disposable } from "../../../../base/common/lifecycle.js";
import { autorunWithStore, observableFromEvent } from "../../../../base/common/observable.js";
import { registerDiffEditorContribution } from "../../../../editor/browser/editorExtensions.js";
import { EmbeddedDiffEditorWidget } from "../../../../editor/browser/widget/diffEditor/embeddedDiffEditorWidget.js";
import { ITextResourceConfigurationService } from "../../../../editor/common/services/textResourceConfiguration.js";
import { localize } from "../../../../nls.js";
import { AccessibleViewRegistry } from "../../../../platform/accessibility/browser/accessibleViewRegistry.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { INotificationService, Severity } from "../../../../platform/notification/common/notification.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { FloatingEditorClickWidget } from "../../../browser/codeeditor.js";
import { Extensions } from "../../../common/configuration.js";
import { DiffEditorAccessibilityHelp } from "./diffEditorAccessibilityHelp.js";
let DiffEditorHelperContribution = class DiffEditorHelperContribution2 extends Disposable {
  static {
    __name(this, "DiffEditorHelperContribution");
  }
  static {
    this.ID = "editor.contrib.diffEditorHelper";
  }
  constructor(_diffEditor, _instantiationService, _textResourceConfigurationService, _notificationService) {
    super();
    this._diffEditor = _diffEditor;
    this._instantiationService = _instantiationService;
    this._textResourceConfigurationService = _textResourceConfigurationService;
    this._notificationService = _notificationService;
    const isEmbeddedDiffEditor = this._diffEditor instanceof EmbeddedDiffEditorWidget;
    if (!isEmbeddedDiffEditor) {
      const computationResult = observableFromEvent(this, (e) => this._diffEditor.onDidUpdateDiff(e), () => (
        /** @description diffEditor.diffComputationResult */
        this._diffEditor.getDiffComputationResult()
      ));
      const onlyWhiteSpaceChange = computationResult.map((r) => r && !r.identical && r.changes2.length === 0);
      this._register(autorunWithStore((reader, store) => {
        if (onlyWhiteSpaceChange.read(reader)) {
          const helperWidget = store.add(this._instantiationService.createInstance(FloatingEditorClickWidget, this._diffEditor.getModifiedEditor(), localize("hintWhitespace", "Show Whitespace Differences"), null));
          store.add(helperWidget.onClick(() => {
            this._textResourceConfigurationService.updateValue(this._diffEditor.getModel().modified.uri, "diffEditor.ignoreTrimWhitespace", false);
          }));
          helperWidget.render();
        }
      }));
      this._register(this._diffEditor.onDidUpdateDiff(() => {
        const diffComputationResult = this._diffEditor.getDiffComputationResult();
        if (diffComputationResult && diffComputationResult.quitEarly) {
          this._notificationService.prompt(Severity.Warning, localize("hintTimeout", "The diff algorithm was stopped early (after {0} ms.)", this._diffEditor.maxComputationTime), [{
            label: localize("removeTimeout", "Remove Limit"),
            run: /* @__PURE__ */ __name(() => {
              this._textResourceConfigurationService.updateValue(this._diffEditor.getModel().modified.uri, "diffEditor.maxComputationTime", 0);
            }, "run")
          }], {});
        }
      }));
    }
  }
};
DiffEditorHelperContribution = __decorate([
  __param(1, IInstantiationService),
  __param(2, ITextResourceConfigurationService),
  __param(3, INotificationService)
], DiffEditorHelperContribution);
registerDiffEditorContribution(DiffEditorHelperContribution.ID, DiffEditorHelperContribution);
Registry.as(Extensions.ConfigurationMigration).registerConfigurationMigrations([{
  key: "diffEditor.experimental.collapseUnchangedRegions",
  migrateFn: /* @__PURE__ */ __name((value, accessor) => {
    return [
      ["diffEditor.hideUnchangedRegions.enabled", { value }],
      ["diffEditor.experimental.collapseUnchangedRegions", { value: void 0 }]
    ];
  }, "migrateFn")
}]);
AccessibleViewRegistry.register(new DiffEditorAccessibilityHelp());
//# sourceMappingURL=diffEditorHelper.js.map
