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
import { Codicon } from "../../../../base/common/codicons.js";
import { Disposable, DisposableStore } from "../../../../base/common/lifecycle.js";
import { autorun } from "../../../../base/common/observable.js";
import { renderIcon } from "../../../../base/browser/ui/iconLabel/iconLabels.js";
import { localize } from "../../../../nls.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
const GIT_SYNC_COMMAND = "git.sync";
let SyncIndicator = class SyncIndicator2 extends Disposable {
  static {
    __name(this, "SyncIndicator");
  }
  constructor(commandService) {
    super();
    this.commandService = commandService;
    this._visible = true;
    this._renderDisposables = this._register(new DisposableStore());
    this._stateDisposables = this._register(new DisposableStore());
  }
  /**
   * Sets the git repository. Subscribes to its state observable to react to
   * ahead/behind changes.
   */
  setRepository(repository) {
    this._stateDisposables.clear();
    this._repository = repository;
    if (repository) {
      this._stateDisposables.add(autorun((reader) => {
        repository.state.read(reader);
        this._update();
      }));
    } else {
      this._update();
    }
  }
  /**
   * Sets the currently selected branch name (from the branch picker).
   * The sync indicator is only shown when the selected branch is the HEAD branch.
   */
  setBranch(branch) {
    this._selectedBranch = branch;
    this._update();
  }
  /**
   * Renders the sync indicator button into the given container.
   */
  render(container) {
    this._renderDisposables.clear();
    const slot = dom.append(container, dom.$(".sessions-chat-picker-slot.sessions-chat-sync-indicator"));
    this._slotElement = slot;
    this._renderDisposables.add({ dispose: /* @__PURE__ */ __name(() => slot.remove(), "dispose") });
    const button = dom.append(slot, dom.$("a.action-label"));
    button.tabIndex = 0;
    button.role = "button";
    this._buttonElement = button;
    this._renderDisposables.add(dom.addDisposableListener(button, dom.EventType.CLICK, (e) => {
      dom.EventHelper.stop(e, true);
      this.commandService.executeCommand(GIT_SYNC_COMMAND);
    }));
    this._renderDisposables.add(dom.addDisposableListener(button, dom.EventType.KEY_DOWN, (e) => {
      if (e.key === "Enter" || e.key === " ") {
        dom.EventHelper.stop(e, true);
        this.commandService.executeCommand(GIT_SYNC_COMMAND);
      }
    }));
    this._update();
  }
  /**
   * Shows or hides the sync indicator slot.
   */
  setVisible(visible) {
    this._visible = visible;
    this._update();
  }
  _getAheadBehind() {
    if (!this._repository) {
      return void 0;
    }
    const head = this._repository.state.get().HEAD;
    if (!head?.upstream) {
      return void 0;
    }
    if (head.name !== this._selectedBranch) {
      return void 0;
    }
    const ahead = head.ahead ?? 0;
    const behind = head.behind ?? 0;
    if (ahead === 0 && behind === 0) {
      return void 0;
    }
    return { ahead, behind };
  }
  _update() {
    if (!this._slotElement || !this._buttonElement) {
      return;
    }
    const counts = this._getAheadBehind();
    if (!counts || !this._visible) {
      this._slotElement.style.display = "none";
      return;
    }
    this._slotElement.style.display = "";
    dom.clearNode(this._buttonElement);
    dom.append(this._buttonElement, renderIcon(Codicon.sync));
    const parts = [];
    if (counts.behind > 0) {
      parts.push(`${counts.behind}\u2193`);
    }
    if (counts.ahead > 0) {
      parts.push(`${counts.ahead}\u2191`);
    }
    const label = dom.append(this._buttonElement, dom.$("span.sessions-chat-dropdown-label"));
    label.textContent = parts.join("\xA0");
    this._buttonElement.title = localize("syncIndicator.tooltip", "Synchronize Changes ({0} to pull, {1} to push)", counts.behind, counts.ahead);
  }
};
SyncIndicator = __decorate([
  __param(0, ICommandService)
], SyncIndicator);
export {
  SyncIndicator
};
//# sourceMappingURL=syncIndicator.js.map
