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
var TerminalInitialHintContribution_1;
import * as dom from "../../../../../base/browser/dom.js";
import { renderFormattedText } from "../../../../../base/browser/formattedTextRenderer.js";
import { StandardMouseEvent } from "../../../../../base/browser/mouseEvent.js";
import { status } from "../../../../../base/browser/ui/aria/aria.js";
import { KeybindingLabel } from "../../../../../base/browser/ui/keybindingLabel/keybindingLabel.js";
import { Emitter, Event } from "../../../../../base/common/event.js";
import { Disposable, DisposableStore, MutableDisposable } from "../../../../../base/common/lifecycle.js";
import { OS } from "../../../../../base/common/platform.js";
import { hasKey } from "../../../../../base/common/types.js";
import { localize } from "../../../../../nls.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { IContextMenuService } from "../../../../../platform/contextview/browser/contextView.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../../platform/keybinding/common/keybinding.js";
import { ITelemetryService } from "../../../../../platform/telemetry/common/telemetry.js";
import { IChatAgentService } from "../../../chat/common/participants/chatAgents.js";
import { ChatAgentLocation } from "../../../chat/common/constants.js";
import { ITerminalConfigurationService } from "../../../terminal/browser/terminal.js";
import { registerTerminalContribution } from "../../../terminal/browser/terminalExtensions.js";
import { TerminalInstance } from "../../../terminal/browser/terminalInstance.js";
import "./media/terminalInitialHint.css";
import { IChatEntitlementService } from "../../../../services/chat/common/chatEntitlementService.js";
const $ = dom.$;
class InitialHintAddon extends Disposable {
  static {
    __name(this, "InitialHintAddon");
  }
  get onDidRequestCreateHint() {
    return this._onDidRequestCreateHint.event;
  }
  constructor(_capabilities, _onDidChangeAgents) {
    super();
    this._capabilities = _capabilities;
    this._onDidChangeAgents = _onDidChangeAgents;
    this._onDidRequestCreateHint = this._register(new Emitter());
    this._disposables = this._register(new MutableDisposable());
  }
  activate(terminal) {
    const store = this._register(new DisposableStore());
    this._disposables.value = store;
    const capability = this._capabilities.get(
      2
      /* TerminalCapability.CommandDetection */
    );
    if (capability) {
      store.add(Event.once(capability.promptInputModel.onDidStartInput)(() => this._onDidRequestCreateHint.fire()));
    } else {
      this._register(this._capabilities.onDidAddCapability((e) => {
        if (e.id === 2) {
          const capability2 = e.capability;
          store.add(Event.once(capability2.promptInputModel.onDidStartInput)(() => this._onDidRequestCreateHint.fire()));
          if (!capability2.promptInputModel.value) {
            this._onDidRequestCreateHint.fire();
          }
        }
      }));
    }
    const agentListener = this._onDidChangeAgents((e) => {
      if (e?.locations.includes(ChatAgentLocation.Terminal)) {
        this._onDidRequestCreateHint.fire();
        agentListener.dispose();
      }
    });
    this._disposables.value?.add(agentListener);
  }
}
let TerminalInitialHintContribution = class TerminalInitialHintContribution2 extends Disposable {
  static {
    __name(this, "TerminalInitialHintContribution");
  }
  static {
    TerminalInitialHintContribution_1 = this;
  }
  static {
    this.ID = "terminal.initialHint";
  }
  static get(instance) {
    return instance.getContribution(TerminalInitialHintContribution_1.ID);
  }
  constructor(_ctx, _chatAgentService, _configurationService, _instantiationService, _terminalConfigurationService) {
    super();
    this._ctx = _ctx;
    this._chatAgentService = _chatAgentService;
    this._configurationService = _configurationService;
    this._instantiationService = _instantiationService;
    this._terminalConfigurationService = _terminalConfigurationService;
    this._decoration = this._register(new MutableDisposable());
    this._cursorMoveListener = this._register(new MutableDisposable());
  }
  xtermOpen(xterm) {
    if (hasKey(this._ctx.instance, { shellLaunchConfig: true }) && (this._ctx.instance.shellLaunchConfig.isExtensionOwnedTerminal || this._ctx.instance.shellLaunchConfig.isFeatureTerminal || this._ctx.instance.shellLaunchConfig.hideFromUser)) {
      return;
    }
    if (!this._configurationService.getValue(
      "terminal.integrated.initialHint"
      /* TerminalInitialHintSettingId.Enabled */
    )) {
      return;
    }
    if (this._terminalConfigurationService.config.sendKeybindingsToShell) {
      return;
    }
    this._xterm = xterm;
    this._addon = this._register(this._instantiationService.createInstance(InitialHintAddon, this._ctx.instance.capabilities, this._chatAgentService.onDidChangeAgents));
    this._xterm.raw.loadAddon(this._addon);
    this._register(this._addon.onDidRequestCreateHint(() => this._createHint()));
  }
  _disposeHint() {
    this._hintWidget?.remove();
    this._hintWidget = void 0;
    this._decoration.clear();
  }
  _createHint() {
    const instance = this._ctx.instance instanceof TerminalInstance ? this._ctx.instance : void 0;
    const commandDetectionCapability = instance?.capabilities.get(
      2
      /* TerminalCapability.CommandDetection */
    );
    if (!instance || !this._xterm || this._hintWidget || !commandDetectionCapability || commandDetectionCapability.promptInputModel.value || !!instance.shellLaunchConfig.attachPersistentProcess || commandDetectionCapability.commands.length > 0) {
      return;
    }
    if (!this._configurationService.getValue(
      "terminal.integrated.initialHint"
      /* TerminalInitialHintSettingId.Enabled */
    )) {
      return;
    }
    if (!this._decoration.value) {
      const marker = this._xterm.raw.registerMarker();
      if (!marker) {
        return;
      }
      if (this._xterm.raw.buffer.active.cursorX === 0) {
        return;
      }
      this._register(marker);
      this._decoration.value = this._xterm.raw.registerDecoration({
        marker,
        x: this._xterm.raw.buffer.active.cursorX + 1
      });
    }
    this._register(this._xterm.raw.onKey(() => this.dispose()));
    this._register(this._configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(
        "terminal.integrated.initialHint"
        /* TerminalInitialHintSettingId.Enabled */
      ) && !this._configurationService.getValue(
        "terminal.integrated.initialHint"
        /* TerminalInitialHintSettingId.Enabled */
      )) {
        this.dispose();
      }
    }));
    const inputModel = commandDetectionCapability.promptInputModel;
    if (inputModel) {
      this._register(inputModel.onDidChangeInput(() => {
        if (inputModel.value) {
          this.dispose();
        }
      }));
    }
    this._cursorMoveListener.value = this._xterm.raw.onCursorMove(() => {
      if (!inputModel?.value) {
        this._disposeHint();
        this._createHint();
      }
    });
    if (!this._decoration.value) {
      return;
    }
    this._register(this._decoration.value.onRender((e) => {
      if (!this._hintWidget && this._xterm?.isFocused) {
        const widget = this._register(this._instantiationService.createInstance(TerminalInitialHintWidget, instance));
        this._addon?.dispose();
        this._hintWidget = widget.getDomNode();
        if (!this._hintWidget) {
          return;
        }
        e.appendChild(this._hintWidget);
        e.classList.add("terminal-initial-hint");
        const font = this._xterm.getFont();
        if (font) {
          e.style.fontFamily = font.fontFamily;
          e.style.fontSize = font.fontSize + "px";
        }
      }
      if (this._hintWidget && this._xterm) {
        const decoration = this._hintWidget.parentElement;
        if (decoration) {
          decoration.style.width = (this._xterm.raw.cols - this._xterm.raw.buffer.active.cursorX) / this._xterm.raw.cols * 100 + "%";
        }
      }
    }));
  }
};
TerminalInitialHintContribution = TerminalInitialHintContribution_1 = __decorate([
  __param(1, IChatAgentService),
  __param(2, IConfigurationService),
  __param(3, IInstantiationService),
  __param(4, ITerminalConfigurationService)
], TerminalInitialHintContribution);
registerTerminalContribution(TerminalInitialHintContribution.ID, TerminalInitialHintContribution, false);
let TerminalInitialHintWidget = class TerminalInitialHintWidget2 extends Disposable {
  static {
    __name(this, "TerminalInitialHintWidget");
  }
  constructor(_instance, _chatAgentService, _chatEntitlementService, _commandService, _configurationService, _contextMenuService, _keybindingService, _telemetryService) {
    super();
    this._instance = _instance;
    this._chatAgentService = _chatAgentService;
    this._chatEntitlementService = _chatEntitlementService;
    this._commandService = _commandService;
    this._configurationService = _configurationService;
    this._contextMenuService = _contextMenuService;
    this._keybindingService = _keybindingService;
    this._telemetryService = _telemetryService;
    this._toDispose = this._register(new DisposableStore());
    this._isVisible = false;
    this._ariaLabel = "";
    this._toDispose.add(_instance.onDidFocus(() => {
      if (this._instance.hasFocus && this._isVisible && this._ariaLabel && this._configurationService.getValue(
        "accessibility.verbosity.terminalChat"
        /* AccessibilityVerbositySettingId.TerminalInlineChat */
      )) {
        status(this._ariaLabel);
      }
    }));
    this._toDispose.add(this._configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(
        "terminal.integrated.initialHint"
        /* TerminalInitialHintSettingId.Enabled */
      ) && !this._configurationService.getValue(
        "terminal.integrated.initialHint"
        /* TerminalInitialHintSettingId.Enabled */
      )) {
        this.dispose();
      }
    }));
  }
  /**
   * Creates wrapped hint elements with click listeners for responsive hint layouts.
   * Returns a before link and an after prose span containing a link.
   */
  _createWrappedHintElements(text, keybindingLabel, clickHandler) {
    const [beforeText, afterText] = text.split(keybindingLabel);
    const before = $("a", void 0, beforeText);
    this._toDispose.add(dom.addDisposableListener(before, dom.EventType.CLICK, clickHandler));
    const after = $("span.terminal-initial-hint-prose", void 0);
    const afterLink = $("a", void 0, afterText);
    this._toDispose.add(dom.addDisposableListener(afterLink, dom.EventType.CLICK, clickHandler));
    after.appendChild(afterLink);
    return { before, after };
  }
  _getHintInlineChat() {
    const ariaLabelParts = [];
    const handleClick = /* @__PURE__ */ __name(() => {
      this._telemetryService.publicLog2("workbenchActionExecuted", {
        id: "terminalInlineChat.hintAction",
        from: "hint"
      });
      this._commandService.executeCommand("workbench.action.terminal.chat.start", { from: "hint" });
    }, "handleClick");
    const handleDontShowClick = /* @__PURE__ */ __name(() => {
      this._configurationService.updateValue("terminal.integrated.initialHint", false);
    }, "handleDontShowClick");
    const hintHandler = {
      disposables: this._toDispose,
      callback: /* @__PURE__ */ __name((index, _event) => {
        switch (index) {
          case "0":
            handleClick();
            break;
        }
      }, "callback")
    };
    const dontShowHintHandler = {
      disposables: this._toDispose,
      callback: /* @__PURE__ */ __name((index, _event) => {
        switch (index) {
          case "0":
            handleDontShowClick();
            break;
        }
      }, "callback")
    };
    const hintElement = $("div.terminal-initial-hint");
    hintElement.style.display = "block";
    if (!this._chatEntitlementService.sentiment.hidden) {
      const keybindingHint = this._keybindingService.lookupKeybinding(
        "workbench.action.terminal.chat.start"
        /* TerminalChatCommandId.Start */
      );
      const keybindingHintLabel = keybindingHint?.getLabel();
      if (keybindingHint && keybindingHintLabel) {
        const terminalAgents = this._chatAgentService.getActivatedAgents().filter((candidate) => candidate.locations.includes(ChatAgentLocation.Terminal));
        if (terminalAgents?.length) {
          const actionPart = localize("emptyHintText", "Open chat {0}. ", keybindingHintLabel);
          const { before, after } = this._createWrappedHintElements(actionPart, keybindingHintLabel, handleClick);
          hintElement.appendChild(before);
          const label = hintHandler.disposables.add(new KeybindingLabel(hintElement, OS));
          label.set(keybindingHint);
          label.element.style.width = "min-content";
          label.element.style.display = "inline";
          label.element.style.cursor = "pointer";
          this._toDispose.add(dom.addDisposableListener(label.element, dom.EventType.CLICK, handleClick));
          hintElement.appendChild(after);
          hintElement.appendChild($("span.terminal-initial-hint-separator"));
          ariaLabelParts.push(actionPart);
        }
      } else {
        const hintMsg = localize({
          key: "inlineChatHint",
          comment: [
            "Preserve double-square brackets and their order"
          ]
        }, "[[Open chat]] or start typing to dismiss.");
        const rendered = renderFormattedText(hintMsg, { actionHandler: hintHandler });
        hintElement.appendChild(rendered);
        ariaLabelParts.push(localize("openChatHint", "Open chat or start typing to dismiss."));
      }
    }
    const suggestEnabled = this._configurationService.getValue(
      "terminal.integrated.suggest.enabled"
      /* TerminalSuggestSettingId.Enabled */
    );
    const suggestKeybinding = suggestEnabled ? this._keybindingService.lookupKeybinding(
      "workbench.action.terminal.triggerSuggest"
      /* TerminalSuggestCommandId.TriggerSuggest */
    ) : void 0;
    const suggestKeybindingLabel = suggestKeybinding?.getLabel();
    if (suggestKeybinding && suggestKeybindingLabel) {
      const suggestActionPart = localize("showSuggestHint", "Show suggestions {0}. ", suggestKeybindingLabel);
      const handleSuggestClick = /* @__PURE__ */ __name(() => {
        this._commandService.executeCommand(
          "workbench.action.terminal.triggerSuggest"
          /* TerminalSuggestCommandId.TriggerSuggest */
        );
      }, "handleSuggestClick");
      const { before: suggestBefore, after: suggestAfter } = this._createWrappedHintElements(suggestActionPart, suggestKeybindingLabel, handleSuggestClick);
      hintElement.appendChild(suggestBefore);
      const suggestLabel = hintHandler.disposables.add(new KeybindingLabel(hintElement, OS));
      suggestLabel.set(suggestKeybinding);
      suggestLabel.element.style.width = "min-content";
      suggestLabel.element.style.display = "inline";
      suggestLabel.element.style.cursor = "pointer";
      this._toDispose.add(dom.addDisposableListener(suggestLabel.element, dom.EventType.CLICK, handleSuggestClick));
      hintElement.appendChild(suggestAfter);
      hintElement.appendChild($("span.terminal-initial-hint-separator"));
      ariaLabelParts.push(suggestActionPart);
    }
    if (ariaLabelParts.length === 0) {
      return void 0;
    }
    const typeToDismiss = localize({
      key: "hintTextDismiss",
      comment: [
        "Preserve double-square brackets and their order"
      ]
    }, "[[don't show]] this again.");
    const typeToDismissRendered = renderFormattedText(typeToDismiss, { actionHandler: dontShowHintHandler });
    typeToDismissRendered.classList.add("detail", "terminal-initial-hint-prose");
    const proseBefore = $("span.terminal-initial-hint-prose", void 0, localize("hintTextDismissProse", " Start typing to dismiss or "));
    hintElement.appendChild(proseBefore);
    hintElement.appendChild(typeToDismissRendered);
    const typeToDismissCompact = localize({
      key: "hintTextDismissCompact",
      comment: [
        "Preserve double-square brackets and their order"
      ]
    }, "[[Don't show this again]]");
    const typeToDismissCompactRendered = renderFormattedText(typeToDismissCompact, { actionHandler: dontShowHintHandler });
    typeToDismissCompactRendered.classList.add("detail", "terminal-initial-hint-compact");
    hintElement.appendChild(typeToDismissCompactRendered);
    ariaLabelParts.push(localize("hintTextDismissAriaLabel", "Start typing to dismiss or don't show this again."));
    return { ariaLabel: ariaLabelParts.join(" "), hintHandler, hintElement };
  }
  getDomNode() {
    if (!this._domNode) {
      const result = this._getHintInlineChat();
      if (!result) {
        return void 0;
      }
      const { hintElement, ariaLabel } = result;
      this._domNode = $(".terminal-initial-hint");
      this._domNode.style.paddingLeft = "4px";
      this._domNode.append(hintElement);
      this._ariaLabel = ariaLabel.concat(localize(
        "disableHint",
        " Toggle {0} in settings to disable this hint.",
        "accessibility.verbosity.terminalChat"
        /* AccessibilityVerbositySettingId.TerminalInlineChat */
      ));
      this._toDispose.add(dom.addDisposableListener(this._domNode, "click", () => {
        this._domNode?.remove();
        this._domNode = void 0;
      }));
      this._toDispose.add(dom.addDisposableListener(this._domNode, dom.EventType.CONTEXT_MENU, (e) => {
        this._contextMenuService.showContextMenu({
          getAnchor: /* @__PURE__ */ __name(() => {
            return new StandardMouseEvent(dom.getActiveWindow(), e);
          }, "getAnchor"),
          getActions: /* @__PURE__ */ __name(() => {
            return [
              {
                id: "workench.action.disableTerminalInitialHint",
                label: localize("disableInitialHint", "Disable Initial Hint"),
                tooltip: localize("disableInitialHint", "Disable Initial Hint"),
                enabled: true,
                class: void 0,
                run: /* @__PURE__ */ __name(() => this._configurationService.updateValue("terminal.integrated.initialHint", false), "run")
              }
            ];
          }, "getActions")
        });
      }));
    }
    return this._domNode;
  }
  dispose() {
    this._domNode?.remove();
    super.dispose();
  }
};
TerminalInitialHintWidget = __decorate([
  __param(1, IChatAgentService),
  __param(2, IChatEntitlementService),
  __param(3, ICommandService),
  __param(4, IConfigurationService),
  __param(5, IContextMenuService),
  __param(6, IKeybindingService),
  __param(7, ITelemetryService)
], TerminalInitialHintWidget);
export {
  InitialHintAddon,
  TerminalInitialHintContribution
};
//# sourceMappingURL=terminal.initialHint.contribution.js.map
