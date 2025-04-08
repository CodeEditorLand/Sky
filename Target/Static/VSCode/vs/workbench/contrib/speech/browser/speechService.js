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
import { localize } from "../../../../nls.js";
import { CancellationToken, CancellationTokenSource } from "../../../../base/common/cancellation.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { Disposable, DisposableStore, IDisposable, toDisposable } from "../../../../base/common/lifecycle.js";
import { IContextKey, IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IHostService } from "../../../services/host/browser/host.js";
import { DeferredPromise } from "../../../../base/common/async.js";
import { ISpeechService, ISpeechProvider, HasSpeechProvider, ISpeechToTextSession, SpeechToTextInProgress, KeywordRecognitionStatus, SpeechToTextStatus, speechLanguageConfigToLanguage, SPEECH_LANGUAGE_CONFIG, ITextToSpeechSession, TextToSpeechInProgress, TextToSpeechStatus } from "../common/speechService.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { ExtensionsRegistry } from "../../../services/extensions/common/extensionsRegistry.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.js";
const speechProvidersExtensionPoint = ExtensionsRegistry.registerExtensionPoint({
  extensionPoint: "speechProviders",
  jsonSchema: {
    description: localize("vscode.extension.contributes.speechProvider", "Contributes a Speech Provider"),
    type: "array",
    items: {
      additionalProperties: false,
      type: "object",
      defaultSnippets: [{ body: { name: "", description: "" } }],
      required: ["name"],
      properties: {
        name: {
          description: localize("speechProviderName", "Unique name for this Speech Provider."),
          type: "string"
        },
        description: {
          description: localize("speechProviderDescription", "A description of this Speech Provider, shown in the UI."),
          type: "string"
        }
      }
    }
  }
});
let SpeechService = class extends Disposable {
  constructor(logService, contextKeyService, hostService, telemetryService, configurationService, extensionService) {
    super();
    this.logService = logService;
    this.hostService = hostService;
    this.telemetryService = telemetryService;
    this.configurationService = configurationService;
    this.extensionService = extensionService;
    this.hasSpeechProviderContext = HasSpeechProvider.bindTo(contextKeyService);
    this.textToSpeechInProgress = TextToSpeechInProgress.bindTo(contextKeyService);
    this.speechToTextInProgress = SpeechToTextInProgress.bindTo(contextKeyService);
    this.handleAndRegisterSpeechExtensions();
  }
  static {
    __name(this, "SpeechService");
  }
  _serviceBrand;
  _onDidChangeHasSpeechProvider = this._register(new Emitter());
  onDidChangeHasSpeechProvider = this._onDidChangeHasSpeechProvider.event;
  get hasSpeechProvider() {
    return this.providerDescriptors.size > 0 || this.providers.size > 0;
  }
  providers = /* @__PURE__ */ new Map();
  providerDescriptors = /* @__PURE__ */ new Map();
  hasSpeechProviderContext;
  handleAndRegisterSpeechExtensions() {
    speechProvidersExtensionPoint.setHandler((extensions, delta) => {
      const oldHasSpeechProvider = this.hasSpeechProvider;
      for (const extension of delta.removed) {
        for (const descriptor of extension.value) {
          this.providerDescriptors.delete(descriptor.name);
        }
      }
      for (const extension of delta.added) {
        for (const descriptor of extension.value) {
          this.providerDescriptors.set(descriptor.name, descriptor);
        }
      }
      if (oldHasSpeechProvider !== this.hasSpeechProvider) {
        this.handleHasSpeechProviderChange();
      }
    });
  }
  registerSpeechProvider(identifier, provider) {
    if (this.providers.has(identifier)) {
      throw new Error(`Speech provider with identifier ${identifier} is already registered.`);
    }
    const oldHasSpeechProvider = this.hasSpeechProvider;
    this.providers.set(identifier, provider);
    if (oldHasSpeechProvider !== this.hasSpeechProvider) {
      this.handleHasSpeechProviderChange();
    }
    return toDisposable(() => {
      const oldHasSpeechProvider2 = this.hasSpeechProvider;
      this.providers.delete(identifier);
      if (oldHasSpeechProvider2 !== this.hasSpeechProvider) {
        this.handleHasSpeechProviderChange();
      }
    });
  }
  handleHasSpeechProviderChange() {
    this.hasSpeechProviderContext.set(this.hasSpeechProvider);
    this._onDidChangeHasSpeechProvider.fire();
  }
  //#region Speech to Text
  _onDidStartSpeechToTextSession = this._register(new Emitter());
  onDidStartSpeechToTextSession = this._onDidStartSpeechToTextSession.event;
  _onDidEndSpeechToTextSession = this._register(new Emitter());
  onDidEndSpeechToTextSession = this._onDidEndSpeechToTextSession.event;
  activeSpeechToTextSessions = 0;
  get hasActiveSpeechToTextSession() {
    return this.activeSpeechToTextSessions > 0;
  }
  speechToTextInProgress;
  async createSpeechToTextSession(token, context = "speech") {
    const provider = await this.getProvider();
    const language = speechLanguageConfigToLanguage(this.configurationService.getValue(SPEECH_LANGUAGE_CONFIG));
    const session = provider.createSpeechToTextSession(token, typeof language === "string" ? { language } : void 0);
    const sessionStart = Date.now();
    let sessionRecognized = false;
    let sessionError = false;
    let sessionContentLength = 0;
    const disposables = new DisposableStore();
    const onSessionStoppedOrCanceled = /* @__PURE__ */ __name(() => {
      this.activeSpeechToTextSessions = Math.max(0, this.activeSpeechToTextSessions - 1);
      if (!this.hasActiveSpeechToTextSession) {
        this.speechToTextInProgress.reset();
      }
      this._onDidEndSpeechToTextSession.fire();
      this.telemetryService.publicLog2("speechToTextSession", {
        context,
        sessionDuration: Date.now() - sessionStart,
        sessionRecognized,
        sessionError,
        sessionContentLength,
        sessionLanguage: language
      });
      disposables.dispose();
    }, "onSessionStoppedOrCanceled");
    disposables.add(token.onCancellationRequested(() => onSessionStoppedOrCanceled()));
    if (token.isCancellationRequested) {
      onSessionStoppedOrCanceled();
    }
    disposables.add(session.onDidChange((e) => {
      switch (e.status) {
        case SpeechToTextStatus.Started:
          this.activeSpeechToTextSessions++;
          this.speechToTextInProgress.set(true);
          this._onDidStartSpeechToTextSession.fire();
          break;
        case SpeechToTextStatus.Recognizing:
          sessionRecognized = true;
          break;
        case SpeechToTextStatus.Recognized:
          if (typeof e.text === "string") {
            sessionContentLength += e.text.length;
          }
          break;
        case SpeechToTextStatus.Stopped:
          onSessionStoppedOrCanceled();
          break;
        case SpeechToTextStatus.Error:
          this.logService.error(`Speech provider error in speech to text session: ${e.text}`);
          sessionError = true;
          break;
      }
    }));
    return session;
  }
  async getProvider() {
    await this.extensionService.activateByEvent("onSpeech");
    const provider = Array.from(this.providers.values()).at(0);
    if (!provider) {
      throw new Error(`No Speech provider is registered.`);
    } else if (this.providers.size > 1) {
      this.logService.warn(`Multiple speech providers registered. Picking first one: ${provider.metadata.displayName}`);
    }
    return provider;
  }
  //#endregion
  //#region Text to Speech
  _onDidStartTextToSpeechSession = this._register(new Emitter());
  onDidStartTextToSpeechSession = this._onDidStartTextToSpeechSession.event;
  _onDidEndTextToSpeechSession = this._register(new Emitter());
  onDidEndTextToSpeechSession = this._onDidEndTextToSpeechSession.event;
  activeTextToSpeechSessions = 0;
  get hasActiveTextToSpeechSession() {
    return this.activeTextToSpeechSessions > 0;
  }
  textToSpeechInProgress;
  async createTextToSpeechSession(token, context = "speech") {
    const provider = await this.getProvider();
    const language = speechLanguageConfigToLanguage(this.configurationService.getValue(SPEECH_LANGUAGE_CONFIG));
    const session = provider.createTextToSpeechSession(token, typeof language === "string" ? { language } : void 0);
    const sessionStart = Date.now();
    let sessionError = false;
    const disposables = new DisposableStore();
    const onSessionStoppedOrCanceled = /* @__PURE__ */ __name((dispose) => {
      this.activeTextToSpeechSessions = Math.max(0, this.activeTextToSpeechSessions - 1);
      if (!this.hasActiveTextToSpeechSession) {
        this.textToSpeechInProgress.reset();
      }
      this._onDidEndTextToSpeechSession.fire();
      this.telemetryService.publicLog2("textToSpeechSession", {
        context,
        sessionDuration: Date.now() - sessionStart,
        sessionError,
        sessionLanguage: language
      });
      if (dispose) {
        disposables.dispose();
      }
    }, "onSessionStoppedOrCanceled");
    disposables.add(token.onCancellationRequested(() => onSessionStoppedOrCanceled(true)));
    if (token.isCancellationRequested) {
      onSessionStoppedOrCanceled(true);
    }
    disposables.add(session.onDidChange((e) => {
      switch (e.status) {
        case TextToSpeechStatus.Started:
          this.activeTextToSpeechSessions++;
          this.textToSpeechInProgress.set(true);
          this._onDidStartTextToSpeechSession.fire();
          break;
        case TextToSpeechStatus.Stopped:
          onSessionStoppedOrCanceled(false);
          break;
        case TextToSpeechStatus.Error:
          this.logService.error(`Speech provider error in text to speech session: ${e.text}`);
          sessionError = true;
          break;
      }
    }));
    return session;
  }
  //#endregion
  //#region Keyword Recognition
  _onDidStartKeywordRecognition = this._register(new Emitter());
  onDidStartKeywordRecognition = this._onDidStartKeywordRecognition.event;
  _onDidEndKeywordRecognition = this._register(new Emitter());
  onDidEndKeywordRecognition = this._onDidEndKeywordRecognition.event;
  activeKeywordRecognitionSessions = 0;
  get hasActiveKeywordRecognition() {
    return this.activeKeywordRecognitionSessions > 0;
  }
  async recognizeKeyword(token) {
    const result = new DeferredPromise();
    const disposables = new DisposableStore();
    disposables.add(token.onCancellationRequested(() => {
      disposables.dispose();
      result.complete(KeywordRecognitionStatus.Canceled);
    }));
    const recognizeKeywordDisposables = disposables.add(new DisposableStore());
    let activeRecognizeKeywordSession = void 0;
    const recognizeKeyword = /* @__PURE__ */ __name(() => {
      recognizeKeywordDisposables.clear();
      const cts = new CancellationTokenSource(token);
      recognizeKeywordDisposables.add(toDisposable(() => cts.dispose(true)));
      const currentRecognizeKeywordSession = activeRecognizeKeywordSession = this.doRecognizeKeyword(cts.token).then((status2) => {
        if (currentRecognizeKeywordSession === activeRecognizeKeywordSession) {
          result.complete(status2);
        }
      }, (error) => {
        if (currentRecognizeKeywordSession === activeRecognizeKeywordSession) {
          result.error(error);
        }
      });
    }, "recognizeKeyword");
    disposables.add(this.hostService.onDidChangeFocus((focused) => {
      if (!focused && activeRecognizeKeywordSession) {
        recognizeKeywordDisposables.clear();
        activeRecognizeKeywordSession = void 0;
      } else if (!activeRecognizeKeywordSession) {
        recognizeKeyword();
      }
    }));
    if (this.hostService.hasFocus) {
      recognizeKeyword();
    }
    let status;
    try {
      status = await result.p;
    } finally {
      disposables.dispose();
    }
    this.telemetryService.publicLog2("keywordRecognition", {
      keywordRecognized: status === KeywordRecognitionStatus.Recognized
    });
    return status;
  }
  async doRecognizeKeyword(token) {
    const provider = await this.getProvider();
    const session = provider.createKeywordRecognitionSession(token);
    this.activeKeywordRecognitionSessions++;
    this._onDidStartKeywordRecognition.fire();
    const disposables = new DisposableStore();
    const onSessionStoppedOrCanceled = /* @__PURE__ */ __name(() => {
      this.activeKeywordRecognitionSessions = Math.max(0, this.activeKeywordRecognitionSessions - 1);
      this._onDidEndKeywordRecognition.fire();
      disposables.dispose();
    }, "onSessionStoppedOrCanceled");
    disposables.add(token.onCancellationRequested(() => onSessionStoppedOrCanceled()));
    if (token.isCancellationRequested) {
      onSessionStoppedOrCanceled();
    }
    disposables.add(session.onDidChange((e) => {
      if (e.status === KeywordRecognitionStatus.Stopped) {
        onSessionStoppedOrCanceled();
      }
    }));
    try {
      return (await Event.toPromise(session.onDidChange)).status;
    } finally {
      onSessionStoppedOrCanceled();
    }
  }
  //#endregion
};
SpeechService = __decorateClass([
  __decorateParam(0, ILogService),
  __decorateParam(1, IContextKeyService),
  __decorateParam(2, IHostService),
  __decorateParam(3, ITelemetryService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, IExtensionService)
], SpeechService);
export {
  SpeechService
};
//# sourceMappingURL=speechService.js.map
