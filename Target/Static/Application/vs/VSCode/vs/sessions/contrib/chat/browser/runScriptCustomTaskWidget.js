var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import "./media/runScriptAction.css";
import * as dom from "../../../../base/browser/dom.js";
import { StandardKeyboardEvent } from "../../../../base/browser/keyboardEvent.js";
import { Button } from "../../../../base/browser/ui/button/button.js";
import { InputBox } from "../../../../base/browser/ui/inputbox/inputBox.js";
import { Radio } from "../../../../base/browser/ui/radio/radio.js";
import { Checkbox } from "../../../../base/browser/ui/toggle/toggle.js";
import { Emitter } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { localize } from "../../../../nls.js";
import { defaultButtonStyles, defaultCheckboxStyles, defaultInputBoxStyles } from "../../../../platform/theme/browser/defaultStyles.js";
const WORKTREE_CREATED_RUN_ON = "worktreeCreated";
class RunScriptCustomTaskWidget extends Disposable {
  static {
    __name(this, "RunScriptCustomTaskWidget");
  }
  constructor(state) {
    super();
    this._onDidSubmit = this._register(new Emitter());
    this.onDidSubmit = this._onDidSubmit.event;
    this._onDidCancel = this._register(new Emitter());
    this.onDidCancel = this._onDidCancel.event;
    this._labelLocked = !!state.labelDisabledReason;
    this._commandLocked = !!state.commandDisabledReason;
    this._targetLocked = !!state.targetDisabledReason && state.target !== void 0;
    this._selectedTarget = state.target ?? (state.targetDisabledReason ? "user" : "workspace");
    this.domNode = dom.$(".run-script-action-widget");
    const labelSection = dom.append(this.domNode, dom.$(".run-script-action-section"));
    dom.append(labelSection, dom.$("label.run-script-action-label", void 0, localize("labelFieldLabel", "Name")));
    const labelInputContainer = dom.append(labelSection, dom.$(".run-script-action-input"));
    this._labelInput = this._register(new InputBox(labelInputContainer, void 0, {
      placeholder: localize("enterLabelPlaceholder", "Enter a name for this action (optional)"),
      tooltip: state.labelDisabledReason,
      ariaLabel: localize("enterLabelAriaLabel", "Task name"),
      inputBoxStyles: defaultInputBoxStyles
    }));
    this._labelInput.value = state.label ?? "";
    if (state.labelDisabledReason) {
      this._labelInput.disable();
    }
    const commandSection = dom.append(this.domNode, dom.$(".run-script-action-section"));
    dom.append(commandSection, dom.$("label.run-script-action-label", void 0, localize("commandFieldLabel", "Command")));
    const commandInputContainer = dom.append(commandSection, dom.$(".run-script-action-input"));
    this._commandInput = this._register(new InputBox(commandInputContainer, void 0, {
      placeholder: localize("enterCommandPlaceholder", "Enter command (for example, npm run dev)"),
      tooltip: state.commandDisabledReason,
      ariaLabel: localize("enterCommandAriaLabel", "Task command"),
      inputBoxStyles: defaultInputBoxStyles
    }));
    this._commandInput.value = state.command ?? "";
    if (state.commandDisabledReason) {
      this._commandInput.disable();
    }
    const runOnSection = dom.append(this.domNode, dom.$(".run-script-action-section"));
    dom.append(runOnSection, dom.$("div.run-script-action-label", void 0, localize("runOptionsLabel", "Run Options")));
    const runOnRow = dom.append(runOnSection, dom.$(".run-script-action-option-row"));
    this._runOnCheckbox = this._register(new Checkbox(localize("runOnWorktreeCreated", "Run When Worktree Is Created"), state.runOn === WORKTREE_CREATED_RUN_ON, defaultCheckboxStyles));
    runOnRow.appendChild(this._runOnCheckbox.domNode);
    const runOnText = dom.append(runOnRow, dom.$("span.run-script-action-option-text", void 0, localize("runOnWorktreeCreatedDescription", "Automatically run this action when the session worktree is created")));
    this._register(dom.addDisposableListener(runOnText, dom.EventType.CLICK, () => this._runOnCheckbox.checked = !this._runOnCheckbox.checked));
    const storageSection = dom.append(this.domNode, dom.$(".run-script-action-section"));
    dom.append(storageSection, dom.$("div.run-script-action-label", void 0, localize("storageLabel", "Save In")));
    const storageDisabledReason = state.targetDisabledReason;
    const workspaceTargetDisabled = !!storageDisabledReason;
    this._storageOptions = this._register(new Radio({
      items: [
        {
          text: localize("workspaceStorageLabel", "Workspace"),
          tooltip: storageDisabledReason ?? localize("workspaceStorageTooltip", "Save this action in the current workspace"),
          isActive: this._selectedTarget === "workspace",
          disabled: workspaceTargetDisabled
        },
        {
          text: localize("userStorageLabel", "User"),
          tooltip: this._targetLocked ? storageDisabledReason : localize("userStorageTooltip", "Save this action in your user tasks and make it available in all sessions"),
          isActive: this._selectedTarget === "user",
          disabled: this._targetLocked
        }
      ]
    }));
    this._storageOptions.domNode.setAttribute("aria-label", localize("storageAriaLabel", "Task storage target"));
    storageSection.appendChild(this._storageOptions.domNode);
    if (storageDisabledReason && !this._targetLocked) {
      dom.append(storageSection, dom.$("div.run-script-action-hint", void 0, storageDisabledReason));
    }
    const buttonRow = dom.append(this.domNode, dom.$(".run-script-action-buttons"));
    this._cancelButton = this._register(new Button(buttonRow, { ...defaultButtonStyles, secondary: true }));
    this._cancelButton.label = localize("cancelAddAction", "Cancel");
    this._submitButton = this._register(new Button(buttonRow, defaultButtonStyles));
    this._submitButton.label = localize("confirmAddAction", "Add Action");
    this._register(this._labelInput.onDidChange(() => this._updateButtonEnablement()));
    this._register(this._commandInput.onDidChange(() => this._updateButtonEnablement()));
    this._register(this._storageOptions.onDidSelect((index) => {
      this._selectedTarget = index === 0 ? "workspace" : "user";
    }));
    this._register(this._submitButton.onDidClick(() => this._submit()));
    this._register(this._cancelButton.onDidClick(() => this._onDidCancel.fire()));
    this._register(dom.addDisposableListener(this._labelInput.inputElement, dom.EventType.KEY_DOWN, (event) => {
      const keyboardEvent = new StandardKeyboardEvent(event);
      if (keyboardEvent.equals(
        3
        /* KeyCode.Enter */
      )) {
        keyboardEvent.preventDefault();
        keyboardEvent.stopPropagation();
        this._submit();
      }
    }));
    this._register(dom.addDisposableListener(this._commandInput.inputElement, dom.EventType.KEY_DOWN, (event) => {
      const keyboardEvent = new StandardKeyboardEvent(event);
      if (keyboardEvent.equals(
        3
        /* KeyCode.Enter */
      )) {
        keyboardEvent.preventDefault();
        keyboardEvent.stopPropagation();
        this._submit();
      }
    }));
    this._register(dom.addDisposableListener(this.domNode, dom.EventType.KEY_DOWN, (event) => {
      const keyboardEvent = new StandardKeyboardEvent(event);
      if (keyboardEvent.equals(
        9
        /* KeyCode.Escape */
      )) {
        keyboardEvent.preventDefault();
        keyboardEvent.stopPropagation();
        this._onDidCancel.fire();
      }
    }));
    this._updateButtonEnablement();
  }
  focus() {
    if (!this._labelLocked) {
      this._labelInput.focus();
      return;
    }
    if (this._commandLocked) {
      this._runOnCheckbox.focus();
      return;
    }
    this._commandInput.focus();
  }
  _submit() {
    const label = this._labelInput.value.trim();
    const command = this._commandInput.value.trim();
    if (!command) {
      return;
    }
    this._onDidSubmit.fire({
      label: label.length > 0 ? label : void 0,
      command,
      target: this._selectedTarget,
      runOn: this._runOnCheckbox.checked ? WORKTREE_CREATED_RUN_ON : void 0
    });
  }
  _updateButtonEnablement() {
    this._submitButton.enabled = this._commandInput.value.trim().length > 0;
  }
}
export {
  RunScriptCustomTaskWidget,
  WORKTREE_CREATED_RUN_ON
};
//# sourceMappingURL=runScriptCustomTaskWidget.js.map
