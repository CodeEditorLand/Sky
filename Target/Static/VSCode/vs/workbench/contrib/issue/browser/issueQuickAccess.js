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
import { PickerQuickAccessProvider, IPickerQuickAccessItem, FastAndSlowPicks, Picks, TriggerAction } from "../../../../platform/quickinput/browser/pickerQuickAccess.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IMenuService, MenuId, MenuItemAction, SubmenuItemAction } from "../../../../platform/actions/common/actions.js";
import { matchesFuzzy } from "../../../../base/common/filters.js";
import { IQuickPickSeparator } from "../../../../platform/quickinput/common/quickInput.js";
import { localize } from "../../../../nls.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.js";
import { IExtensionDescription } from "../../../../platform/extensions/common/extensions.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { IssueSource } from "../common/issue.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
let IssueQuickAccess = class extends PickerQuickAccessProvider {
  constructor(menuService, contextKeyService, commandService, extensionService, productService) {
    super(IssueQuickAccess.PREFIX, { canAcceptInBackground: true });
    this.menuService = menuService;
    this.contextKeyService = contextKeyService;
    this.commandService = commandService;
    this.extensionService = extensionService;
    this.productService = productService;
  }
  static {
    __name(this, "IssueQuickAccess");
  }
  static PREFIX = "issue ";
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
IssueQuickAccess = __decorateClass([
  __decorateParam(0, IMenuService),
  __decorateParam(1, IContextKeyService),
  __decorateParam(2, ICommandService),
  __decorateParam(3, IExtensionService),
  __decorateParam(4, IProductService)
], IssueQuickAccess);
export {
  IssueQuickAccess
};
//# sourceMappingURL=issueQuickAccess.js.map
