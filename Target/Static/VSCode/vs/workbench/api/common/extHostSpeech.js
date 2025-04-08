var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CancellationTokenSource } from "../../../base/common/cancellation.js";
import { DisposableStore, IDisposable, toDisposable } from "../../../base/common/lifecycle.js";
import { ExtHostSpeechShape, IMainContext, MainContext, MainThreadSpeechShape } from "./extHost.protocol.js";
import { ExtensionIdentifier } from "../../../platform/extensions/common/extensions.js";
class ExtHostSpeech {
  static {
    __name(this, "ExtHostSpeech");
  }
  static ID_POOL = 1;
  proxy;
  providers = /* @__PURE__ */ new Map();
  sessions = /* @__PURE__ */ new Map();
  synthesizers = /* @__PURE__ */ new Map();
  constructor(mainContext) {
    this.proxy = mainContext.getProxy(MainContext.MainThreadSpeech);
  }
  async $createSpeechToTextSession(handle, session, language) {
    const provider = this.providers.get(handle);
    if (!provider) {
      return;
    }
    const disposables = new DisposableStore();
    const cts = new CancellationTokenSource();
    this.sessions.set(session, cts);
    const speechToTextSession = await provider.provideSpeechToTextSession(cts.token, language ? { language } : void 0);
    if (!speechToTextSession) {
      return;
    }
    disposables.add(speechToTextSession.onDidChange((e) => {
      if (cts.token.isCancellationRequested) {
        return;
      }
      this.proxy.$emitSpeechToTextEvent(session, e);
    }));
    disposables.add(cts.token.onCancellationRequested(() => disposables.dispose()));
  }
  async $cancelSpeechToTextSession(session) {
    this.sessions.get(session)?.dispose(true);
    this.sessions.delete(session);
  }
  async $createTextToSpeechSession(handle, session, language) {
    const provider = this.providers.get(handle);
    if (!provider) {
      return;
    }
    const disposables = new DisposableStore();
    const cts = new CancellationTokenSource();
    this.sessions.set(session, cts);
    const textToSpeech = await provider.provideTextToSpeechSession(cts.token, language ? { language } : void 0);
    if (!textToSpeech) {
      return;
    }
    this.synthesizers.set(session, textToSpeech);
    disposables.add(textToSpeech.onDidChange((e) => {
      if (cts.token.isCancellationRequested) {
        return;
      }
      this.proxy.$emitTextToSpeechEvent(session, e);
    }));
    disposables.add(cts.token.onCancellationRequested(() => disposables.dispose()));
  }
  async $synthesizeSpeech(session, text) {
    this.synthesizers.get(session)?.synthesize(text);
  }
  async $cancelTextToSpeechSession(session) {
    this.sessions.get(session)?.dispose(true);
    this.sessions.delete(session);
    this.synthesizers.delete(session);
  }
  async $createKeywordRecognitionSession(handle, session) {
    const provider = this.providers.get(handle);
    if (!provider) {
      return;
    }
    const disposables = new DisposableStore();
    const cts = new CancellationTokenSource();
    this.sessions.set(session, cts);
    const keywordRecognitionSession = await provider.provideKeywordRecognitionSession(cts.token);
    if (!keywordRecognitionSession) {
      return;
    }
    disposables.add(keywordRecognitionSession.onDidChange((e) => {
      if (cts.token.isCancellationRequested) {
        return;
      }
      this.proxy.$emitKeywordRecognitionEvent(session, e);
    }));
    disposables.add(cts.token.onCancellationRequested(() => disposables.dispose()));
  }
  async $cancelKeywordRecognitionSession(session) {
    this.sessions.get(session)?.dispose(true);
    this.sessions.delete(session);
  }
  registerProvider(extension, identifier, provider) {
    const handle = ExtHostSpeech.ID_POOL++;
    this.providers.set(handle, provider);
    this.proxy.$registerProvider(handle, identifier, { extension, displayName: extension.value });
    return toDisposable(() => {
      this.proxy.$unregisterProvider(handle);
      this.providers.delete(handle);
    });
  }
}
export {
  ExtHostSpeech
};
//# sourceMappingURL=extHostSpeech.js.map
