var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { localize } from "../../../../nls.js";
import * as platform from "../../../../base/common/platform.js";
import { MenuItemAction } from "../../../../platform/actions/common/actions.js";
import { Action } from "../../../../base/common/actions.js";
import { createActionViewItem, getActionBarActions, getContextMenuActions } from "../../../../platform/actions/browser/menuEntryActionViewItem.js";
import { equals } from "../../../../base/common/arrays.js";
import { ActionViewItem } from "../../../../base/browser/ui/actionbar/actionViewItems.js";
import { renderLabelWithIcons } from "../../../../base/browser/ui/iconLabel/iconLabels.js";
import { reset } from "../../../../base/browser/dom.js";
import { ResourceTree } from "../../../../base/common/resourceTree.js";
import { MarkdownString } from "../../../../base/common/htmlContent.js";
import { URI } from "../../../../base/common/uri.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { fromNow, safeIntl } from "../../../../base/common/date.js";
import { historyItemHoverAdditionsForeground, historyItemHoverDefaultLabelBackground, historyItemHoverDefaultLabelForeground, historyItemHoverDeletionsForeground, historyItemHoverLabelForeground } from "./scmHistory.js";
import { asCssVariable } from "../../../../platform/theme/common/colorUtils.js";
function isSCMViewService(element) {
  return Array.isArray(element.repositories) && Array.isArray(element.visibleRepositories);
}
__name(isSCMViewService, "isSCMViewService");
function isSCMRepository(element) {
  return !!element.provider && !!element.input;
}
__name(isSCMRepository, "isSCMRepository");
function isSCMInput(element) {
  return !!element.validateInput && typeof element.value === "string";
}
__name(isSCMInput, "isSCMInput");
function isSCMActionButton(element) {
  return element.type === "actionButton";
}
__name(isSCMActionButton, "isSCMActionButton");
function isSCMResourceGroup(element) {
  return !!element.provider && !!element.resources;
}
__name(isSCMResourceGroup, "isSCMResourceGroup");
function isSCMResource(element) {
  return !!element.sourceUri && isSCMResourceGroup(element.resourceGroup);
}
__name(isSCMResource, "isSCMResource");
function isSCMResourceNode(element) {
  return ResourceTree.isResourceNode(element) && isSCMResourceGroup(element.context);
}
__name(isSCMResourceNode, "isSCMResourceNode");
function isSCMHistoryItemViewModelTreeElement(element) {
  return element.type === "historyItemViewModel";
}
__name(isSCMHistoryItemViewModelTreeElement, "isSCMHistoryItemViewModelTreeElement");
function isSCMHistoryItemLoadMoreTreeElement(element) {
  return element.type === "historyItemLoadMore";
}
__name(isSCMHistoryItemLoadMoreTreeElement, "isSCMHistoryItemLoadMoreTreeElement");
function isSCMHistoryItemChangeViewModelTreeElement(element) {
  return element.type === "historyItemChangeViewModel";
}
__name(isSCMHistoryItemChangeViewModelTreeElement, "isSCMHistoryItemChangeViewModelTreeElement");
function isSCMHistoryItemChangeNode(element) {
  return ResourceTree.isResourceNode(element) && isSCMHistoryItemViewModelTreeElement(element.context);
}
__name(isSCMHistoryItemChangeNode, "isSCMHistoryItemChangeNode");
const compareActions = /* @__PURE__ */ __name((a, b) => {
  if (a instanceof MenuItemAction && b instanceof MenuItemAction) {
    return a.id === b.id && a.enabled === b.enabled && a.hideActions?.isHidden === b.hideActions?.isHidden;
  }
  return a.id === b.id && a.enabled === b.enabled;
}, "compareActions");
function connectPrimaryMenu(menu, callback, primaryGroup) {
  let cachedPrimary = [];
  let cachedSecondary = [];
  const updateActions = /* @__PURE__ */ __name(() => {
    const { primary, secondary } = getActionBarActions(menu.getActions({ shouldForwardArgs: true }), primaryGroup);
    if (equals(cachedPrimary, primary, compareActions) && equals(cachedSecondary, secondary, compareActions)) {
      return;
    }
    cachedPrimary = primary;
    cachedSecondary = secondary;
    callback(primary, secondary);
  }, "updateActions");
  updateActions();
  return menu.onDidChange(updateActions);
}
__name(connectPrimaryMenu, "connectPrimaryMenu");
function collectContextMenuActions(menu) {
  return getContextMenuActions(menu.getActions({ shouldForwardArgs: true }), "inline").secondary;
}
__name(collectContextMenuActions, "collectContextMenuActions");
class StatusBarAction extends Action {
  static {
    __name(this, "StatusBarAction");
  }
  constructor(command, commandService) {
    super(`statusbaraction{${command.id}}`, command.title, "", true);
    this.command = command;
    this.commandService = commandService;
    this.tooltip = command.tooltip || "";
  }
  run() {
    return this.commandService.executeCommand(this.command.id, ...this.command.arguments || []);
  }
}
class StatusBarActionViewItem extends ActionViewItem {
  static {
    __name(this, "StatusBarActionViewItem");
  }
  constructor(action, options) {
    super(null, action, { ...options, icon: false, label: true });
  }
  updateLabel() {
    if (this.options.label && this.label) {
      reset(this.label, ...renderLabelWithIcons(this.action.label));
    }
  }
}
function getActionViewItemProvider(instaService) {
  return (action, options) => {
    if (action instanceof StatusBarAction) {
      return new StatusBarActionViewItem(action, options);
    }
    return createActionViewItem(instaService, action, options);
  };
}
__name(getActionViewItemProvider, "getActionViewItemProvider");
function getProviderKey(provider) {
  return `${provider.contextValue}:${provider.label}${provider.rootUri ? `:${provider.rootUri.toString()}` : ""}`;
}
__name(getProviderKey, "getProviderKey");
function getRepositoryResourceCount(provider) {
  return provider.groups.reduce((r, g) => r + g.resources.length, 0);
}
__name(getRepositoryResourceCount, "getRepositoryResourceCount");
function getHistoryItemEditorTitle(historyItem, maxLength = 20) {
  const title = historyItem.subject.length <= maxLength ? historyItem.subject : `${historyItem.subject.substring(0, maxLength)}\u2026`;
  return `${historyItem.displayId ?? historyItem.id} - ${title}`;
}
__name(getHistoryItemEditorTitle, "getHistoryItemEditorTitle");
function getHistoryItemHoverContent(themeService, historyItem) {
  const colorTheme = themeService.getColorTheme();
  const markdown = new MarkdownString("", { isTrusted: true, supportThemeIcons: true });
  if (historyItem.author) {
    const icon = URI.isUri(historyItem.authorIcon) ? `![${historyItem.author}](${historyItem.authorIcon.toString()}|width=20,height=20)` : ThemeIcon.isThemeIcon(historyItem.authorIcon) ? `$(${historyItem.authorIcon.id})` : "$(account)";
    if (historyItem.authorEmail) {
      const emailTitle = localize("emailLinkTitle", "Email");
      markdown.appendMarkdown(`${icon} [**${historyItem.author}**](mailto:${historyItem.authorEmail} "${emailTitle} ${historyItem.author}")`);
    } else {
      markdown.appendMarkdown(`${icon} **${historyItem.author}**`);
    }
    if (historyItem.timestamp) {
      const dateFormatter = safeIntl.DateTimeFormat(platform.language, { year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "numeric" }).value;
      markdown.appendMarkdown(`, $(history) ${fromNow(historyItem.timestamp, true, true)} (${dateFormatter.format(historyItem.timestamp)})`);
    }
    markdown.appendMarkdown("\n\n");
  }
  markdown.appendMarkdown(`${historyItem.message.replace(/\r\n|\r|\n/g, "\n\n")}

`);
  if (historyItem.statistics) {
    markdown.appendMarkdown(`---

`);
    markdown.appendMarkdown(`<span>${historyItem.statistics.files === 1 ? localize("fileChanged", "{0} file changed", historyItem.statistics.files) : localize("filesChanged", "{0} files changed", historyItem.statistics.files)}</span>`);
    if (historyItem.statistics.insertions) {
      const additionsForegroundColor = colorTheme.getColor(historyItemHoverAdditionsForeground);
      markdown.appendMarkdown(`,&nbsp;<span style="color:${additionsForegroundColor};">${historyItem.statistics.insertions === 1 ? localize("insertion", "{0} insertion{1}", historyItem.statistics.insertions, "(+)") : localize("insertions", "{0} insertions{1}", historyItem.statistics.insertions, "(+)")}</span>`);
    }
    if (historyItem.statistics.deletions) {
      const deletionsForegroundColor = colorTheme.getColor(historyItemHoverDeletionsForeground);
      markdown.appendMarkdown(`,&nbsp;<span style="color:${deletionsForegroundColor};">${historyItem.statistics.deletions === 1 ? localize("deletion", "{0} deletion{1}", historyItem.statistics.deletions, "(-)") : localize("deletions", "{0} deletions{1}", historyItem.statistics.deletions, "(-)")}</span>`);
    }
  }
  if ((historyItem.references ?? []).length > 0) {
    markdown.appendMarkdown(`

---

`);
    markdown.appendMarkdown((historyItem.references ?? []).map((ref) => {
      const labelIconId = ThemeIcon.isThemeIcon(ref.icon) ? ref.icon.id : "";
      const labelBackgroundColor = ref.color ? asCssVariable(ref.color) : asCssVariable(historyItemHoverDefaultLabelBackground);
      const labelForegroundColor = ref.color ? asCssVariable(historyItemHoverLabelForeground) : asCssVariable(historyItemHoverDefaultLabelForeground);
      return `<span style="color:${labelForegroundColor};background-color:${labelBackgroundColor};border-radius:10px;">&nbsp;$(${labelIconId})&nbsp;${ref.name}&nbsp;&nbsp;</span>`;
    }).join("&nbsp;&nbsp;"));
  }
  return { markdown, markdownNotSupportedFallback: historyItem.message };
}
__name(getHistoryItemHoverContent, "getHistoryItemHoverContent");
export {
  StatusBarAction,
  collectContextMenuActions,
  connectPrimaryMenu,
  getActionViewItemProvider,
  getHistoryItemEditorTitle,
  getHistoryItemHoverContent,
  getProviderKey,
  getRepositoryResourceCount,
  isSCMActionButton,
  isSCMHistoryItemChangeNode,
  isSCMHistoryItemChangeViewModelTreeElement,
  isSCMHistoryItemLoadMoreTreeElement,
  isSCMHistoryItemViewModelTreeElement,
  isSCMInput,
  isSCMRepository,
  isSCMResource,
  isSCMResourceGroup,
  isSCMResourceNode,
  isSCMViewService
};
//# sourceMappingURL=util.js.map
