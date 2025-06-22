var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Registry } from "../../../platform/registry/common/platform.js";
import { Extensions, IOutputService, OUTPUT_VIEW_ID, OutputChannelUpdateMode } from "../../services/output/common/output.js";
import { MainContext, ExtHostContext } from "../common/extHost.protocol.js";
import { extHostNamedCustomer } from "../../services/extensions/common/extHostCustomers.js";
import { URI } from "../../../base/common/uri.js";
import { Disposable, MutableDisposable, toDisposable } from "../../../base/common/lifecycle.js";
import { Event } from "../../../base/common/event.js";
import { IViewsService } from "../../services/views/common/viewsService.js";
import { isNumber } from "../../../base/common/types.js";
import { IConfigurationService } from "../../../platform/configuration/common/configuration.js";
import { IStatusbarService } from "../../services/statusbar/browser/statusbar.js";
import { localize } from "../../../nls.js";
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
var MainThreadOutputService_1;
let MainThreadOutputService = class MainThreadOutputService2 extends Disposable {
  static {
    __name(this, "MainThreadOutputService");
  }
  static {
    MainThreadOutputService_1 = this;
  }
  static {
    this._extensionIdPool = /* @__PURE__ */ new Map();
  }
  constructor(extHostContext, outputService, viewsService, configurationService, statusbarService) {
    super();
    this._outputStatusItem = this._register(new MutableDisposable());
    this._outputService = outputService;
    this._viewsService = viewsService;
    this._configurationService = configurationService;
    this._statusbarService = statusbarService;
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostOutputService);
    const setVisibleChannel = /* @__PURE__ */ __name(() => {
      const visibleChannel = this._viewsService.isViewVisible(OUTPUT_VIEW_ID) ? this._outputService.getActiveChannel() : void 0;
      this._proxy.$setVisibleChannel(visibleChannel ? visibleChannel.id : null);
      this._outputStatusItem.value = void 0;
    }, "setVisibleChannel");
    this._register(Event.any(this._outputService.onActiveOutputChannel, Event.filter(this._viewsService.onDidChangeViewVisibility, ({ id }) => id === OUTPUT_VIEW_ID))(() => setVisibleChannel()));
    setVisibleChannel();
  }
  async $register(label, file, languageId, extensionId) {
    const idCounter = (MainThreadOutputService_1._extensionIdPool.get(extensionId) || 0) + 1;
    MainThreadOutputService_1._extensionIdPool.set(extensionId, idCounter);
    const id = `extension-output-${extensionId}-#${idCounter}-${label}`;
    const resource = URI.revive(file);
    Registry.as(Extensions.OutputChannels).registerChannel({ id, label, source: { resource }, log: false, languageId, extensionId });
    this._register(toDisposable(() => this.$dispose(id)));
    return id;
  }
  async $update(channelId, mode, till) {
    const channel = this._getChannel(channelId);
    if (channel) {
      if (mode === OutputChannelUpdateMode.Append) {
        channel.update(mode);
      } else if (isNumber(till)) {
        channel.update(mode, till);
      }
    }
  }
  async $reveal(channelId, preserveFocus) {
    const channel = this._getChannel(channelId);
    if (!channel) {
      return;
    }
    const viewsToShowQuietly = this._configurationService.getValue("workbench.view.showQuietly") ?? {};
    if (!this._viewsService.isViewVisible(OUTPUT_VIEW_ID) && viewsToShowQuietly[OUTPUT_VIEW_ID]) {
      this._showChannelQuietly(channel);
      return;
    }
    this._outputService.showChannel(channel.id, preserveFocus);
  }
  // Show status bar indicator
  _showChannelQuietly(channel) {
    const statusProperties = {
      name: localize("status.showOutput", "Show Output"),
      text: "$(output)",
      ariaLabel: localize("status.showOutputAria", "Show {0} Output Channel", channel.label),
      command: `workbench.action.output.show.${channel.id}`,
      tooltip: localize("status.showOutputTooltip", "Show {0} Output Channel", channel.label),
      kind: "prominent"
    };
    if (!this._outputStatusItem.value) {
      this._outputStatusItem.value = this._statusbarService.addEntry(statusProperties, "status.view.showQuietly", 1, {
        location: { id: "status.notifications", priority: Number.NEGATIVE_INFINITY },
        alignment: 0
        /* StatusbarAlignment.LEFT */
      });
    } else {
      this._outputStatusItem.value.update(statusProperties);
    }
  }
  async $close(channelId) {
    if (this._viewsService.isViewVisible(OUTPUT_VIEW_ID)) {
      const activeChannel = this._outputService.getActiveChannel();
      if (activeChannel && channelId === activeChannel.id) {
        this._viewsService.closeView(OUTPUT_VIEW_ID);
      }
    }
  }
  async $dispose(channelId) {
    const channel = this._getChannel(channelId);
    channel?.dispose();
  }
  _getChannel(channelId) {
    return this._outputService.getChannel(channelId);
  }
};
MainThreadOutputService = MainThreadOutputService_1 = __decorate([
  extHostNamedCustomer(MainContext.MainThreadOutputService),
  __param(1, IOutputService),
  __param(2, IViewsService),
  __param(3, IConfigurationService),
  __param(4, IStatusbarService)
], MainThreadOutputService);
export {
  MainThreadOutputService
};
//# sourceMappingURL=mainThreadOutputService.js.map
