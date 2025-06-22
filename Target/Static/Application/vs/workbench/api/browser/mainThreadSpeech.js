var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { raceCancellation } from "../../../base/common/async.js";
import { Emitter, Event } from "../../../base/common/event.js";
import { DisposableStore } from "../../../base/common/lifecycle.js";
import { ILogService } from "../../../platform/log/common/log.js";
import { ExtHostContext, MainContext } from "../common/extHost.protocol.js";
import { ISpeechService, TextToSpeechStatus } from "../../contrib/speech/common/speechService.js";
import { extHostNamedCustomer } from "../../services/extensions/common/extHostCustomers.js";
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
let MainThreadSpeech = class MainThreadSpeech2 {
  static {
    __name(this, "MainThreadSpeech");
  }
  constructor(extHostContext, speechService, logService) {
    this.speechService = speechService;
    this.logService = logService;
    this.providerRegistrations = /* @__PURE__ */ new Map();
    this.speechToTextSessions = /* @__PURE__ */ new Map();
    this.textToSpeechSessions = /* @__PURE__ */ new Map();
    this.keywordRecognitionSessions = /* @__PURE__ */ new Map();
    this.proxy = extHostContext.getProxy(ExtHostContext.ExtHostSpeech);
  }
  $registerProvider(handle, identifier, metadata) {
    this.logService.trace("[Speech] extension registered provider", metadata.extension.value);
    const registration = this.speechService.registerSpeechProvider(identifier, {
      metadata,
      createSpeechToTextSession: /* @__PURE__ */ __name((token, options) => {
        if (token.isCancellationRequested) {
          return {
            onDidChange: Event.None
          };
        }
        const disposables = new DisposableStore();
        const session = Math.random();
        this.proxy.$createSpeechToTextSession(handle, session, options?.language);
        const onDidChange = disposables.add(new Emitter());
        this.speechToTextSessions.set(session, { onDidChange });
        disposables.add(token.onCancellationRequested(() => {
          this.proxy.$cancelSpeechToTextSession(session);
          this.speechToTextSessions.delete(session);
          disposables.dispose();
        }));
        return {
          onDidChange: onDidChange.event
        };
      }, "createSpeechToTextSession"),
      createTextToSpeechSession: /* @__PURE__ */ __name((token, options) => {
        if (token.isCancellationRequested) {
          return {
            onDidChange: Event.None,
            synthesize: /* @__PURE__ */ __name(async () => {
            }, "synthesize")
          };
        }
        const disposables = new DisposableStore();
        const session = Math.random();
        this.proxy.$createTextToSpeechSession(handle, session, options?.language);
        const onDidChange = disposables.add(new Emitter());
        this.textToSpeechSessions.set(session, { onDidChange });
        disposables.add(token.onCancellationRequested(() => {
          this.proxy.$cancelTextToSpeechSession(session);
          this.textToSpeechSessions.delete(session);
          disposables.dispose();
        }));
        return {
          onDidChange: onDidChange.event,
          synthesize: /* @__PURE__ */ __name(async (text) => {
            await this.proxy.$synthesizeSpeech(session, text);
            const disposable = new DisposableStore();
            try {
              await raceCancellation(Event.toPromise(Event.filter(onDidChange.event, (e) => e.status === TextToSpeechStatus.Stopped, disposable), disposable), token);
            } finally {
              disposable.dispose();
            }
          }, "synthesize")
        };
      }, "createTextToSpeechSession"),
      createKeywordRecognitionSession: /* @__PURE__ */ __name((token) => {
        if (token.isCancellationRequested) {
          return {
            onDidChange: Event.None
          };
        }
        const disposables = new DisposableStore();
        const session = Math.random();
        this.proxy.$createKeywordRecognitionSession(handle, session);
        const onDidChange = disposables.add(new Emitter());
        this.keywordRecognitionSessions.set(session, { onDidChange });
        disposables.add(token.onCancellationRequested(() => {
          this.proxy.$cancelKeywordRecognitionSession(session);
          this.keywordRecognitionSessions.delete(session);
          disposables.dispose();
        }));
        return {
          onDidChange: onDidChange.event
        };
      }, "createKeywordRecognitionSession")
    });
    this.providerRegistrations.set(handle, {
      dispose: /* @__PURE__ */ __name(() => {
        registration.dispose();
      }, "dispose")
    });
  }
  $unregisterProvider(handle) {
    const registration = this.providerRegistrations.get(handle);
    if (registration) {
      registration.dispose();
      this.providerRegistrations.delete(handle);
    }
  }
  $emitSpeechToTextEvent(session, event) {
    const providerSession = this.speechToTextSessions.get(session);
    providerSession?.onDidChange.fire(event);
  }
  $emitTextToSpeechEvent(session, event) {
    const providerSession = this.textToSpeechSessions.get(session);
    providerSession?.onDidChange.fire(event);
  }
  $emitKeywordRecognitionEvent(session, event) {
    const providerSession = this.keywordRecognitionSessions.get(session);
    providerSession?.onDidChange.fire(event);
  }
  dispose() {
    this.providerRegistrations.forEach((disposable) => disposable.dispose());
    this.providerRegistrations.clear();
    this.speechToTextSessions.forEach((session) => session.onDidChange.dispose());
    this.speechToTextSessions.clear();
    this.textToSpeechSessions.forEach((session) => session.onDidChange.dispose());
    this.textToSpeechSessions.clear();
    this.keywordRecognitionSessions.forEach((session) => session.onDidChange.dispose());
    this.keywordRecognitionSessions.clear();
  }
};
MainThreadSpeech = __decorate([
  extHostNamedCustomer(MainContext.MainThreadSpeech),
  __param(1, ISpeechService),
  __param(2, ILogService)
], MainThreadSpeech);
export {
  MainThreadSpeech
};
//# sourceMappingURL=mainThreadSpeech.js.map
