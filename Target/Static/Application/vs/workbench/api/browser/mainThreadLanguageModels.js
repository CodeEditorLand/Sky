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
import { AsyncIterableSource, DeferredPromise } from "../../../base/common/async.js";
import { VSBuffer } from "../../../base/common/buffer.js";
import { toErrorMessage } from "../../../base/common/errorMessage.js";
import { transformErrorForSerialization, transformErrorFromSerialization } from "../../../base/common/errors.js";
import { Emitter, Event } from "../../../base/common/event.js";
import { Disposable, DisposableMap, DisposableStore, toDisposable } from "../../../base/common/lifecycle.js";
import { URI } from "../../../base/common/uri.js";
import { localize } from "../../../nls.js";
import { ILogService } from "../../../platform/log/common/log.js";
import { resizeImage } from "../../contrib/chat/browser/chatImageUtils.js";
import { ILanguageModelIgnoredFilesService } from "../../contrib/chat/common/ignoredFiles.js";
import { ILanguageModelsService } from "../../contrib/chat/common/languageModels.js";
import { IAuthenticationAccessService } from "../../services/authentication/browser/authenticationAccessService.js";
import { IAuthenticationService, INTERNAL_AUTH_PROVIDER_PREFIX } from "../../services/authentication/common/authentication.js";
import { extHostNamedCustomer } from "../../services/extensions/common/extHostCustomers.js";
import { IExtensionService } from "../../services/extensions/common/extensions.js";
import { SerializableObjectWithBuffers } from "../../services/extensions/common/proxyIdentifier.js";
import { ExtHostContext, MainContext } from "../common/extHost.protocol.js";
import { LanguageModelError } from "../common/extHostTypes.js";
let MainThreadLanguageModels = class MainThreadLanguageModels2 {
  static {
    __name(this, "MainThreadLanguageModels");
  }
  constructor(extHostContext, _chatProviderService, _logService, _authenticationService, _authenticationAccessService, _extensionService, _ignoredFilesService) {
    this._chatProviderService = _chatProviderService;
    this._logService = _logService;
    this._authenticationService = _authenticationService;
    this._authenticationAccessService = _authenticationAccessService;
    this._extensionService = _extensionService;
    this._ignoredFilesService = _ignoredFilesService;
    this._store = new DisposableStore();
    this._providerRegistrations = new DisposableMap();
    this._lmProviderChange = new Emitter();
    this._pendingProgress = /* @__PURE__ */ new Map();
    this._ignoredFileProviderRegistrations = new DisposableMap();
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostChatProvider);
  }
  dispose() {
    this._lmProviderChange.dispose();
    this._providerRegistrations.dispose();
    this._ignoredFileProviderRegistrations.dispose();
    this._store.dispose();
  }
  $registerLanguageModelProvider(vendor) {
    const disposables = new DisposableStore();
    try {
      disposables.add(this._chatProviderService.registerLanguageModelProvider(vendor, {
        onDidChange: Event.filter(this._lmProviderChange.event, (e) => e.vendor === vendor, disposables),
        provideLanguageModelChatInfo: /* @__PURE__ */ __name(async (options, token) => {
          const modelsAndIdentifiers = await this._proxy.$provideLanguageModelChatInfo(vendor, options, token);
          modelsAndIdentifiers.forEach((m) => {
            if (m.metadata.auth) {
              disposables.add(this._registerAuthenticationProvider(m.metadata.extension, m.metadata.auth));
            }
          });
          return modelsAndIdentifiers;
        }, "provideLanguageModelChatInfo"),
        sendChatRequest: /* @__PURE__ */ __name(async (modelId, messages, from, options, token) => {
          const requestId = Math.random() * 1e6 | 0;
          const defer = new DeferredPromise();
          const stream = new AsyncIterableSource();
          try {
            this._pendingProgress.set(requestId, { defer, stream });
            await Promise.all(messages.flatMap((msg) => msg.content).filter((part) => part.type === "image_url").map(async (part) => {
              part.value.data = VSBuffer.wrap(await resizeImage(part.value.data.buffer));
            }));
            await this._proxy.$startChatRequest(modelId, requestId, from, new SerializableObjectWithBuffers(messages), options, token);
          } catch (err) {
            this._pendingProgress.delete(requestId);
            throw err;
          }
          return {
            result: defer.p,
            stream: stream.asyncIterable
          };
        }, "sendChatRequest"),
        provideTokenCount: /* @__PURE__ */ __name((modelId, str, token) => {
          return this._proxy.$provideTokenLength(modelId, str, token);
        }, "provideTokenCount")
      }));
      this._providerRegistrations.set(vendor, disposables);
    } catch (err) {
      disposables.dispose();
      throw err;
    }
  }
  $onLMProviderChange(vendor) {
    this._lmProviderChange.fire({ vendor });
  }
  async $reportResponsePart(requestId, chunk) {
    const data = this._pendingProgress.get(requestId);
    this._logService.trace("[LM] report response PART", Boolean(data), requestId, chunk);
    if (data) {
      data.stream.emitOne(chunk.value);
    }
  }
  async $reportResponseDone(requestId, err) {
    const data = this._pendingProgress.get(requestId);
    this._logService.trace("[LM] report response DONE", Boolean(data), requestId, err);
    if (data) {
      this._pendingProgress.delete(requestId);
      if (err) {
        const error = LanguageModelError.tryDeserialize(err) ?? transformErrorFromSerialization(err);
        data.stream.reject(error);
        data.defer.error(error);
      } else {
        data.stream.resolve();
        data.defer.complete(void 0);
      }
    }
  }
  $unregisterProvider(vendor) {
    this._providerRegistrations.deleteAndDispose(vendor);
  }
  $selectChatModels(selector) {
    return this._chatProviderService.selectLanguageModels(selector);
  }
  async $tryStartChatRequest(extension, modelIdentifier, requestId, messages, options, token) {
    this._logService.trace("[CHAT] request STARTED", extension.value, requestId);
    let response;
    try {
      response = await this._chatProviderService.sendChatRequest(modelIdentifier, extension, messages.value, options, token);
    } catch (err) {
      this._logService.error("[CHAT] request FAILED", extension.value, requestId, err);
      throw err;
    }
    const streaming = (async () => {
      try {
        for await (const part of response.stream) {
          this._logService.trace("[CHAT] request PART", extension.value, requestId, part);
          await this._proxy.$acceptResponsePart(requestId, new SerializableObjectWithBuffers(part));
        }
        this._logService.trace("[CHAT] request DONE", extension.value, requestId);
      } catch (err) {
        this._logService.error("[CHAT] extension request ERRORED in STREAM", toErrorMessage(err, true), extension.value, requestId);
        this._proxy.$acceptResponseDone(requestId, transformErrorForSerialization(err));
      }
    })();
    Promise.allSettled([response.result, streaming]).then(() => {
      this._logService.debug("[CHAT] extension request DONE", extension.value, requestId);
      this._proxy.$acceptResponseDone(requestId, void 0);
    }, (err) => {
      this._logService.error("[CHAT] extension request ERRORED", toErrorMessage(err, true), extension.value, requestId);
      this._proxy.$acceptResponseDone(requestId, transformErrorForSerialization(err));
    });
  }
  $countTokens(modelId, value, token) {
    return this._chatProviderService.computeTokenLength(modelId, value, token);
  }
  _registerAuthenticationProvider(extension, auth) {
    const authProviderId = INTERNAL_AUTH_PROVIDER_PREFIX + extension.value;
    if (this._authenticationService.getProviderIds().includes(authProviderId)) {
      return Disposable.None;
    }
    const accountLabel = auth.accountLabel ?? localize("languageModelsAccountId", "Language Models");
    const disposables = new DisposableStore();
    this._authenticationService.registerAuthenticationProvider(authProviderId, new LanguageModelAccessAuthProvider(authProviderId, auth.providerLabel, accountLabel));
    disposables.add(toDisposable(() => {
      this._authenticationService.unregisterAuthenticationProvider(authProviderId);
    }));
    disposables.add(this._authenticationAccessService.onDidChangeExtensionSessionAccess(async (e) => {
      const allowedExtensions = this._authenticationAccessService.readAllowedExtensions(authProviderId, accountLabel);
      const accessList = [];
      for (const allowedExtension of allowedExtensions) {
        const from = await this._extensionService.getExtension(allowedExtension.id);
        if (from) {
          accessList.push({
            from: from.identifier,
            to: extension,
            enabled: allowedExtension.allowed ?? true
          });
        }
      }
      this._proxy.$updateModelAccesslist(accessList);
    }));
    return disposables;
  }
  $fileIsIgnored(uri, token) {
    return this._ignoredFilesService.fileIsIgnored(URI.revive(uri), token);
  }
  $registerFileIgnoreProvider(handle) {
    this._ignoredFileProviderRegistrations.set(handle, this._ignoredFilesService.registerIgnoredFileProvider({
      isFileIgnored: /* @__PURE__ */ __name(async (uri, token) => this._proxy.$isFileIgnored(handle, uri, token), "isFileIgnored")
    }));
  }
  $unregisterFileIgnoreProvider(handle) {
    this._ignoredFileProviderRegistrations.deleteAndDispose(handle);
  }
};
MainThreadLanguageModels = __decorate([
  extHostNamedCustomer(MainContext.MainThreadLanguageModels),
  __param(1, ILanguageModelsService),
  __param(2, ILogService),
  __param(3, IAuthenticationService),
  __param(4, IAuthenticationAccessService),
  __param(5, IExtensionService),
  __param(6, ILanguageModelIgnoredFilesService)
], MainThreadLanguageModels);
class LanguageModelAccessAuthProvider {
  static {
    __name(this, "LanguageModelAccessAuthProvider");
  }
  constructor(id, label, _accountLabel) {
    this.id = id;
    this.label = label;
    this._accountLabel = _accountLabel;
    this.supportsMultipleAccounts = false;
    this._onDidChangeSessions = new Emitter();
    this.onDidChangeSessions = this._onDidChangeSessions.event;
  }
  async getSessions(scopes) {
    if (scopes === void 0 && !this._session) {
      return [];
    }
    if (this._session) {
      return [this._session];
    }
    return [await this.createSession(scopes || [])];
  }
  async createSession(scopes) {
    this._session = this._createFakeSession(scopes);
    this._onDidChangeSessions.fire({ added: [this._session], changed: [], removed: [] });
    return this._session;
  }
  removeSession(sessionId) {
    if (this._session) {
      this._onDidChangeSessions.fire({ added: [], changed: [], removed: [this._session] });
      this._session = void 0;
    }
    return Promise.resolve();
  }
  confirmation(extensionName, _recreatingSession) {
    return localize("confirmLanguageModelAccess", "The extension '{0}' wants to access the language models provided by {1}.", extensionName, this.label);
  }
  _createFakeSession(scopes) {
    return {
      id: "fake-session",
      account: {
        id: this.id,
        label: this._accountLabel
      },
      accessToken: "fake-access-token",
      scopes
    };
  }
}
export {
  MainThreadLanguageModels
};
//# sourceMappingURL=mainThreadLanguageModels.js.map
