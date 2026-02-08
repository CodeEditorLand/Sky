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
import * as dom from "../../../../base/browser/dom.js";
import { mainWindow } from "../../../../base/browser/window.js";
import { CancellationTokenSource } from "../../../../base/common/cancellation.js";
import { Disposable, DisposableResourceMap, toDisposable } from "../../../../base/common/lifecycle.js";
import { autorunDelta, autorunIterableDelta } from "../../../../base/common/observable.js";
import { localize } from "../../../../nls.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IHostService } from "../../../services/host/browser/host.js";
import { IChatService } from "../common/chatService/chatService.js";
import { IChatWidgetService } from "./chat.js";
import { AcceptToolConfirmationActionId } from "./actions/chatToolActions.js";
let ChatWindowNotifier = class ChatWindowNotifier2 extends Disposable {
  static {
    __name(this, "ChatWindowNotifier");
  }
  static {
    this.ID = "workbench.contrib.chatWindowNotifier";
  }
  constructor(_chatService, _chatWidgetService, _hostService, _configurationService, _commandService) {
    super();
    this._chatService = _chatService;
    this._chatWidgetService = _chatWidgetService;
    this._hostService = _hostService;
    this._configurationService = _configurationService;
    this._commandService = _commandService;
    this._activeNotifications = this._register(new DisposableResourceMap());
    const modelTrackers = this._register(new DisposableResourceMap());
    this._register(autorunIterableDelta((reader) => this._chatService.chatModels.read(reader), ({ addedValues, removedValues }) => {
      for (const model of addedValues) {
        modelTrackers.set(model.sessionResource, this._trackModel(model));
      }
      for (const model of removedValues) {
        modelTrackers.deleteAndDispose(model.sessionResource);
      }
    }));
  }
  _trackModel(model) {
    return autorunDelta(model.requestNeedsInput, ({ lastValue, newValue }) => {
      const currentNeedsInput = !!newValue;
      const previousNeedsInput = !!lastValue;
      if (!previousNeedsInput && currentNeedsInput && newValue) {
        this._notifyIfNeeded(model.sessionResource, newValue);
      } else if (previousNeedsInput && !currentNeedsInput) {
        this._clearNotification(model.sessionResource);
      }
    });
  }
  async _notifyIfNeeded(sessionResource, info) {
    if (!this._configurationService.getValue("chat.notifyWindowOnConfirmation")) {
      return;
    }
    const widget = this._chatWidgetService.getWidgetBySessionResource(sessionResource);
    const targetWindow = widget ? dom.getWindow(widget.domNode) : mainWindow;
    if (targetWindow.document.hasFocus()) {
      return;
    }
    this._clearNotification(sessionResource);
    await this._hostService.focus(targetWindow, {
      mode: 1
      /* FocusMode.Notify */
    });
    const notificationTitle = info.title ? localize("chatTitle", "Chat: {0}", info.title) : localize("chat.untitledChat", "Untitled Chat");
    const cts = new CancellationTokenSource();
    this._activeNotifications.set(sessionResource, toDisposable(() => cts.dispose(true)));
    try {
      const result = await this._hostService.showToast({
        title: this._sanitizeOSToastText(notificationTitle),
        body: info.detail ? this._sanitizeOSToastText(info.detail) : localize("notificationDetail", "Approval needed to continue."),
        actions: [localize("allowAction", "Allow")]
      }, cts.token);
      if (result.clicked || typeof result.actionIndex === "number") {
        await this._hostService.focus(targetWindow, {
          mode: 2
          /* FocusMode.Force */
        });
        const widget2 = await this._chatWidgetService.openSession(sessionResource);
        widget2?.focusInput();
        if (result.actionIndex === 0) {
          await this._commandService.executeCommand(AcceptToolConfirmationActionId, { sessionResource });
        }
      }
    } finally {
      this._clearNotification(sessionResource);
    }
  }
  _sanitizeOSToastText(text) {
    return text.replace(/`/g, "'");
  }
  _clearNotification(sessionResource) {
    this._activeNotifications.deleteAndDispose(sessionResource);
  }
};
ChatWindowNotifier = __decorate([
  __param(0, IChatService),
  __param(1, IChatWidgetService),
  __param(2, IHostService),
  __param(3, IConfigurationService),
  __param(4, ICommandService)
], ChatWindowNotifier);
export {
  ChatWindowNotifier
};
//# sourceMappingURL=chatWindowNotifier.js.map
