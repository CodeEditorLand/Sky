var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { coalesce, isNonEmptyArray } from "../../../base/common/arrays.js";
import { raceCancellation } from "../../../base/common/async.js";
import { CancellationTokenSource } from "../../../base/common/cancellation.js";
import { toErrorMessage } from "../../../base/common/errorMessage.js";
import { Emitter } from "../../../base/common/event.js";
import { Iterable } from "../../../base/common/iterator.js";
import { Disposable, DisposableMap, DisposableStore, toDisposable } from "../../../base/common/lifecycle.js";
import { revive } from "../../../base/common/marshalling.js";
import { StopWatch } from "../../../base/common/stopwatch.js";
import { assertType } from "../../../base/common/types.js";
import { URI } from "../../../base/common/uri.js";
import { generateUuid } from "../../../base/common/uuid.js";
import { ExtensionIdentifier } from "../../../platform/extensions/common/extensions.js";
import { isChatViewTitleActionContext } from "../../contrib/chat/common/chatActions.js";
import { ChatAgentVoteDirection } from "../../contrib/chat/common/chatService.js";
import { ChatAgentLocation } from "../../contrib/chat/common/constants.js";
import { checkProposedApiEnabled, isProposedApiEnabled } from "../../services/extensions/common/extensions.js";
import { MainContext } from "./extHost.protocol.js";
import * as typeConvert from "./extHostTypeConverters.js";
import * as extHostTypes from "./extHostTypes.js";
class ChatAgentResponseStream {
  static {
    __name(this, "ChatAgentResponseStream");
  }
  constructor(_extension, _request, _proxy, _commandsConverter, _sessionDisposables) {
    this._extension = _extension;
    this._request = _request;
    this._proxy = _proxy;
    this._commandsConverter = _commandsConverter;
    this._sessionDisposables = _sessionDisposables;
    this._stopWatch = StopWatch.create(false);
    this._isClosed = false;
  }
  close() {
    this._isClosed = true;
  }
  get timings() {
    return {
      firstProgress: this._firstProgress,
      totalElapsed: this._stopWatch.elapsed()
    };
  }
  get apiObject() {
    if (!this._apiObject) {
      let throwIfDone2 = function(source) {
        if (that._isClosed) {
          const err = new Error("Response stream has been closed");
          Error.captureStackTrace(err, source);
          throw err;
        }
      };
      var throwIfDone = throwIfDone2;
      __name(throwIfDone2, "throwIfDone");
      const that = this;
      this._stopWatch.reset();
      const _report = /* @__PURE__ */ __name((progress, task) => {
        if (typeof this._firstProgress === "undefined" && (progress.kind === "markdownContent" || progress.kind === "markdownVuln")) {
          this._firstProgress = this._stopWatch.elapsed();
        }
        if (task) {
          const progressReporterPromise = this._proxy.$handleProgressChunk(this._request.requestId, progress);
          const progressReporter = {
            report: /* @__PURE__ */ __name((p) => {
              progressReporterPromise?.then((handle) => {
                if (handle) {
                  if (extHostTypes.MarkdownString.isMarkdownString(p.value)) {
                    this._proxy.$handleProgressChunk(this._request.requestId, typeConvert.ChatResponseWarningPart.from(p), handle);
                  } else {
                    this._proxy.$handleProgressChunk(this._request.requestId, typeConvert.ChatResponseReferencePart.from(p), handle);
                  }
                }
              });
            }, "report")
          };
          Promise.all([progressReporterPromise, task?.(progressReporter)]).then(([handle, res]) => {
            if (handle !== void 0) {
              this._proxy.$handleProgressChunk(this._request.requestId, typeConvert.ChatTaskResult.from(res), handle);
            }
          });
        } else {
          this._proxy.$handleProgressChunk(this._request.requestId, progress);
        }
      }, "_report");
      this._apiObject = Object.freeze({
        markdown(value) {
          throwIfDone2(this.markdown);
          const part = new extHostTypes.ChatResponseMarkdownPart(value);
          const dto = typeConvert.ChatResponseMarkdownPart.from(part);
          _report(dto);
          return this;
        },
        markdownWithVulnerabilities(value, vulnerabilities) {
          throwIfDone2(this.markdown);
          if (vulnerabilities) {
            checkProposedApiEnabled(that._extension, "chatParticipantAdditions");
          }
          const part = new extHostTypes.ChatResponseMarkdownWithVulnerabilitiesPart(value, vulnerabilities);
          const dto = typeConvert.ChatResponseMarkdownWithVulnerabilitiesPart.from(part);
          _report(dto);
          return this;
        },
        codeblockUri(value, isEdit) {
          throwIfDone2(this.codeblockUri);
          checkProposedApiEnabled(that._extension, "chatParticipantAdditions");
          const part = new extHostTypes.ChatResponseCodeblockUriPart(value, isEdit);
          const dto = typeConvert.ChatResponseCodeblockUriPart.from(part);
          _report(dto);
          return this;
        },
        filetree(value, baseUri) {
          throwIfDone2(this.filetree);
          const part = new extHostTypes.ChatResponseFileTreePart(value, baseUri);
          const dto = typeConvert.ChatResponseFilesPart.from(part);
          _report(dto);
          return this;
        },
        anchor(value, title) {
          const part = new extHostTypes.ChatResponseAnchorPart(value, title);
          return this.push(part);
        },
        button(value) {
          throwIfDone2(this.anchor);
          const part = new extHostTypes.ChatResponseCommandButtonPart(value);
          const dto = typeConvert.ChatResponseCommandButtonPart.from(part, that._commandsConverter, that._sessionDisposables);
          _report(dto);
          return this;
        },
        progress(value, task) {
          throwIfDone2(this.progress);
          const part = new extHostTypes.ChatResponseProgressPart2(value, task);
          const dto = task ? typeConvert.ChatTask.from(part) : typeConvert.ChatResponseProgressPart.from(part);
          _report(dto, task);
          return this;
        },
        warning(value) {
          throwIfDone2(this.progress);
          checkProposedApiEnabled(that._extension, "chatParticipantAdditions");
          const part = new extHostTypes.ChatResponseWarningPart(value);
          const dto = typeConvert.ChatResponseWarningPart.from(part);
          _report(dto);
          return this;
        },
        reference(value, iconPath) {
          return this.reference2(value, iconPath);
        },
        reference2(value, iconPath, options) {
          throwIfDone2(this.reference);
          if (typeof value === "object" && "variableName" in value) {
            checkProposedApiEnabled(that._extension, "chatParticipantAdditions");
          }
          if (typeof value === "object" && "variableName" in value && !value.value) {
            const matchingVarData = that._request.variables.variables.find((v) => v.name === value.variableName);
            if (matchingVarData) {
              let references;
              if (matchingVarData.references?.length) {
                references = matchingVarData.references.map((r) => ({
                  kind: "reference",
                  reference: { variableName: value.variableName, value: r.reference }
                }));
              } else {
                const part = new extHostTypes.ChatResponseReferencePart(value, iconPath, options);
                const dto = typeConvert.ChatResponseReferencePart.from(part);
                references = [dto];
              }
              references.forEach((r) => _report(r));
              return this;
            } else {
            }
          } else {
            const part = new extHostTypes.ChatResponseReferencePart(value, iconPath, options);
            const dto = typeConvert.ChatResponseReferencePart.from(part);
            _report(dto);
          }
          return this;
        },
        codeCitation(value, license, snippet) {
          throwIfDone2(this.codeCitation);
          checkProposedApiEnabled(that._extension, "chatParticipantAdditions");
          const part = new extHostTypes.ChatResponseCodeCitationPart(value, license, snippet);
          const dto = typeConvert.ChatResponseCodeCitationPart.from(part);
          _report(dto);
        },
        textEdit(target, edits) {
          throwIfDone2(this.textEdit);
          checkProposedApiEnabled(that._extension, "chatParticipantAdditions");
          const part = new extHostTypes.ChatResponseTextEditPart(target, edits);
          part.isDone = edits === true ? true : void 0;
          const dto = typeConvert.ChatResponseTextEditPart.from(part);
          _report(dto);
          return this;
        },
        notebookEdit(target, edits) {
          throwIfDone2(this.notebookEdit);
          checkProposedApiEnabled(that._extension, "chatParticipantAdditions");
          const part = new extHostTypes.ChatResponseNotebookEditPart(target, edits);
          const dto = typeConvert.ChatResponseNotebookEditPart.from(part);
          _report(dto);
          return this;
        },
        confirmation(title, message, data, buttons) {
          throwIfDone2(this.confirmation);
          checkProposedApiEnabled(that._extension, "chatParticipantAdditions");
          const part = new extHostTypes.ChatResponseConfirmationPart(title, message, data, buttons);
          const dto = typeConvert.ChatResponseConfirmationPart.from(part);
          _report(dto);
          return this;
        },
        push(part) {
          throwIfDone2(this.push);
          if (part instanceof extHostTypes.ChatResponseTextEditPart || part instanceof extHostTypes.ChatResponseNotebookEditPart || part instanceof extHostTypes.ChatResponseMarkdownWithVulnerabilitiesPart || part instanceof extHostTypes.ChatResponseWarningPart || part instanceof extHostTypes.ChatResponseConfirmationPart || part instanceof extHostTypes.ChatResponseCodeCitationPart || part instanceof extHostTypes.ChatResponseMovePart || part instanceof extHostTypes.ChatResponseExtensionsPart || part instanceof extHostTypes.ChatResponseProgressPart2) {
            checkProposedApiEnabled(that._extension, "chatParticipantAdditions");
          }
          if (part instanceof extHostTypes.ChatResponseReferencePart) {
            this.reference2(part.value, part.iconPath, part.options);
          } else if (part instanceof extHostTypes.ChatResponseProgressPart2) {
            const dto = part.task ? typeConvert.ChatTask.from(part) : typeConvert.ChatResponseProgressPart.from(part);
            _report(dto, part.task);
          } else if (part instanceof extHostTypes.ChatResponseAnchorPart) {
            const dto = typeConvert.ChatResponseAnchorPart.from(part);
            if (part.resolve) {
              checkProposedApiEnabled(that._extension, "chatParticipantAdditions");
              dto.resolveId = generateUuid();
              const cts = new CancellationTokenSource();
              part.resolve(cts.token).then(() => {
                const resolvedDto = typeConvert.ChatResponseAnchorPart.from(part);
                that._proxy.$handleAnchorResolve(that._request.requestId, dto.resolveId, resolvedDto);
              }).then(() => cts.dispose(), () => cts.dispose());
              that._sessionDisposables.add(toDisposable(() => cts.dispose(true)));
            }
            _report(dto);
          } else {
            const dto = typeConvert.ChatResponsePart.from(part, that._commandsConverter, that._sessionDisposables);
            _report(dto);
          }
          return this;
        }
      });
    }
    return this._apiObject;
  }
}
class ExtHostChatAgents2 extends Disposable {
  static {
    __name(this, "ExtHostChatAgents2");
  }
  static {
    this._idPool = 0;
  }
  static {
    this._participantDetectionProviderIdPool = 0;
  }
  static {
    this._relatedFilesProviderIdPool = 0;
  }
  constructor(mainContext, _logService, _commands, _documents, _languageModels, _diagnostics, _tools) {
    super();
    this._logService = _logService;
    this._commands = _commands;
    this._documents = _documents;
    this._languageModels = _languageModels;
    this._diagnostics = _diagnostics;
    this._tools = _tools;
    this._agents = /* @__PURE__ */ new Map();
    this._participantDetectionProviders = /* @__PURE__ */ new Map();
    this._relatedFilesProviders = /* @__PURE__ */ new Map();
    this._sessionDisposables = this._register(new DisposableMap());
    this._completionDisposables = this._register(new DisposableMap());
    this._inFlightRequests = /* @__PURE__ */ new Set();
    this._onDidDisposeChatSession = this._register(new Emitter());
    this.onDidDisposeChatSession = this._onDidDisposeChatSession.event;
    this._proxy = mainContext.getProxy(MainContext.MainThreadChatAgents2);
    _commands.registerArgumentProcessor({
      processArgument: /* @__PURE__ */ __name((arg) => {
        if (isChatViewTitleActionContext(arg)) {
          return null;
        }
        return arg;
      }, "processArgument")
    });
  }
  transferActiveChat(newWorkspace) {
    this._proxy.$transferActiveChatSession(newWorkspace);
  }
  createChatAgent(extension, id, handler) {
    const handle = ExtHostChatAgents2._idPool++;
    const agent = new ExtHostChatAgent(extension, id, this._proxy, handle, handler);
    this._agents.set(handle, agent);
    this._proxy.$registerAgent(handle, extension.identifier, id, {}, void 0);
    return agent.apiAgent;
  }
  createDynamicChatAgent(extension, id, dynamicProps, handler) {
    const handle = ExtHostChatAgents2._idPool++;
    const agent = new ExtHostChatAgent(extension, id, this._proxy, handle, handler);
    this._agents.set(handle, agent);
    this._proxy.$registerAgent(handle, extension.identifier, id, { isSticky: true }, dynamicProps);
    return agent.apiAgent;
  }
  registerChatParticipantDetectionProvider(extension, provider) {
    const handle = ExtHostChatAgents2._participantDetectionProviderIdPool++;
    this._participantDetectionProviders.set(handle, new ExtHostParticipantDetector(extension, provider));
    this._proxy.$registerChatParticipantDetectionProvider(handle);
    return toDisposable(() => {
      this._participantDetectionProviders.delete(handle);
      this._proxy.$unregisterChatParticipantDetectionProvider(handle);
    });
  }
  registerRelatedFilesProvider(extension, provider, metadata) {
    const handle = ExtHostChatAgents2._relatedFilesProviderIdPool++;
    this._relatedFilesProviders.set(handle, new ExtHostRelatedFilesProvider(extension, provider));
    this._proxy.$registerRelatedFilesProvider(handle, metadata);
    return toDisposable(() => {
      this._relatedFilesProviders.delete(handle);
      this._proxy.$unregisterRelatedFilesProvider(handle);
    });
  }
  async $provideRelatedFiles(handle, request, token) {
    const provider = this._relatedFilesProviders.get(handle);
    if (!provider) {
      return Promise.resolve([]);
    }
    const extRequestDraft = typeConvert.ChatRequestDraft.to(request);
    return await provider.provider.provideRelatedFiles(extRequestDraft, token) ?? void 0;
  }
  async $detectChatParticipant(handle, requestDto, context, options, token) {
    const detector = this._participantDetectionProviders.get(handle);
    if (!detector) {
      return void 0;
    }
    const { request, location, history } = await this._createRequest(requestDto, context, detector.extension);
    const model = await this.getModelForRequest(request, detector.extension);
    const extRequest = typeConvert.ChatAgentRequest.to(request, location, model, this.getDiagnosticsWhenEnabled(detector.extension), this.getToolsForRequest(detector.extension, request), this.getTools2ForRequest(detector.extension, request), detector.extension);
    return detector.provider.provideParticipantDetection(extRequest, { history }, { participants: options.participants, location: typeConvert.ChatLocation.to(options.location) }, token);
  }
  async _createRequest(requestDto, context, extension) {
    const request = revive(requestDto);
    const convertedHistory = await this.prepareHistoryTurns(extension, request.agentId, context);
    let location;
    if (request.locationData?.type === ChatAgentLocation.Editor) {
      const document = this._documents.getDocument(request.locationData.document);
      location = new extHostTypes.ChatRequestEditorData(document, typeConvert.Selection.to(request.locationData.selection), typeConvert.Range.to(request.locationData.wholeRange));
    } else if (request.locationData?.type === ChatAgentLocation.Notebook) {
      const cell = this._documents.getDocument(request.locationData.sessionInputUri);
      location = new extHostTypes.ChatRequestNotebookData(cell);
    } else if (request.locationData?.type === ChatAgentLocation.Terminal) {
    }
    return { request, location, history: convertedHistory };
  }
  async getModelForRequest(request, extension) {
    let model;
    if (request.userSelectedModelId) {
      model = await this._languageModels.getLanguageModelByIdentifier(extension, request.userSelectedModelId);
    }
    if (!model) {
      model = await this._languageModels.getDefaultLanguageModel(extension);
      if (!model) {
        throw new Error("Language model unavailable");
      }
    }
    return model;
  }
  async $setRequestPaused(handle, requestId, isPaused) {
    const agent = this._agents.get(handle);
    if (!agent) {
      return;
    }
    const inFlight = Iterable.find(this._inFlightRequests, (r) => r.requestId === requestId);
    if (!inFlight) {
      return;
    }
    agent.setChatRequestPauseState({ request: inFlight.extRequest, isPaused });
  }
  async $invokeAgent(handle, requestDto, context, token) {
    const agent = this._agents.get(handle);
    if (!agent) {
      throw new Error(`[CHAT](${handle}) CANNOT invoke agent because the agent is not registered`);
    }
    let stream;
    let inFlightRequest;
    try {
      const { request, location, history } = await this._createRequest(requestDto, context, agent.extension);
      let sessionDisposables = this._sessionDisposables.get(request.sessionId);
      if (!sessionDisposables) {
        sessionDisposables = new DisposableStore();
        this._sessionDisposables.set(request.sessionId, sessionDisposables);
      }
      stream = new ChatAgentResponseStream(agent.extension, request, this._proxy, this._commands.converter, sessionDisposables);
      const model = await this.getModelForRequest(request, agent.extension);
      const extRequest = typeConvert.ChatAgentRequest.to(request, location, model, this.getDiagnosticsWhenEnabled(agent.extension), this.getToolsForRequest(agent.extension, request), this.getTools2ForRequest(agent.extension, request), agent.extension);
      inFlightRequest = { requestId: requestDto.requestId, extRequest };
      this._inFlightRequests.add(inFlightRequest);
      const task = agent.invoke(extRequest, { history }, stream.apiObject, token);
      return await raceCancellation(Promise.resolve(task).then((result) => {
        if (result?.metadata) {
          try {
            JSON.stringify(result.metadata);
          } catch (err) {
            const msg = `result.metadata MUST be JSON.stringify-able. Got error: ${err.message}`;
            this._logService.error(`[${agent.extension.identifier.value}] [@${agent.id}] ${msg}`, agent.extension);
            return { errorDetails: { message: msg }, timings: stream?.timings, nextQuestion: result.nextQuestion };
          }
        }
        let errorDetails;
        if (result?.errorDetails) {
          errorDetails = {
            ...result.errorDetails,
            responseIsIncomplete: true
          };
        }
        if (errorDetails?.responseIsRedacted || errorDetails?.isQuotaExceeded) {
          checkProposedApiEnabled(agent.extension, "chatParticipantPrivate");
        }
        return { errorDetails, timings: stream?.timings, metadata: result?.metadata, nextQuestion: result?.nextQuestion };
      }), token);
    } catch (e) {
      this._logService.error(e, agent.extension);
      if (e instanceof extHostTypes.LanguageModelError && e.cause) {
        e = e.cause;
      }
      const isQuotaExceeded = e instanceof Error && e.name === "ChatQuotaExceeded";
      return { errorDetails: { message: toErrorMessage(e), responseIsIncomplete: true, isQuotaExceeded } };
    } finally {
      if (inFlightRequest) {
        this._inFlightRequests.delete(inFlightRequest);
      }
      stream?.close();
    }
  }
  getDiagnosticsWhenEnabled(extension) {
    if (!isProposedApiEnabled(extension, "chatReferenceDiagnostic")) {
      return [];
    }
    return this._diagnostics.getDiagnostics();
  }
  getTools2ForRequest(extension, request) {
    if (!request.userSelectedTools2) {
      return /* @__PURE__ */ new Map();
    }
    const result = /* @__PURE__ */ new Map();
    for (const tool of this._tools.getTools(extension)) {
      if (typeof request.userSelectedTools2[tool.name] === "boolean") {
        result.set(tool.name, request.userSelectedTools2[tool.name]);
      }
    }
    return result;
  }
  getToolsForRequest(extension, request) {
    if (!isNonEmptyArray(request.userSelectedTools)) {
      return void 0;
    }
    const selector = new Set(request.userSelectedTools);
    const tools = this._tools.getTools(extension).filter((candidate) => selector.has(candidate.name));
    return {
      tools,
      isExclusive: request.toolSelectionIsExclusive
    };
  }
  async prepareHistoryTurns(extension, agentId, context) {
    const res = [];
    for (const h of context.history) {
      const ehResult = typeConvert.ChatAgentResult.to(h.result);
      const result = agentId === h.request.agentId ? ehResult : { ...ehResult, metadata: void 0 };
      const varsWithoutTools = h.request.variables.variables.filter((v) => v.kind !== "tool").map((v) => typeConvert.ChatPromptReference.to(v, this.getDiagnosticsWhenEnabled(extension)));
      const toolReferences = h.request.variables.variables.filter((v) => v.kind === "tool").map(typeConvert.ChatLanguageModelToolReference.to);
      const editedFileEvents = isProposedApiEnabled(extension, "chatParticipantPrivate") ? h.request.editedFileEvents : void 0;
      const turn = new extHostTypes.ChatRequestTurn(h.request.message, h.request.command, varsWithoutTools, h.request.agentId, toolReferences, editedFileEvents);
      res.push(turn);
      const parts = coalesce(h.response.map((r) => typeConvert.ChatResponsePart.toContent(r, this._commands.converter)));
      res.push(new extHostTypes.ChatResponseTurn(parts, result, h.request.agentId, h.request.command));
    }
    return res;
  }
  $releaseSession(sessionId) {
    this._sessionDisposables.deleteAndDispose(sessionId);
    this._onDidDisposeChatSession.fire(sessionId);
  }
  async $provideFollowups(requestDto, handle, result, context, token) {
    const agent = this._agents.get(handle);
    if (!agent) {
      return Promise.resolve([]);
    }
    const request = revive(requestDto);
    const convertedHistory = await this.prepareHistoryTurns(agent.extension, agent.id, context);
    const ehResult = typeConvert.ChatAgentResult.to(result);
    return (await agent.provideFollowups(ehResult, { history: convertedHistory }, token)).filter((f) => {
      const isValid = !f.participant || Iterable.some(this._agents.values(), (a) => a.id === f.participant && ExtensionIdentifier.equals(a.extension.identifier, agent.extension.identifier));
      if (!isValid) {
        this._logService.warn(`[@${agent.id}] ChatFollowup refers to an unknown participant: ${f.participant}`);
      }
      return isValid;
    }).map((f) => typeConvert.ChatFollowup.from(f, request));
  }
  $acceptFeedback(handle, result, voteAction) {
    const agent = this._agents.get(handle);
    if (!agent) {
      return;
    }
    const ehResult = typeConvert.ChatAgentResult.to(result);
    let kind;
    switch (voteAction.direction) {
      case ChatAgentVoteDirection.Down:
        kind = extHostTypes.ChatResultFeedbackKind.Unhelpful;
        break;
      case ChatAgentVoteDirection.Up:
        kind = extHostTypes.ChatResultFeedbackKind.Helpful;
        break;
    }
    const feedback = {
      result: ehResult,
      kind,
      unhelpfulReason: isProposedApiEnabled(agent.extension, "chatParticipantAdditions") ? voteAction.reason : void 0
    };
    agent.acceptFeedback(Object.freeze(feedback));
  }
  $acceptAction(handle, result, event) {
    const agent = this._agents.get(handle);
    if (!agent) {
      return;
    }
    if (event.action.kind === "vote") {
      return;
    }
    const ehAction = typeConvert.ChatAgentUserActionEvent.to(result, event, this._commands.converter);
    if (ehAction) {
      agent.acceptAction(Object.freeze(ehAction));
    }
  }
  async $invokeCompletionProvider(handle, query, token) {
    const agent = this._agents.get(handle);
    if (!agent) {
      return [];
    }
    let disposables = this._completionDisposables.get(handle);
    if (disposables) {
      disposables.clear();
    } else {
      disposables = new DisposableStore();
      this._completionDisposables.set(handle, disposables);
    }
    const items = await agent.invokeCompletionProvider(query, token);
    return items.map((i) => typeConvert.ChatAgentCompletionItem.from(i, this._commands.converter, disposables));
  }
  async $provideChatTitle(handle, context, token) {
    const agent = this._agents.get(handle);
    if (!agent) {
      return;
    }
    const history = await this.prepareHistoryTurns(agent.extension, agent.id, { history: context });
    return await agent.provideTitle({ history }, token);
  }
  async $provideSampleQuestions(handle, location, token) {
    const agent = this._agents.get(handle);
    if (!agent) {
      return;
    }
    return (await agent.provideSampleQuestions(typeConvert.ChatLocation.to(location), token)).map((f) => typeConvert.ChatFollowup.from(f, void 0));
  }
}
class ExtHostParticipantDetector {
  static {
    __name(this, "ExtHostParticipantDetector");
  }
  constructor(extension, provider) {
    this.extension = extension;
    this.provider = provider;
  }
}
class ExtHostRelatedFilesProvider {
  static {
    __name(this, "ExtHostRelatedFilesProvider");
  }
  constructor(extension, provider) {
    this.extension = extension;
    this.provider = provider;
  }
}
class ExtHostChatAgent {
  static {
    __name(this, "ExtHostChatAgent");
  }
  constructor(extension, id, _proxy, _handle, _requestHandler) {
    this.extension = extension;
    this.id = id;
    this._proxy = _proxy;
    this._handle = _handle;
    this._requestHandler = _requestHandler;
    this._onDidReceiveFeedback = new Emitter();
    this._onDidPerformAction = new Emitter();
    this._pauseStateEmitter = new Emitter();
  }
  acceptFeedback(feedback) {
    this._onDidReceiveFeedback.fire(feedback);
  }
  acceptAction(event) {
    this._onDidPerformAction.fire(event);
  }
  setChatRequestPauseState(pauseState) {
    this._pauseStateEmitter.fire(pauseState);
  }
  async invokeCompletionProvider(query, token) {
    if (!this._agentVariableProvider) {
      return [];
    }
    return await this._agentVariableProvider.provider.provideCompletionItems(query, token) ?? [];
  }
  async provideFollowups(result, context, token) {
    if (!this._followupProvider) {
      return [];
    }
    const followups = await this._followupProvider.provideFollowups(result, context, token);
    if (!followups) {
      return [];
    }
    return followups.filter((f) => !(f && "commandId" in f)).filter((f) => !(f && "message" in f));
  }
  async provideTitle(context, token) {
    if (!this._titleProvider) {
      return;
    }
    return await this._titleProvider.provideChatTitle(context, token) ?? void 0;
  }
  async provideSampleQuestions(location, token) {
    if (!this._welcomeMessageProvider || !this._welcomeMessageProvider.provideSampleQuestions) {
      return [];
    }
    const content = await this._welcomeMessageProvider.provideSampleQuestions(location, token);
    if (!content) {
      return [];
    }
    return content;
  }
  get apiAgent() {
    let disposed = false;
    let updateScheduled = false;
    const updateMetadataSoon = /* @__PURE__ */ __name(() => {
      if (disposed) {
        return;
      }
      if (updateScheduled) {
        return;
      }
      updateScheduled = true;
      queueMicrotask(() => {
        this._proxy.$updateAgent(this._handle, {
          icon: !this._iconPath ? void 0 : this._iconPath instanceof URI ? this._iconPath : "light" in this._iconPath ? this._iconPath.light : void 0,
          iconDark: !this._iconPath ? void 0 : "dark" in this._iconPath ? this._iconPath.dark : void 0,
          themeIcon: this._iconPath instanceof extHostTypes.ThemeIcon ? this._iconPath : void 0,
          hasFollowups: this._followupProvider !== void 0,
          helpTextPrefix: !this._helpTextPrefix || typeof this._helpTextPrefix === "string" ? this._helpTextPrefix : typeConvert.MarkdownString.from(this._helpTextPrefix),
          helpTextVariablesPrefix: !this._helpTextVariablesPrefix || typeof this._helpTextVariablesPrefix === "string" ? this._helpTextVariablesPrefix : typeConvert.MarkdownString.from(this._helpTextVariablesPrefix),
          helpTextPostfix: !this._helpTextPostfix || typeof this._helpTextPostfix === "string" ? this._helpTextPostfix : typeConvert.MarkdownString.from(this._helpTextPostfix),
          supportIssueReporting: this._supportIssueReporting,
          requester: this._requester,
          additionalWelcomeMessage: !this._additionalWelcomeMessage || typeof this._additionalWelcomeMessage === "string" ? this._additionalWelcomeMessage : typeConvert.MarkdownString.from(this._additionalWelcomeMessage)
        });
        updateScheduled = false;
      });
    }, "updateMetadataSoon");
    const that = this;
    return {
      get id() {
        return that.id;
      },
      get iconPath() {
        return that._iconPath;
      },
      set iconPath(v) {
        that._iconPath = v;
        updateMetadataSoon();
      },
      get requestHandler() {
        return that._requestHandler;
      },
      set requestHandler(v) {
        assertType(typeof v === "function", "Invalid request handler");
        that._requestHandler = v;
      },
      get followupProvider() {
        return that._followupProvider;
      },
      set followupProvider(v) {
        that._followupProvider = v;
        updateMetadataSoon();
      },
      get helpTextPrefix() {
        checkProposedApiEnabled(that.extension, "defaultChatParticipant");
        return that._helpTextPrefix;
      },
      set helpTextPrefix(v) {
        checkProposedApiEnabled(that.extension, "defaultChatParticipant");
        that._helpTextPrefix = v;
        updateMetadataSoon();
      },
      get helpTextVariablesPrefix() {
        checkProposedApiEnabled(that.extension, "defaultChatParticipant");
        return that._helpTextVariablesPrefix;
      },
      set helpTextVariablesPrefix(v) {
        checkProposedApiEnabled(that.extension, "defaultChatParticipant");
        that._helpTextVariablesPrefix = v;
        updateMetadataSoon();
      },
      get helpTextPostfix() {
        checkProposedApiEnabled(that.extension, "defaultChatParticipant");
        return that._helpTextPostfix;
      },
      set helpTextPostfix(v) {
        checkProposedApiEnabled(that.extension, "defaultChatParticipant");
        that._helpTextPostfix = v;
        updateMetadataSoon();
      },
      get supportIssueReporting() {
        checkProposedApiEnabled(that.extension, "chatParticipantPrivate");
        return that._supportIssueReporting;
      },
      set supportIssueReporting(v) {
        checkProposedApiEnabled(that.extension, "chatParticipantPrivate");
        that._supportIssueReporting = v;
        updateMetadataSoon();
      },
      get onDidReceiveFeedback() {
        return that._onDidReceiveFeedback.event;
      },
      set participantVariableProvider(v) {
        checkProposedApiEnabled(that.extension, "chatParticipantAdditions");
        that._agentVariableProvider = v;
        if (v) {
          if (!v.triggerCharacters.length) {
            throw new Error("triggerCharacters are required");
          }
          that._proxy.$registerAgentCompletionsProvider(that._handle, that.id, v.triggerCharacters);
        } else {
          that._proxy.$unregisterAgentCompletionsProvider(that._handle, that.id);
        }
      },
      get participantVariableProvider() {
        checkProposedApiEnabled(that.extension, "chatParticipantAdditions");
        return that._agentVariableProvider;
      },
      set welcomeMessageProvider(v) {
        checkProposedApiEnabled(that.extension, "defaultChatParticipant");
        that._welcomeMessageProvider = v;
        updateMetadataSoon();
      },
      get welcomeMessageProvider() {
        checkProposedApiEnabled(that.extension, "defaultChatParticipant");
        return that._welcomeMessageProvider;
      },
      set additionalWelcomeMessage(v) {
        checkProposedApiEnabled(that.extension, "defaultChatParticipant");
        that._additionalWelcomeMessage = v;
        updateMetadataSoon();
      },
      get additionalWelcomeMessage() {
        checkProposedApiEnabled(that.extension, "defaultChatParticipant");
        return that._additionalWelcomeMessage;
      },
      set titleProvider(v) {
        checkProposedApiEnabled(that.extension, "defaultChatParticipant");
        that._titleProvider = v;
        updateMetadataSoon();
      },
      get titleProvider() {
        checkProposedApiEnabled(that.extension, "defaultChatParticipant");
        return that._titleProvider;
      },
      get onDidChangePauseState() {
        checkProposedApiEnabled(that.extension, "chatParticipantAdditions");
        return that._pauseStateEmitter.event;
      },
      onDidPerformAction: !isProposedApiEnabled(this.extension, "chatParticipantAdditions") ? void 0 : this._onDidPerformAction.event,
      set requester(v) {
        that._requester = v;
        updateMetadataSoon();
      },
      get requester() {
        return that._requester;
      },
      dispose() {
        disposed = true;
        that._followupProvider = void 0;
        that._onDidReceiveFeedback.dispose();
        that._proxy.$unregisterAgent(that._handle);
      }
    };
  }
  invoke(request, context, response, token) {
    return this._requestHandler(request, context, response, token);
  }
}
export {
  ExtHostChatAgents2
};
//# sourceMappingURL=extHostChatAgents2.js.map
