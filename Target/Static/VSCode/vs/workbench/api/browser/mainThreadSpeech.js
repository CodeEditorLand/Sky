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
import { raceCancellation } from "../../../base/common/async.js";
import { Emitter, Event } from "../../../base/common/event.js";
import { DisposableStore, IDisposable } from "../../../base/common/lifecycle.js";
import { ILogService } from "../../../platform/log/common/log.js";
import { ExtHostContext, ExtHostSpeechShape, MainContext, MainThreadSpeechShape } from "../common/extHost.protocol.js";
import { IKeywordRecognitionEvent, ISpeechProviderMetadata, ISpeechService, ISpeechToTextEvent, ITextToSpeechEvent, TextToSpeechStatus } from "../../contrib/speech/common/speechService.js";
import { IExtHostContext, extHostNamedCustomer } from "../../services/extensions/common/extHostCustomers.js";
let MainThreadSpeech = class {
  constructor(extHostContext, speechService, logService) {
    this.speechService = speechService;
    this.logService = logService;
    this.proxy = extHostContext.getProxy(ExtHostContext.ExtHostSpeech);
  }
  proxy;
  providerRegistrations = /* @__PURE__ */ new Map();
  speechToTextSessions = /* @__PURE__ */ new Map();
  textToSpeechSessions = /* @__PURE__ */ new Map();
  keywordRecognitionSessions = /* @__PURE__ */ new Map();
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
__name(MainThreadSpeech, "MainThreadSpeech");
MainThreadSpeech = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadSpeech),
  __decorateParam(1, ISpeechService),
  __decorateParam(2, ILogService)
], MainThreadSpeech);
export {
  MainThreadSpeech
};
//# sourceMappingURL=mainThreadSpeech.js.map
