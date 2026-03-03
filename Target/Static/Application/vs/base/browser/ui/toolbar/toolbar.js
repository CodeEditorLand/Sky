var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ActionBar } from "../actionbar/actionbar.js";
import { DropdownMenuActionViewItem } from "../dropdown/dropdownActionViewItem.js";
import { Action, Separator, SubmenuAction } from "../../../common/actions.js";
import { Codicon } from "../../../common/codicons.js";
import { ThemeIcon } from "../../../common/themables.js";
import { EventMultiplexer } from "../../../common/event.js";
import { Disposable, DisposableStore, toDisposable } from "../../../common/lifecycle.js";
import "./toolbar.css";
import * as nls from "../../../../nls.js";
import { createInstantHoverDelegate } from "../hover/hoverDelegateFactory.js";
const ACTION_MIN_WIDTH = 20;
const ACTION_PADDING = 4;
const ACTION_MIN_WIDTH_VAR = "--vscode-toolbar-action-min-width";
class ToolBar extends Disposable {
  static {
    __name(this, "ToolBar");
  }
  get onDidChangeDropdownVisibility() {
    return this._onDidChangeDropdownVisibility.event;
  }
  constructor(container, contextMenuProvider, options = {
    orientation: 0
    /* ActionsOrientation.HORIZONTAL */
  }) {
    super();
    this.container = container;
    this.submenuActionViewItems = [];
    this.hasSecondaryActions = false;
    this._onDidChangeDropdownVisibility = this._register(new EventMultiplexer());
    this.originalPrimaryActions = [];
    this.originalSecondaryActions = [];
    this.hiddenActions = [];
    this.disposables = this._register(new DisposableStore());
    options.hoverDelegate = options.hoverDelegate ?? this._register(createInstantHoverDelegate());
    this.options = options;
    this.toggleMenuAction = this._register(new ToggleMenuAction(() => this.toggleMenuActionViewItem?.show(), options.toggleMenuTitle));
    this.element = document.createElement("div");
    this.element.className = "monaco-toolbar";
    container.appendChild(this.element);
    this.actionBar = this._register(new ActionBar(this.element, {
      orientation: options.orientation,
      ariaLabel: options.ariaLabel,
      actionRunner: options.actionRunner,
      allowContextMenu: options.allowContextMenu,
      highlightToggledItems: options.highlightToggledItems,
      hoverDelegate: options.hoverDelegate,
      actionViewItemProvider: /* @__PURE__ */ __name((action, viewItemOptions) => {
        if (action.id === ToggleMenuAction.ID) {
          this.toggleMenuActionViewItem = new DropdownMenuActionViewItem(action, { getActions: /* @__PURE__ */ __name(() => this.toggleMenuAction.menuActions, "getActions") }, contextMenuProvider, {
            actionViewItemProvider: this.options.actionViewItemProvider,
            actionRunner: this.actionRunner,
            keybindingProvider: this.options.getKeyBinding,
            classNames: ThemeIcon.asClassNameArray(options.moreIcon ?? Codicon.toolBarMore),
            anchorAlignmentProvider: this.options.anchorAlignmentProvider,
            menuAsChild: !!this.options.renderDropdownAsChildElement,
            skipTelemetry: this.options.skipTelemetry,
            isMenu: true,
            hoverDelegate: this.options.hoverDelegate
          });
          this.toggleMenuActionViewItem.setActionContext(this.actionBar.context);
          this.disposables.add(this._onDidChangeDropdownVisibility.add(this.toggleMenuActionViewItem.onDidChangeVisibility));
          return this.toggleMenuActionViewItem;
        }
        if (options.actionViewItemProvider) {
          const result = options.actionViewItemProvider(action, viewItemOptions);
          if (result) {
            return result;
          }
        }
        if (action instanceof SubmenuAction) {
          const result = new DropdownMenuActionViewItem(action, action.actions, contextMenuProvider, {
            actionViewItemProvider: this.options.actionViewItemProvider,
            actionRunner: this.actionRunner,
            keybindingProvider: this.options.getKeyBinding,
            classNames: action.class,
            anchorAlignmentProvider: this.options.anchorAlignmentProvider,
            menuAsChild: !!this.options.renderDropdownAsChildElement,
            skipTelemetry: this.options.skipTelemetry,
            hoverDelegate: this.options.hoverDelegate
          });
          result.setActionContext(this.actionBar.context);
          this.submenuActionViewItems.push(result);
          this.disposables.add(this._onDidChangeDropdownVisibility.add(result.onDidChangeVisibility));
          return result;
        }
        return void 0;
      }, "actionViewItemProvider")
    }));
    this.actionMinWidth = (options.responsiveBehavior?.actionMinWidth ?? ACTION_MIN_WIDTH) + ACTION_PADDING;
    if (this.options.responsiveBehavior?.enabled) {
      this.element.classList.toggle("responsive", true);
      this.element.classList.toggle("responsive-all", this.options.responsiveBehavior.kind === "all");
      this.element.classList.toggle("responsive-last", this.options.responsiveBehavior.kind === "last");
      this.element.style.setProperty(ACTION_MIN_WIDTH_VAR, `${this.actionMinWidth - ACTION_PADDING}px`);
      const observer = new ResizeObserver(() => {
        this.updateActions(this.element.getBoundingClientRect().width);
      });
      observer.observe(this.element);
      this._store.add(toDisposable(() => observer.disconnect()));
    }
  }
  set actionRunner(actionRunner) {
    this.actionBar.actionRunner = actionRunner;
  }
  get actionRunner() {
    return this.actionBar.actionRunner;
  }
  set context(context) {
    this.actionBar.context = context;
    this.toggleMenuActionViewItem?.setActionContext(context);
    for (const actionViewItem of this.submenuActionViewItems) {
      actionViewItem.setActionContext(context);
    }
  }
  getElement() {
    return this.element;
  }
  focus() {
    this.actionBar.focus();
  }
  getItemsWidth() {
    let itemsWidth = 0;
    for (let i = 0; i < this.actionBar.length(); i++) {
      itemsWidth += this.actionBar.getWidth(i);
    }
    return itemsWidth;
  }
  getItemAction(indexOrElement) {
    return this.actionBar.getAction(indexOrElement);
  }
  getItemWidth(index) {
    return this.actionBar.getWidth(index);
  }
  getItemsLength() {
    return this.actionBar.length();
  }
  setAriaLabel(label) {
    this.actionBar.setAriaLabel(label);
  }
  setActions(primaryActions, secondaryActions) {
    this.clear();
    this.originalPrimaryActions = primaryActions ? primaryActions.slice(0) : [];
    this.originalSecondaryActions = secondaryActions ? secondaryActions.slice(0) : [];
    const primaryActionsToSet = primaryActions ? primaryActions.slice(0) : [];
    this.hasSecondaryActions = !!(secondaryActions && secondaryActions.length > 0);
    if (this.hasSecondaryActions && secondaryActions) {
      this.toggleMenuAction.menuActions = secondaryActions.slice(0);
      primaryActionsToSet.push(this.toggleMenuAction);
    }
    if (primaryActionsToSet.length > 0 && this.options.trailingSeparator) {
      primaryActionsToSet.push(new Separator());
    }
    primaryActionsToSet.forEach((action) => {
      this.actionBar.push(action, { icon: this.options.icon ?? true, label: this.options.label ?? false, keybinding: this.getKeybindingLabel(action) });
    });
    this.actionBar.domNode.classList.toggle("has-overflow", this.actionBar.hasAction(this.toggleMenuAction));
    if (this.options.responsiveBehavior?.enabled) {
      this.hiddenActions.length = 0;
      if (this.options.responsiveBehavior?.minItems !== void 0) {
        const itemCount = this.options.responsiveBehavior.minItems;
        let overflowWidth = 0;
        if (this.originalSecondaryActions.length > 0 || itemCount < this.originalPrimaryActions.length) {
          overflowWidth = ACTION_MIN_WIDTH + ACTION_PADDING;
        }
        this.container.style.minWidth = `${itemCount * this.actionMinWidth + overflowWidth}px`;
        this.element.style.minWidth = `${itemCount * this.actionMinWidth + overflowWidth}px`;
      } else {
        this.container.style.minWidth = `${ACTION_MIN_WIDTH + ACTION_PADDING}px`;
        this.element.style.minWidth = `${ACTION_MIN_WIDTH + ACTION_PADDING}px`;
      }
      this.updateActions(this.element.getBoundingClientRect().width);
    }
  }
  isEmpty() {
    return this.actionBar.isEmpty();
  }
  getKeybindingLabel(action) {
    const key = this.options.getKeyBinding?.(action);
    return key?.getLabel() ?? void 0;
  }
  updateActions(containerWidth) {
    if (this.actionBar.isEmpty()) {
      return;
    }
    containerWidth = Math.max(containerWidth, parseInt(this.element.style.minWidth));
    const actionBarWidth = /* @__PURE__ */ __name((actualWidth) => {
      if (this.options.responsiveBehavior?.kind === "last") {
        const hasToggleMenuAction = this.actionBar.hasAction(this.toggleMenuAction);
        const primaryActionsCount = hasToggleMenuAction ? this.actionBar.length() - 1 : this.actionBar.length();
        let itemsWidth = 0;
        for (let i = 0; i < primaryActionsCount - 1; i++) {
          itemsWidth += this.actionBar.getWidth(i) + ACTION_PADDING;
        }
        itemsWidth += actualWidth ? this.actionBar.getWidth(primaryActionsCount - 1) : this.actionMinWidth;
        itemsWidth += hasToggleMenuAction ? ACTION_MIN_WIDTH + ACTION_PADDING : 0;
        return itemsWidth;
      } else {
        return this.actionBar.length() * this.actionMinWidth;
      }
    }, "actionBarWidth");
    if (actionBarWidth(false) <= containerWidth && this.hiddenActions.length === 0) {
      return;
    }
    if (actionBarWidth(false) > containerWidth) {
      if (this.options.responsiveBehavior?.minItems !== void 0) {
        const primaryActionsCount = this.actionBar.hasAction(this.toggleMenuAction) ? this.actionBar.length() - 1 : this.actionBar.length();
        if (primaryActionsCount <= this.options.responsiveBehavior.minItems) {
          return;
        }
      }
      while (actionBarWidth(true) > containerWidth && this.actionBar.length() > 0) {
        const index = this.originalPrimaryActions.length - this.hiddenActions.length - 1;
        if (index < 0) {
          break;
        }
        const size = Math.min(this.actionMinWidth, this.getItemWidth(index));
        const action = this.originalPrimaryActions[index];
        this.hiddenActions.unshift({ action, size });
        this.actionBar.pull(index);
        if (this.originalSecondaryActions.length === 0 && this.hiddenActions.length === 1) {
          this.actionBar.push(this.toggleMenuAction, {
            icon: this.options.icon ?? true,
            label: this.options.label ?? false,
            keybinding: this.getKeybindingLabel(this.toggleMenuAction)
          });
        }
      }
    } else {
      while (this.hiddenActions.length > 0) {
        const entry = this.hiddenActions.shift();
        if (actionBarWidth(true) + entry.size > containerWidth) {
          this.hiddenActions.unshift(entry);
          break;
        }
        this.actionBar.push(entry.action, {
          icon: this.options.icon ?? true,
          label: this.options.label ?? false,
          keybinding: this.getKeybindingLabel(entry.action),
          index: this.originalPrimaryActions.length - this.hiddenActions.length - 1
        });
        if (this.originalSecondaryActions.length === 0 && this.hiddenActions.length === 0) {
          this.toggleMenuAction.menuActions = [];
          this.actionBar.pull(this.actionBar.length() - 1);
        }
      }
    }
    const hiddenActions = this.hiddenActions.map((entry) => entry.action);
    if (this.originalSecondaryActions.length > 0 || hiddenActions.length > 0) {
      const secondaryActions = this.originalSecondaryActions.slice(0);
      this.toggleMenuAction.menuActions = Separator.join(hiddenActions, secondaryActions);
    }
    this.actionBar.domNode.classList.toggle("has-overflow", this.actionBar.hasAction(this.toggleMenuAction));
  }
  clear() {
    this.submenuActionViewItems = [];
    this.disposables.clear();
    this.actionBar.clear();
  }
  dispose() {
    this.clear();
    this.disposables.dispose();
    this.element.remove();
    super.dispose();
  }
}
class ToggleMenuAction extends Action {
  static {
    __name(this, "ToggleMenuAction");
  }
  static {
    this.ID = "toolbar.toggle.more";
  }
  constructor(toggleDropdownMenu, title) {
    title = title || nls.localize("moreActions", "More Actions...");
    super(ToggleMenuAction.ID, title, void 0, true);
    this._menuActions = [];
    this.toggleDropdownMenu = toggleDropdownMenu;
  }
  async run() {
    this.toggleDropdownMenu();
  }
  get menuActions() {
    return this._menuActions;
  }
  set menuActions(actions) {
    this._menuActions = actions;
  }
}
export {
  ToggleMenuAction,
  ToolBar
};
//# sourceMappingURL=toolbar.js.map
