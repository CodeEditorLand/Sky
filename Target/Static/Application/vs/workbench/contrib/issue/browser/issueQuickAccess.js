var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { PickerQuickAccessProvider, TriggerAction } from "../../../../platform/quickinput/browser/pickerQuickAccess.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IMenuService, MenuId } from "../../../../platform/actions/common/actions.js";
import { matchesFuzzy } from "../../../../base/common/filters.js";
import { localize } from "../../../../nls.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { IssueSource } from "../common/issue.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
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
var IssueQuickAccess_1;
let IssueQuickAccess = class IssueQuickAccess2 extends PickerQuickAccessProvider {
  static {
    __name(this, "IssueQuickAccess");
  }
  static {
    IssueQuickAccess_1 = this;
  }
  static {
    this.PREFIX = "issue ";
  }
  constructor(menuService, contextKeyService, commandService, extensionService, productService) {
    super(IssueQuickAccess_1.PREFIX, { canAcceptInBackground: true });
    this.menuService = menuService;
    this.contextKeyService = contextKeyService;
    this.commandService = commandService;
    this.extensionService = extensionService;
    this.productService = productService;
  }
  _getPicks(filter) {
    const issuePicksConst = new Array();
    const issuePicksParts = new Array();
    const extensionIdSet = /* @__PURE__ */ new Set();
    const productLabel = this.productService.nameLong;
    const marketPlaceLabel = localize("reportExtensionMarketplace", "Extension Marketplace");
    const productFilter = matchesFuzzy(filter, productLabel, true);
    const marketPlaceFilter = matchesFuzzy(filter, marketPlaceLabel, true);
    if (productFilter) {
      issuePicksConst.push({
        label: productLabel,
        ariaLabel: productLabel,
        highlights: { label: productFilter },
        accept: /* @__PURE__ */ __name(() => this.commandService.executeCommand("workbench.action.openIssueReporter", { issueSource: IssueSource.VSCode }), "accept")
      });
    }
    if (marketPlaceFilter) {
      issuePicksConst.push({
        label: marketPlaceLabel,
        ariaLabel: marketPlaceLabel,
        highlights: { label: marketPlaceFilter },
        accept: /* @__PURE__ */ __name(() => this.commandService.executeCommand("workbench.action.openIssueReporter", { issueSource: IssueSource.Marketplace }), "accept")
      });
    }
    issuePicksConst.push({ type: "separator", label: localize("extensions", "Extensions") });
    const actions = this.menuService.getMenuActions(MenuId.IssueReporter, this.contextKeyService, { renderShortTitle: true }).flatMap((entry) => entry[1]);
    actions.forEach((action) => {
      if ("source" in action.item && action.item.source) {
        extensionIdSet.add(action.item.source.id);
      }
      const pick = this._createPick(filter, action);
      if (pick) {
        issuePicksParts.push(pick);
      }
    });
    this.extensionService.extensions.forEach((extension) => {
      if (!extension.isBuiltin) {
        const pick = this._createPick(filter, void 0, extension);
        const id = extension.identifier.value;
        if (pick && !extensionIdSet.has(id)) {
          issuePicksParts.push(pick);
        }
        extensionIdSet.add(id);
      }
    });
    issuePicksParts.sort((a, b) => {
      const aLabel = a.label ?? "";
      const bLabel = b.label ?? "";
      return aLabel.localeCompare(bLabel);
    });
    return [...issuePicksConst, ...issuePicksParts];
  }
  _createPick(filter, action, extension) {
    const buttons = [{
      iconClass: ThemeIcon.asClassName(Codicon.info),
      tooltip: localize("contributedIssuePage", "Open Extension Page")
    }];
    let label;
    let trigger;
    let accept;
    if (action && "source" in action.item && action.item.source) {
      label = action.item.source?.title;
      trigger = /* @__PURE__ */ __name(() => {
        if ("source" in action.item && action.item.source) {
          this.commandService.executeCommand("extension.open", action.item.source.id);
        }
        return TriggerAction.CLOSE_PICKER;
      }, "trigger");
      accept = /* @__PURE__ */ __name(() => {
        action.run();
      }, "accept");
    } else if (extension) {
      label = extension.displayName ?? extension.name;
      trigger = /* @__PURE__ */ __name(() => {
        this.commandService.executeCommand("extension.open", extension.identifier.value);
        return TriggerAction.CLOSE_PICKER;
      }, "trigger");
      accept = /* @__PURE__ */ __name(() => {
        this.commandService.executeCommand("workbench.action.openIssueReporter", extension.identifier.value);
      }, "accept");
    } else {
      return void 0;
    }
    const highlights = matchesFuzzy(filter, label, true);
    if (highlights) {
      return {
        label,
        highlights: { label: highlights },
        buttons,
        trigger,
        accept
      };
    }
    return void 0;
  }
};
IssueQuickAccess = IssueQuickAccess_1 = __decorate([
  __param(0, IMenuService),
  __param(1, IContextKeyService),
  __param(2, ICommandService),
  __param(3, IExtensionService),
  __param(4, IProductService)
], IssueQuickAccess);
export {
  IssueQuickAccess
};
//# sourceMappingURL=issueQuickAccess.js.map
