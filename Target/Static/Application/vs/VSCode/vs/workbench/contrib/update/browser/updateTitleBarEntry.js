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
import { BaseActionViewItem } from "../../../../base/browser/ui/actionbar/actionViewItems.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { isWeb } from "../../../../base/common/platform.js";
import { localize } from "../../../../nls.js";
import { IActionViewItemService } from "../../../../platform/actions/browser/actionViewItemService.js";
import { Action2, MenuId, registerAction2 } from "../../../../platform/actions/common/actions.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IContextKeyService, RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { IUpdateService } from "../../../../platform/update/common/update.js";
import { computeProgressPercent, tryParseVersion } from "../common/updateUtils.js";
import "./media/updateTitleBarEntry.css";
import { UpdateTooltip } from "./updateTooltip.js";
const UPDATE_TITLE_BAR_ACTION_ID = "workbench.actions.updateIndicator";
const UPDATE_TITLE_BAR_CONTEXT = new RawContextKey("updateTitleBar", false);
const LAST_KNOWN_VERSION_KEY = "updateTitleBar/lastKnownVersion";
const ACTIONABLE_STATES = [
  "available for download",
  "downloaded",
  "ready"
  /* StateType.Ready */
];
registerAction2(class UpdateIndicatorTitleBarAction extends Action2 {
  static {
    __name(this, "UpdateIndicatorTitleBarAction");
  }
  constructor() {
    super({
      id: UPDATE_TITLE_BAR_ACTION_ID,
      title: localize("updateIndicatorTitleBarAction", "Update"),
      f1: false,
      menu: [{
        id: MenuId.CommandCenter,
        order: 10003,
        when: UPDATE_TITLE_BAR_CONTEXT
      }]
    });
  }
  async run() {
  }
});
let UpdateTitleBarContribution = class UpdateTitleBarContribution2 extends Disposable {
  static {
    __name(this, "UpdateTitleBarContribution");
  }
  constructor(actionViewItemService, configurationService, contextKeyService, instantiationService, productService, storageService, updateService) {
    super();
    this.productService = productService;
    this.storageService = storageService;
    if (isWeb) {
      return;
    }
    const context = UPDATE_TITLE_BAR_CONTEXT.bindTo(contextKeyService);
    const updateContext = /* @__PURE__ */ __name(() => {
      const mode = configurationService.getValue("update.titleBar");
      const state = updateService.state.type;
      context.set(mode === "detailed" || mode === "actionable" && ACTIONABLE_STATES.includes(state));
    }, "updateContext");
    let entry;
    let showTooltipOnRender = false;
    this._register(actionViewItemService.register(MenuId.CommandCenter, UPDATE_TITLE_BAR_ACTION_ID, (action, options) => {
      entry = instantiationService.createInstance(UpdateTitleBarEntry, action, options, updateContext, showTooltipOnRender);
      showTooltipOnRender = false;
      return entry;
    }));
    const onStateChange = /* @__PURE__ */ __name(() => {
      if (this.shouldShowTooltip(updateService.state)) {
        if (context.get()) {
          entry?.showTooltip();
        } else {
          context.set(true);
          showTooltipOnRender = true;
        }
      } else {
        updateContext();
      }
    }, "onStateChange");
    this._register(updateService.onStateChange(onStateChange));
    this._register(configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("update.titleBar")) {
        updateContext();
      }
    }));
    onStateChange();
  }
  shouldShowTooltip(state) {
    switch (state.type) {
      case "disabled":
        return state.reason === 5 || state.reason === 6;
      case "idle":
        return !!state.error || state.notAvailable || this.isMajorMinorVersionChange();
      case "available for download":
      case "downloaded":
      case "ready":
        return true;
      default:
        return false;
    }
  }
  isMajorMinorVersionChange() {
    const currentVersion = this.productService.version;
    const lastKnownVersion = this.storageService.get(
      LAST_KNOWN_VERSION_KEY,
      -1
      /* StorageScope.APPLICATION */
    );
    this.storageService.store(
      LAST_KNOWN_VERSION_KEY,
      currentVersion,
      -1,
      1
      /* StorageTarget.MACHINE */
    );
    if (!lastKnownVersion) {
      return false;
    }
    const current = tryParseVersion(currentVersion);
    const last = tryParseVersion(lastKnownVersion);
    if (!current || !last) {
      return false;
    }
    return current.major !== last.major || current.minor !== last.minor;
  }
};
UpdateTitleBarContribution = __decorate([
  __param(0, IActionViewItemService),
  __param(1, IConfigurationService),
  __param(2, IContextKeyService),
  __param(3, IInstantiationService),
  __param(4, IProductService),
  __param(5, IStorageService),
  __param(6, IUpdateService)
], UpdateTitleBarContribution);
let UpdateTitleBarEntry = class UpdateTitleBarEntry2 extends BaseActionViewItem {
  static {
    __name(this, "UpdateTitleBarEntry");
  }
  constructor(action, options, onDisposeTooltip, showTooltipOnRender, commandService, hoverService, instantiationService, updateService) {
    super(void 0, action, options);
    this.onDisposeTooltip = onDisposeTooltip;
    this.showTooltipOnRender = showTooltipOnRender;
    this.commandService = commandService;
    this.hoverService = hoverService;
    this.updateService = updateService;
    this.action.run = () => this.runAction();
    this.tooltip = this._register(instantiationService.createInstance(UpdateTooltip));
    this._register(this.updateService.onStateChange((state) => this.updateContent(state)));
  }
  render(container) {
    super.render(container);
    this.content = dom.append(container, dom.$(".update-indicator"));
    this.updateTooltip();
    this.updateContent(this.updateService.state);
    if (this.showTooltipOnRender) {
      this.showTooltipOnRender = false;
      dom.scheduleAtNextAnimationFrame(dom.getWindow(container), () => this.showTooltip());
    }
  }
  getHoverContents() {
    return this.tooltip.domNode;
  }
  runAction() {
    switch (this.updateService.state.type) {
      case "available for download":
        this.commandService.executeCommand("update.downloadNow");
        break;
      case "downloaded":
        this.commandService.executeCommand("update.install");
        break;
      case "ready":
        this.commandService.executeCommand("update.restart");
        break;
      default:
        this.showTooltip();
        break;
    }
  }
  showTooltip() {
    if (!this.content?.isConnected) {
      return;
    }
    this.hoverService.showInstantHover({
      content: this.tooltip.domNode,
      target: {
        targetElements: [this.content],
        dispose: /* @__PURE__ */ __name(() => this.onDisposeTooltip(), "dispose")
      },
      persistence: { sticky: true },
      appearance: { showPointer: true }
    }, true);
  }
  updateContent(state) {
    if (!this.content) {
      return;
    }
    dom.clearNode(this.content);
    this.content.classList.remove("prominent", "progress-indefinite", "progress-percent", "update-disabled");
    this.content.style.removeProperty("--update-progress");
    const label = dom.append(this.content, dom.$(".indicator-label"));
    label.textContent = localize("updateIndicator.update", "Update");
    switch (state.type) {
      case "disabled":
        this.content.classList.add("update-disabled");
        break;
      case "checking for updates":
      case "overwriting":
        this.renderProgressState(this.content);
        break;
      case "available for download":
      case "downloaded":
      case "ready":
        this.content.classList.add("prominent");
        break;
      case "downloading":
        this.renderProgressState(this.content, computeProgressPercent(state.downloadedBytes, state.totalBytes));
        break;
      case "updating":
        this.renderProgressState(this.content, computeProgressPercent(state.currentProgress, state.maxProgress));
        break;
    }
  }
  renderProgressState(content, percentage) {
    if (percentage !== void 0) {
      content.classList.add("progress-percent");
      content.style.setProperty("--update-progress", `${percentage}%`);
    } else {
      content.classList.add("progress-indefinite");
    }
  }
};
UpdateTitleBarEntry = __decorate([
  __param(4, ICommandService),
  __param(5, IHoverService),
  __param(6, IInstantiationService),
  __param(7, IUpdateService)
], UpdateTitleBarEntry);
export {
  UpdateTitleBarContribution,
  UpdateTitleBarEntry
};
//# sourceMappingURL=updateTitleBarEntry.js.map
