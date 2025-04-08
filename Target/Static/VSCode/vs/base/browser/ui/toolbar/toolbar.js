var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IContextMenuProvider } from "../../contextmenu.js";
import { ActionBar, ActionsOrientation, IActionViewItemProvider } from "../actionbar/actionbar.js";
import { AnchorAlignment } from "../contextview/contextview.js";
import { DropdownMenuActionViewItem } from "../dropdown/dropdownActionViewItem.js";
import { Action, IAction, IActionRunner, SubmenuAction } from "../../../common/actions.js";
import { Codicon } from "../../../common/codicons.js";
import { ThemeIcon } from "../../../common/themables.js";
import { EventMultiplexer } from "../../../common/event.js";
import { ResolvedKeybinding } from "../../../common/keybindings.js";
import { Disposable, DisposableStore } from "../../../common/lifecycle.js";
import "./toolbar.css";
import * as nls from "../../../../nls.js";
import { IHoverDelegate } from "../hover/hoverDelegate.js";
import { createInstantHoverDelegate } from "../hover/hoverDelegateFactory.js";
class ToolBar extends Disposable {
  static {
    __name(this, "ToolBar");
  }
  options;
  actionBar;
  toggleMenuAction;
  toggleMenuActionViewItem;
  submenuActionViewItems = [];
  hasSecondaryActions = false;
  element;
  _onDidChangeDropdownVisibility = this._register(new EventMultiplexer());
  onDidChangeDropdownVisibility = this._onDidChangeDropdownVisibility.event;
  disposables = this._register(new DisposableStore());
  constructor(container, contextMenuProvider, options = { orientation: ActionsOrientation.HORIZONTAL }) {
    super();
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
          this.toggleMenuActionViewItem = new DropdownMenuActionViewItem(
            action,
            action.menuActions,
            contextMenuProvider,
            {
              actionViewItemProvider: this.options.actionViewItemProvider,
              actionRunner: this.actionRunner,
              keybindingProvider: this.options.getKeyBinding,
              classNames: ThemeIcon.asClassNameArray(options.moreIcon ?? Codicon.toolBarMore),
              anchorAlignmentProvider: this.options.anchorAlignmentProvider,
              menuAsChild: !!this.options.renderDropdownAsChildElement,
              skipTelemetry: this.options.skipTelemetry,
              isMenu: true,
              hoverDelegate: this.options.hoverDelegate
            }
          );
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
          const result = new DropdownMenuActionViewItem(
            action,
            action.actions,
            contextMenuProvider,
            {
              actionViewItemProvider: this.options.actionViewItemProvider,
              actionRunner: this.actionRunner,
              keybindingProvider: this.options.getKeyBinding,
              classNames: action.class,
              anchorAlignmentProvider: this.options.anchorAlignmentProvider,
              menuAsChild: !!this.options.renderDropdownAsChildElement,
              skipTelemetry: this.options.skipTelemetry,
              hoverDelegate: this.options.hoverDelegate
            }
          );
          result.setActionContext(this.actionBar.context);
          this.submenuActionViewItems.push(result);
          this.disposables.add(this._onDidChangeDropdownVisibility.add(result.onDidChangeVisibility));
          return result;
        }
        return void 0;
      }, "actionViewItemProvider")
    }));
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
    const primaryActionsToSet = primaryActions ? primaryActions.slice(0) : [];
    this.hasSecondaryActions = !!(secondaryActions && secondaryActions.length > 0);
    if (this.hasSecondaryActions && secondaryActions) {
      this.toggleMenuAction.menuActions = secondaryActions.slice(0);
      primaryActionsToSet.push(this.toggleMenuAction);
    }
    primaryActionsToSet.forEach((action) => {
      this.actionBar.push(action, { icon: this.options.icon ?? true, label: this.options.label ?? false, keybinding: this.getKeybindingLabel(action) });
    });
  }
  isEmpty() {
    return this.actionBar.isEmpty();
  }
  getKeybindingLabel(action) {
    const key = this.options.getKeyBinding?.(action);
    return key?.getLabel() ?? void 0;
  }
  clear() {
    this.submenuActionViewItems = [];
    this.disposables.clear();
    this.actionBar.clear();
  }
  dispose() {
    this.clear();
    this.disposables.dispose();
    super.dispose();
  }
}
class ToggleMenuAction extends Action {
  static {
    __name(this, "ToggleMenuAction");
  }
  static ID = "toolbar.toggle.more";
  _menuActions;
  toggleDropdownMenu;
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
