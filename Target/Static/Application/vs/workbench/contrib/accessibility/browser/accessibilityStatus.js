var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Disposable, MutableDisposable } from "../../../../base/common/lifecycle.js";
import { Event } from "../../../../base/common/event.js";
import Severity from "../../../../base/common/severity.js";
import { localize } from "../../../../nls.js";
import { IAccessibilityService } from "../../../../platform/accessibility/common/accessibility.js";
import { CommandsRegistry } from "../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { INotificationService, NotificationPriority } from "../../../../platform/notification/common/notification.js";
import { IStatusbarService } from "../../../services/statusbar/browser/statusbar.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
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
let AccessibilityStatus = class AccessibilityStatus2 extends Disposable {
  static {
    __name(this, "AccessibilityStatus");
  }
  static {
    this.ID = "workbench.contrib.accessibilityStatus";
  }
  constructor(configurationService, notificationService, accessibilityService, statusbarService, openerService) {
    super();
    this.configurationService = configurationService;
    this.notificationService = notificationService;
    this.accessibilityService = accessibilityService;
    this.statusbarService = statusbarService;
    this.openerService = openerService;
    this.screenReaderNotification = null;
    this.promptedScreenReader = false;
    this.screenReaderModeElement = this._register(new MutableDisposable());
    this._register(CommandsRegistry.registerCommand({ id: "showEditorScreenReaderNotification", handler: /* @__PURE__ */ __name(() => this.showScreenReaderNotification(), "handler") }));
    this.updateScreenReaderModeElement(this.accessibilityService.isScreenReaderOptimized());
    this.registerListeners();
  }
  registerListeners() {
    this._register(this.accessibilityService.onDidChangeScreenReaderOptimized(() => this.onScreenReaderModeChange()));
    this._register(this.configurationService.onDidChangeConfiguration((c) => {
      if (c.affectsConfiguration("editor.accessibilitySupport")) {
        this.onScreenReaderModeChange();
      }
    }));
  }
  showScreenReaderNotification() {
    this.screenReaderNotification = this.notificationService.prompt(Severity.Info, localize("screenReaderDetectedExplanation.question", "Screen reader usage detected. Do you want to enable {0} to optimize the editor for screen reader usage?", "editor.accessibilitySupport"), [
      {
        label: localize("screenReaderDetectedExplanation.answerYes", "Yes"),
        run: /* @__PURE__ */ __name(() => {
          this.configurationService.updateValue(
            "editor.accessibilitySupport",
            "on",
            2
            /* ConfigurationTarget.USER */
          );
        }, "run")
      },
      {
        label: localize("screenReaderDetectedExplanation.answerNo", "No"),
        run: /* @__PURE__ */ __name(() => {
          this.configurationService.updateValue(
            "editor.accessibilitySupport",
            "off",
            2
            /* ConfigurationTarget.USER */
          );
        }, "run")
      },
      {
        label: localize("screenReaderDetectedExplanation.answerLearnMore", "Learn More"),
        run: /* @__PURE__ */ __name(() => {
          this.openerService.open("https://code.visualstudio.com/docs/editor/accessibility#_screen-readers");
        }, "run")
      }
    ], {
      sticky: true,
      priority: NotificationPriority.URGENT
    });
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
        }, "status.editor.screenReaderMode", 1, 100.6);
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
AccessibilityStatus = __decorate([
  __param(0, IConfigurationService),
  __param(1, INotificationService),
  __param(2, IAccessibilityService),
  __param(3, IStatusbarService),
  __param(4, IOpenerService)
], AccessibilityStatus);
export {
  AccessibilityStatus
};
//# sourceMappingURL=accessibilityStatus.js.map
