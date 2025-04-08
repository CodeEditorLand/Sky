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
import { Disposable, IDisposable } from "../../../../base/common/lifecycle.js";
import Severity from "../../../../base/common/severity.js";
import { ICodeEditor, getCodeEditor } from "../../../../editor/browser/editorBrowser.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { ILanguageStatus, ILanguageStatusService } from "../../../services/languageStatus/common/languageStatusService.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { Extensions as WorkbenchExtensions, IWorkbenchContributionsRegistry, IWorkbenchContribution } from "../../../common/contributions.js";
import { LifecyclePhase } from "../../../services/lifecycle/common/lifecycle.js";
import { Event } from "../../../../base/common/event.js";
import * as nls from "../../../../nls.js";
import { FoldingController } from "../../../../editor/contrib/folding/browser/folding.js";
import { ColorDetector } from "../../../../editor/contrib/colorPicker/browser/colorDetector.js";
const openSettingsCommand = "workbench.action.openSettings";
const configureSettingsLabel = nls.localize("status.button.configure", "Configure");
let LimitIndicatorContribution = class extends Disposable {
  static {
    __name(this, "LimitIndicatorContribution");
  }
  constructor(editorService, languageStatusService) {
    super();
    const accessors = [new ColorDecorationAccessor(), new FoldingRangeAccessor()];
    const statusEntries = accessors.map((indicator) => new LanguageStatusEntry(languageStatusService, indicator));
    statusEntries.forEach((entry) => this._register(entry));
    let control;
    const onActiveEditorChanged = /* @__PURE__ */ __name(() => {
      const activeControl = editorService.activeTextEditorControl;
      if (activeControl === control) {
        return;
      }
      control = activeControl;
      const editor = getCodeEditor(activeControl);
      statusEntries.forEach((statusEntry) => statusEntry.onActiveEditorChanged(editor));
    }, "onActiveEditorChanged");
    this._register(editorService.onDidActiveEditorChange(onActiveEditorChanged));
    onActiveEditorChanged();
  }
};
LimitIndicatorContribution = __decorateClass([
  __decorateParam(0, IEditorService),
  __decorateParam(1, ILanguageStatusService)
], LimitIndicatorContribution);
class ColorDecorationAccessor {
  static {
    __name(this, "ColorDecorationAccessor");
  }
  id = "decoratorsLimitInfo";
  name = nls.localize("colorDecoratorsStatusItem.name", "Color Decorator Status");
  label = nls.localize("status.limitedColorDecorators.short", "Color decorators");
  source = nls.localize("colorDecoratorsStatusItem.source", "Color Decorators");
  settingsId = "editor.colorDecoratorsLimit";
  getLimitReporter(editor) {
    return ColorDetector.get(editor)?.limitReporter;
  }
}
class FoldingRangeAccessor {
  static {
    __name(this, "FoldingRangeAccessor");
  }
  id = "foldingLimitInfo";
  name = nls.localize("foldingRangesStatusItem.name", "Folding Status");
  label = nls.localize("status.limitedFoldingRanges.short", "Folding ranges");
  source = nls.localize("foldingRangesStatusItem.source", "Folding");
  settingsId = "editor.foldingMaximumRegions";
  getLimitReporter(editor) {
    return FoldingController.get(editor)?.limitReporter;
  }
}
class LanguageStatusEntry {
  constructor(languageStatusService, accessor) {
    this.languageStatusService = languageStatusService;
    this.accessor = accessor;
  }
  static {
    __name(this, "LanguageStatusEntry");
  }
  _limitStatusItem;
  _indicatorChangeListener;
  onActiveEditorChanged(editor) {
    if (this._indicatorChangeListener) {
      this._indicatorChangeListener.dispose();
      this._indicatorChangeListener = void 0;
    }
    let info;
    if (editor) {
      info = this.accessor.getLimitReporter(editor);
    }
    this.updateStatusItem(info);
    if (info) {
      this._indicatorChangeListener = info.onDidChange((_) => {
        this.updateStatusItem(info);
      });
      return true;
    }
    return false;
  }
  updateStatusItem(info) {
    if (this._limitStatusItem) {
      this._limitStatusItem.dispose();
      this._limitStatusItem = void 0;
    }
    if (info && info.limited !== false) {
      const status = {
        id: this.accessor.id,
        selector: "*",
        name: this.accessor.name,
        severity: Severity.Warning,
        label: this.accessor.label,
        detail: nls.localize("status.limited.details", "only {0} shown for performance reasons", info.limited),
        command: { id: openSettingsCommand, arguments: [this.accessor.settingsId], title: configureSettingsLabel },
        accessibilityInfo: void 0,
        source: this.accessor.source,
        busy: false
      };
      this._limitStatusItem = this.languageStatusService.addStatus(status);
    }
  }
  dispose() {
    this._limitStatusItem?.dispose;
    this._limitStatusItem = void 0;
    this._indicatorChangeListener?.dispose;
    this._indicatorChangeListener = void 0;
  }
}
Registry.as(WorkbenchExtensions.Workbench).registerWorkbenchContribution(
  LimitIndicatorContribution,
  LifecyclePhase.Restored
);
export {
  LimitIndicatorContribution
};
//# sourceMappingURL=limitIndicator.contribution.js.map
