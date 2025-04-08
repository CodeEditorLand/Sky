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
import { Disposable, MutableDisposable } from "../../../../base/common/lifecycle.js";
import { Event } from "../../../../base/common/event.js";
import Severity from "../../../../base/common/severity.js";
import { localize } from "../../../../nls.js";
import { IAccessibilityService } from "../../../../platform/accessibility/common/accessibility.js";
import { CommandsRegistry } from "../../../../platform/commands/common/commands.js";
import { ConfigurationTarget, IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { INotificationHandle, INotificationService, NotificationPriority } from "../../../../platform/notification/common/notification.js";
import { IWorkbenchContribution } from "../../../common/contributions.js";
import { IStatusbarEntryAccessor, IStatusbarService, StatusbarAlignment } from "../../../services/statusbar/browser/statusbar.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
let AccessibilityStatus = class extends Disposable {
  constructor(configurationService, notificationService, accessibilityService, statusbarService, openerService) {
    super();
    this.configurationService = configurationService;
    this.notificationService = notificationService;
    this.accessibilityService = accessibilityService;
    this.statusbarService = statusbarService;
    this.openerService = openerService;
    this._register(CommandsRegistry.registerCommand({ id: "showEditorScreenReaderNotification", handler: /* @__PURE__ */ __name(() => this.showScreenReaderNotification(), "handler") }));
    this.updateScreenReaderModeElement(this.accessibilityService.isScreenReaderOptimized());
    this.registerListeners();
  }
  static {
    __name(this, "AccessibilityStatus");
  }
  static ID = "workbench.contrib.accessibilityStatus";
  screenReaderNotification = null;
  promptedScreenReader = false;
  screenReaderModeElement = this._register(new MutableDisposable());
  registerListeners() {
    this._register(this.accessibilityService.onDidChangeScreenReaderOptimized(() => this.onScreenReaderModeChange()));
    this._register(this.configurationService.onDidChangeConfiguration((c) => {
      if (c.affectsConfiguration("editor.accessibilitySupport")) {
        this.onScreenReaderModeChange();
      }
    }));
  }
  showScreenReaderNotification() {
    this.screenReaderNotification = this.notificationService.prompt(
      Severity.Info,
      localize("screenReaderDetectedExplanation.question", "Screen reader usage detected. Do you want to enable {0} to optimize the editor for screen reader usage?", "editor.accessibilitySupport"),
      [
        {
          label: localize("screenReaderDetectedExplanation.answerYes", "Yes"),
          run: /* @__PURE__ */ __name(() => {
            this.configurationService.updateValue("editor.accessibilitySupport", "on", ConfigurationTarget.USER);
          }, "run")
        },
        {
          label: localize("screenReaderDetectedExplanation.answerNo", "No"),
          run: /* @__PURE__ */ __name(() => {
            this.configurationService.updateValue("editor.accessibilitySupport", "off", ConfigurationTarget.USER);
          }, "run")
        },
        {
          label: localize("screenReaderDetectedExplanation.answerLearnMore", "Learn More"),
          run: /* @__PURE__ */ __name(() => {
            this.openerService.open("https://code.visualstudio.com/docs/editor/accessibility#_screen-readers");
          }, "run")
        }
      ],
      {
        sticky: true,
        priority: NotificationPriority.URGENT
      }
    );
    Event.once(this.screenReaderNotification.onDidClose)(() => this.screenReaderNotification = null);
  }
  updateScreenReaderModeElement(visible) {
    if (visible) {
      if (!this.screenReaderModeElement.value) {
        const text = localize("screenReaderDetected", "Screen Reader Optimized");
        this.screenReaderModeElement.value = this.statusbarService.addEntry({
          name: localize("status.editor.screenReaderMode", "Screen Reader Mode"),
          text,
          ariaLabel: text,
          command: "showEditorScreenReaderNotification",
          kind: "prominent",
          showInAllWindows: true
        }, "status.editor.screenReaderMode", StatusbarAlignment.RIGHT, 100.6);
      }
    } else {
      this.screenReaderModeElement.clear();
    }
  }
  onScreenReaderModeChange() {
    const screenReaderDetected = this.accessibilityService.isScreenReaderOptimized();
    if (screenReaderDetected) {
      const screenReaderConfiguration = this.configurationService.getValue("editor.accessibilitySupport");
      if (screenReaderConfiguration === "auto") {
        if (!this.promptedScreenReader) {
          this.promptedScreenReader = true;
          setTimeout(() => this.showScreenReaderNotification(), 100);
        }
      }
    }
    if (this.screenReaderNotification) {
      this.screenReaderNotification.close();
    }
    this.updateScreenReaderModeElement(this.accessibilityService.isScreenReaderOptimized());
  }
};
AccessibilityStatus = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, INotificationService),
  __decorateParam(2, IAccessibilityService),
  __decorateParam(3, IStatusbarService),
  __decorateParam(4, IOpenerService)
], AccessibilityStatus);
export {
  AccessibilityStatus
};
//# sourceMappingURL=accessibilityStatus.js.map
