var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { MenuItemAction } from "../../../../platform/actions/common/actions.js";
import { Action } from "../../../../base/common/actions.js";
import { createActionViewItem, getActionBarActions, getContextMenuActions } from "../../../../platform/actions/browser/menuEntryActionViewItem.js";
import { equals } from "../../../../base/common/arrays.js";
import { ActionViewItem } from "../../../../base/browser/ui/actionbar/actionViewItems.js";
import { renderLabelWithIcons } from "../../../../base/browser/ui/iconLabel/iconLabels.js";
import { reset } from "../../../../base/browser/dom.js";
import { ResourceTree } from "../../../../base/common/resourceTree.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { Codicon } from "../../../../base/common/codicons.js";
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
function isSCMArtifactGroupTreeElement(element) {
  return element.type === "artifactGroup";
}
__name(isSCMArtifactGroupTreeElement, "isSCMArtifactGroupTreeElement");
function isSCMArtifactNode(element) {
  return ResourceTree.isResourceNode(element) && isSCMArtifactGroupTreeElement(element.context);
}
__name(isSCMArtifactNode, "isSCMArtifactNode");
function isSCMArtifactTreeElement(element) {
  return element.type === "artifact";
}
__name(isSCMArtifactTreeElement, "isSCMArtifactTreeElement");
const compareActions = /* @__PURE__ */ __name((a, b) => {
  if (a instanceof MenuItemAction && b instanceof MenuItemAction) {
    return a.id === b.id && a.enabled === b.enabled && a.hideActions?.isHidden === b.hideActions?.isHidden;
  }
  return a.id === b.id && a.enabled === b.enabled;
}, "compareActions");
function connectPrimaryMenu(menu, callback, primaryGroup, arg) {
  let cachedPrimary = [];
  let cachedSecondary = [];
  const updateActions = /* @__PURE__ */ __name(() => {
    const { primary, secondary } = getActionBarActions(menu.getActions({ arg, shouldForwardArgs: true }), primaryGroup);
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
function collectContextMenuActions(menu, arg) {
  return getContextMenuActions(menu.getActions({ arg, shouldForwardArgs: true }), "inline").secondary;
}
__name(collectContextMenuActions, "collectContextMenuActions");
class StatusBarAction extends Action {
  static {
    __name(this, "StatusBarAction");
  }
  constructor(command, commandService) {
    super(`statusbaraction{${command.id}}`, getStatusBarCommandGenericName(command), "", true);
    this.command = command;
    this.commandService = commandService;
    this.commandTitle = command.title;
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
    this._commandTitle = action.commandTitle;
  }
  render(container) {
    container.classList.add("scm-status-bar-action");
    super.render(container);
  }
  updateLabel() {
    if (this.options.label && this.label) {
      const elements = renderLabelWithIcons(this._commandTitle ?? this.action.label).map((element) => {
        if (typeof element === "string") {
          const span = document.createElement("span");
          span.textContent = element;
          return span;
        }
        return element;
      });
      reset(this.label, ...elements);
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
  return `${provider.providerId}:${provider.label}${provider.rootUri ? `:${provider.rootUri.toString()}` : ""}`;
}
__name(getProviderKey, "getProviderKey");
function getRepositoryResourceCount(provider) {
  return provider.groups.reduce((r, g) => r + g.resources.length, 0);
}
__name(getRepositoryResourceCount, "getRepositoryResourceCount");
function getHistoryItemEditorTitle(historyItem) {
  return `${historyItem.displayId ?? historyItem.id} - ${historyItem.subject}`;
}
__name(getHistoryItemEditorTitle, "getHistoryItemEditorTitle");
function getSCMRepositoryIcon(activeRepository, repository) {
  if (!ThemeIcon.isThemeIcon(repository.provider.iconPath)) {
    return Codicon.repo;
  }
  if (activeRepository?.pinned === true && activeRepository?.repository.id === repository.id && repository.provider.iconPath.id === Codicon.repo.id) {
    return Codicon.repoPinned;
  }
  return repository.provider.iconPath;
}
__name(getSCMRepositoryIcon, "getSCMRepositoryIcon");
function getStatusBarCommandGenericName(command) {
  let genericName = void 0;
  if (typeof command.arguments?.[0] === "string") {
    const lastIndex = command.arguments[0].lastIndexOf("/");
    genericName = lastIndex !== -1 ? command.arguments[0].substring(0, lastIndex) : command.arguments[0];
    genericName = genericName.replace(/^(?:git\.|remoteHub\.)/, "").trim();
    if (genericName.length === 0) {
      return void 0;
    }
    genericName = genericName[0].toLocaleUpperCase() + genericName.slice(1);
  }
  return genericName;
}
__name(getStatusBarCommandGenericName, "getStatusBarCommandGenericName");
export {
  StatusBarAction,
  collectContextMenuActions,
  connectPrimaryMenu,
  getActionViewItemProvider,
  getHistoryItemEditorTitle,
  getProviderKey,
  getRepositoryResourceCount,
  getSCMRepositoryIcon,
  getStatusBarCommandGenericName,
  isSCMActionButton,
  isSCMArtifactGroupTreeElement,
  isSCMArtifactNode,
  isSCMArtifactTreeElement,
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
