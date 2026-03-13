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
var TerminalVoiceSession_1;
import { RunOnceScheduler } from "../../../../../base/common/async.js";
import { CancellationTokenSource } from "../../../../../base/common/cancellation.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { Disposable, DisposableStore, toDisposable } from "../../../../../base/common/lifecycle.js";
import { ThemeIcon } from "../../../../../base/common/themables.js";
import { isNumber } from "../../../../../base/common/types.js";
import { localize } from "../../../../../nls.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { SpeechTimeoutDefault } from "../../../accessibility/browser/accessibilityConfiguration.js";
import { ISpeechService, SpeechToTextStatus } from "../../../speech/common/speechService.js";
import { alert } from "../../../../../base/browser/ui/aria/aria.js";
import { ITerminalService } from "../../../terminal/browser/terminal.js";
import { TerminalContextKeys } from "../../../terminal/common/terminalContextKey.js";
const symbolMap = {
  "Ampersand": "&",
  "ampersand": "&",
  "Dollar": "$",
  "dollar": "$",
  "Percent": "%",
  "percent": "%",
  "Asterisk": "*",
  "asterisk": "*",
  "Plus": "+",
  "plus": "+",
  "Equals": "=",
  "equals": "=",
  "Exclamation": "!",
  "exclamation": "!",
  "Slash": "/",
  "slash": "/",
  "Backslash": "\\",
  "backslash": "\\",
  "Dot": ".",
  "dot": ".",
  "Period": ".",
  "period": ".",
  "Quote": "'",
  "quote": "'",
  "double quote": '"',
  "Double quote": '"'
};
let TerminalVoiceSession = class TerminalVoiceSession2 extends Disposable {
  static {
    __name(this, "TerminalVoiceSession");
  }
  static {
    TerminalVoiceSession_1 = this;
  }
  static {
    this._instance = void 0;
  }
  static getInstance(instantiationService) {
    if (!TerminalVoiceSession_1._instance) {
      TerminalVoiceSession_1._instance = instantiationService.createInstance(TerminalVoiceSession_1);
    }
    return TerminalVoiceSession_1._instance;
  }
  constructor(_speechService, _terminalService, _configurationService, contextKeyService) {
    super();
    this._speechService = _speechService;
    this._terminalService = _terminalService;
    this._configurationService = _configurationService;
    this._input = "";
    this._register(this._terminalService.onDidChangeActiveInstance(() => this.stop()));
    this._register(this._terminalService.onDidDisposeInstance(() => this.stop()));
    this._disposables = this._register(new DisposableStore());
    this._terminalDictationInProgress = TerminalContextKeys.terminalDictationInProgress.bindTo(contextKeyService);
  }
  async start() {
    this.stop();
    let voiceTimeout = this._configurationService.getValue(
      "accessibility.voice.speechTimeout"
      /* AccessibilityVoiceSettingId.SpeechTimeout */
    );
    if (!isNumber(voiceTimeout) || voiceTimeout < 0) {
      voiceTimeout = SpeechTimeoutDefault;
    }
    this._acceptTranscriptionScheduler = this._disposables.add(new RunOnceScheduler(() => {
      this._sendText();
      this.stop();
    }, voiceTimeout));
    this._cancellationTokenSource = new CancellationTokenSource();
    this._register(toDisposable(() => this._cancellationTokenSource?.dispose(true)));
    const session = await this._speechService.createSpeechToTextSession(this._cancellationTokenSource?.token, "terminal");
    this._disposables.add(session.onDidChange((e) => {
      if (this._cancellationTokenSource?.token.isCancellationRequested) {
        return;
      }
      switch (e.status) {
        case SpeechToTextStatus.Started:
          this._terminalDictationInProgress.set(true);
          if (!this._decoration) {
            this._createDecoration();
          }
          break;
        case SpeechToTextStatus.Recognizing: {
          this._updateInput(e);
          this._renderGhostText(e);
          this._updateDecoration();
          if (voiceTimeout > 0) {
            this._acceptTranscriptionScheduler.cancel();
          }
          break;
        }
        case SpeechToTextStatus.Recognized:
          this._updateInput(e);
          this._sendText();
          this._ghostText?.dispose();
          this._ghostText = void 0;
          this._ghostTextMarker?.dispose();
          this._ghostTextMarker = void 0;
          this._updateDecoration();
          this._input = "";
          break;
        case SpeechToTextStatus.Stopped:
          this.stop();
          break;
      }
    }));
  }
  stop(send) {
    this._setInactive();
    if (send) {
      this._acceptTranscriptionScheduler.cancel();
      this._sendText();
    }
    this._ghostText = void 0;
    this._decoration?.dispose();
    this._decoration = void 0;
    this._marker?.dispose();
    this._marker = void 0;
    this._ghostTextMarker = void 0;
    this._cancellationTokenSource?.cancel();
    this._disposables.clear();
    this._input = "";
    this._terminalDictationInProgress.reset();
  }
  _sendText() {
    this._terminalService.activeInstance?.sendText(this._input, false);
    alert(localize("terminalVoiceTextInserted", "{0} inserted", this._input));
  }
  _updateInput(e) {
    if (e.text) {
      let input = e.text.replaceAll(/[.,?;!]/g, "");
      for (const symbol of Object.entries(symbolMap)) {
        input = input.replace(new RegExp("\\b" + symbol[0] + "\\b"), symbol[1]);
      }
      this._input = " " + input;
    }
  }
  _createDecoration() {
    const activeInstance = this._terminalService.activeInstance;
    const xterm = activeInstance?.xterm?.raw;
    if (!xterm) {
      return;
    }
    const onFirstLine = xterm.buffer.active.cursorY === 0;
    const inputLength = this._input.length;
    const xPosition = xterm.buffer.active.cursorX + inputLength;
    this._marker = activeInstance.registerMarker(onFirstLine ? 0 : -1);
    if (!this._marker) {
      return;
    }
    this._decoration = xterm.registerDecoration({
      marker: this._marker,
      layer: "top",
      x: xPosition
    });
    if (!this._decoration) {
      this._marker.dispose();
      this._marker = void 0;
      return;
    }
    this._decoration.onRender((e) => {
      e.classList.add(...ThemeIcon.asClassNameArray(Codicon.micFilled), "terminal-voice", "recording");
      e.style.transform = onFirstLine ? "translate(10px, -2px)" : "translate(-6px, -5px)";
    });
  }
  _updateDecoration() {
    this._decoration?.dispose();
    this._marker?.dispose();
    this._decoration = void 0;
    this._marker = void 0;
    this._createDecoration();
  }
  _setInactive() {
    this._decoration?.element?.classList.remove("recording");
  }
  _renderGhostText(e) {
    this._ghostText?.dispose();
    const text = e.text;
    if (!text) {
      return;
    }
    const activeInstance = this._terminalService.activeInstance;
    const xterm = activeInstance?.xterm?.raw;
    if (!xterm) {
      return;
    }
    this._ghostTextMarker = activeInstance.registerMarker();
    if (!this._ghostTextMarker) {
      return;
    }
    this._disposables.add(this._ghostTextMarker);
    const onFirstLine = xterm.buffer.active.cursorY === 0;
    this._ghostText = xterm.registerDecoration({
      marker: this._ghostTextMarker,
      layer: "top",
      x: onFirstLine ? xterm.buffer.active.cursorX + 4 : xterm.buffer.active.cursorX + 1
    });
    if (this._ghostText) {
      this._disposables.add(this._ghostText);
    }
    this._ghostText?.onRender((e2) => {
      e2.classList.add("terminal-voice-progress-text");
      e2.textContent = text;
      e2.style.width = (xterm.cols - xterm.buffer.active.cursorX) / xterm.cols * 100 + "%";
    });
  }
};
TerminalVoiceSession = TerminalVoiceSession_1 = __decorate([
  __param(0, ISpeechService),
  __param(1, ITerminalService),
  __param(2, IConfigurationService),
  __param(3, IContextKeyService)
], TerminalVoiceSession);
export {
  TerminalVoiceSession
};
//# sourceMappingURL=terminalVoice.js.map
