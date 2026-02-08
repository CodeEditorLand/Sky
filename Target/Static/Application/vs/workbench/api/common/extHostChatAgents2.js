var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { coalesce } from "../../../base/common/arrays.js";
import { DeferredPromise, raceCancellation, timeout } from "../../../base/common/async.js";
import { CancellationToken, CancellationTokenSource } from "../../../base/common/cancellation.js";
import { toErrorMessage } from "../../../base/common/errorMessage.js";
import { Emitter } from "../../../base/common/event.js";
import { Iterable } from "../../../base/common/iterator.js";
import { Disposable, DisposableMap, DisposableResourceMap, DisposableStore, toDisposable } from "../../../base/common/lifecycle.js";
import { revive } from "../../../base/common/marshalling.js";
import { StopWatch } from "../../../base/common/stopwatch.js";
import { assertType } from "../../../base/common/types.js";
import { URI } from "../../../base/common/uri.js";
import { generateUuid } from "../../../base/common/uuid.js";
import { ExtensionIdentifier } from "../../../platform/extensions/common/extensions.js";
import { isChatViewTitleActionContext } from "../../contrib/chat/common/actions/chatActions.js";
import { ChatAgentVoteDirection } from "../../contrib/chat/common/chatService/chatService.js";
import { LocalChatSessionUri } from "../../contrib/chat/common/model/chatUri.js";
import { ChatAgentLocation } from "../../contrib/chat/common/constants.js";
import { checkProposedApiEnabled, isProposedApiEnabled } from "../../services/extensions/common/extensions.js";
import { MainContext } from "./extHost.protocol.js";
import * as typeConvert from "./extHostTypeConverters.js";
import * as extHostTypes from "./extHostTypes.js";
import { PromptsType } from "../../contrib/chat/common/promptSyntax/promptTypes.js";
class ChatAgentResponseStream {
  static {
    __name(this, "ChatAgentResponseStream");
  }
  constructor(_extension, _request, _proxy, _commandsConverter, _sessionDisposables, _pendingCarouselResolvers, _token) {
    this._extension = _extension;
    this._request = _request;
    this._proxy = _proxy;
    this._commandsConverter = _commandsConverter;
    this._sessionDisposables = _sessionDisposables;
    this._pendingCarouselResolvers = _pendingCarouselResolvers;
    this._token = _token;
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
      }, send2 = function(chunk, handle) {
        const newLen = sendQueue.push(handle !== void 0 ? [chunk, handle] : chunk);
        if (newLen === 1) {
          queueMicrotask(() => {
            const toNotify = notify;
            notify = [];
            that._proxy.$handleProgressChunk(that._request.requestId, sendQueue).finally(() => {
              toNotify.forEach((f) => f());
            });
            sendQueue.length = 0;
          });
        }
        if (handle !== void 0) {
          return new Promise((resolve) => {
            notify.push(resolve);
          });
        }
        return;
      };
      var throwIfDone = throwIfDone2, send = send2;
      __name(throwIfDone2, "throwIfDone");
      __name(send2, "send");
      const that = this;
      this._stopWatch.reset();
      let taskHandlePool = 0;
      const sendQueue = [];
      let notify = [];
      const _report = /* @__PURE__ */ __name((progress, task) => {
        if (typeof this._firstProgress === "undefined" && (progress.kind === "markdownContent" || progress.kind === "markdownVuln" || progress.kind === "beginToolInvocation")) {
          this._firstProgress = this._stopWatch.elapsed();
        }
        if (task) {
          const myHandle = taskHandlePool++;
          const progressReporterPromise = send2(progress, myHandle);
          const progressReporter = {
            report: /* @__PURE__ */ __name((p) => {
              progressReporterPromise.then(() => {
                if (extHostTypes.MarkdownString.isMarkdownString(p.value)) {
                  send2(typeConvert.ChatResponseWarningPart.from(p), myHandle);
                } else {
                  send2(typeConvert.ChatResponseReferencePart.from(p), myHandle);
                }
              });
            }, "report")
          };
          Promise.all([progressReporterPromise, task(progressReporter)]).then(([_void, res]) => {
            send2(typeConvert.ChatTaskResult.from(res), myHandle);
          });
        } else {
          send2(progress);
        }
      }, "_report");
      this._apiObject = Object.freeze({
        clearToPreviousToolInvocation(reason) {
          throwIfDone2(this.markdown);
          send2({ kind: "clearToPreviousToolInvocation", reason });
          return this;
        },
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
        thinkingProgress(thinkingDelta) {
          throwIfDone2(this.thinkingProgress);
          checkProposedApiEnabled(that._extension, "chatParticipantAdditions");
          const part = new extHostTypes.ChatResponseThinkingProgressPart(thinkingDelta.text ?? "", thinkingDelta.id, thinkingDelta.metadata);
          const dto = typeConvert.ChatResponseThinkingProgressPart.from(part);
          _report(dto);
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
        workspaceEdit(edits) {
          throwIfDone2(this.workspaceEdit);
          checkProposedApiEnabled(that._extension, "chatParticipantAdditions");
          const part = new extHostTypes.ChatResponseWorkspaceEditPart(edits);
          const dto = typeConvert.ChatResponseWorkspaceEditPart.from(part);
          _report(dto);
          return this;
        },
        async externalEdit(target, callback) {
          throwIfDone2(this.externalEdit);
          const resources = Array.isArray(target) ? target : [target];
          const operationId = taskHandlePool++;
          const undoStopId = generateUuid();
          await send2({ kind: "externalEdits", start: true, resources, undoStopId }, operationId);
          try {
            await callback();
            return undoStopId;
          } finally {
            await send2({ kind: "externalEdits", start: false, resources, undoStopId }, operationId);
          }
        },
        confirmation(title, message, data, buttons) {
          throwIfDone2(this.confirmation);
          checkProposedApiEnabled(that._extension, "chatParticipantAdditions");
          const part = new extHostTypes.ChatResponseConfirmationPart(title, message, data, buttons);
          const dto = typeConvert.ChatResponseConfirmationPart.from(part);
          _report(dto);
          return this;
        },
        async questionCarousel(questions, allowSkip = true) {
          throwIfDone2(this.questionCarousel);
          checkProposedApiEnabled(that._extension, "chatParticipantAdditions");
          const resolveId = generateUuid();
          const part = new extHostTypes.ChatResponseQuestionCarouselPart(questions, allowSkip);
          const dto = typeConvert.ChatResponseQuestionCarouselPart.from(part);
          dto.resolveId = resolveId;
          const deferred = new DeferredPromise();
          if (!that._pendingCarouselResolvers.has(that._request.requestId)) {
            that._pendingCarouselResolvers.set(that._request.requestId, /* @__PURE__ */ new Map());
          }
          that._pendingCarouselResolvers.get(that._request.requestId).set(resolveId, deferred);
          _report(dto);
          return raceCancellation(deferred.p, that._token);
        },
        beginToolInvocation(toolCallId, toolName, streamData) {
          throwIfDone2(this.beginToolInvocation);
          checkProposedApiEnabled(that._extension, "chatParticipantAdditions");
          const dto = {
            kind: "beginToolInvocation",
            toolCallId,
            toolName,
            streamData: streamData ? {
              partialInput: streamData.partialInput
            } : void 0,
            subagentInvocationId: streamData?.subagentInvocationId
          };
          _report(dto);
          return this;
        },
        updateToolInvocation(toolCallId, streamData) {
          throwIfDone2(this.updateToolInvocation);
          checkProposedApiEnabled(that._extension, "chatParticipantAdditions");
          const dto = {
            kind: "updateToolInvocation",
            toolCallId,
            streamData: {
              partialInput: streamData.partialInput
            }
          };
          _report(dto);
          return this;
        },
        push(part) {
          throwIfDone2(this.push);
          if (part instanceof extHostTypes.ChatResponseTextEditPart || part instanceof extHostTypes.ChatResponseNotebookEditPart || part instanceof extHostTypes.ChatResponseMarkdownWithVulnerabilitiesPart || part instanceof extHostTypes.ChatResponseWarningPart || part instanceof extHostTypes.ChatResponseConfirmationPart || part instanceof extHostTypes.ChatResponseQuestionCarouselPart || part instanceof extHostTypes.ChatResponseCodeCitationPart || part instanceof extHostTypes.ChatResponseMovePart || part instanceof extHostTypes.ChatResponseExtensionsPart || part instanceof extHostTypes.ChatResponseExternalEditPart || part instanceof extHostTypes.ChatResponseThinkingProgressPart || part instanceof extHostTypes.ChatResponsePullRequestPart || part instanceof extHostTypes.ChatResponseProgressPart2) {
            checkProposedApiEnabled(that._extension, "chatParticipantAdditions");
          }
          if (part instanceof extHostTypes.ChatResponseReferencePart) {
            this.reference2(part.value, part.iconPath, part.options);
          } else if (part instanceof extHostTypes.ChatResponseProgressPart2) {
            const dto = part.task ? typeConvert.ChatTask.from(part) : typeConvert.ChatResponseProgressPart.from(part);
            _report(dto, part.task);
          } else if (part instanceof extHostTypes.ChatResponseThinkingProgressPart) {
            const dto = typeConvert.ChatResponseThinkingProgressPart.from(part);
            _report(dto);
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
          } else if (part instanceof extHostTypes.ChatResponseExternalEditPart) {
            const p = this.externalEdit(part.uris, part.callback);
            p.then((value) => part.didGetApplied(value));
            return this;
          } else {
            const dto = typeConvert.ChatResponsePart.from(part, that._commandsConverter, that._sessionDisposables);
            _report(dto);
          }
          return this;
        },
        usage(usage) {
          throwIfDone2(this.usage);
          checkProposedApiEnabled(that._extension, "chatParticipantAdditions");
          const dto = {
            kind: "usage",
            promptTokens: usage.promptTokens,
            completionTokens: usage.completionTokens,
            promptTokenDetails: usage.promptTokenDetails
          };
          _report(dto);
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
    this._contributionsProviderIdPool = 0;
  }
  constructor(mainContext, _logService, _commands, _documents, _editorsAndDocuments, _languageModels, _diagnostics, _tools) {
    super();
    this._logService = _logService;
    this._commands = _commands;
    this._documents = _documents;
    this._editorsAndDocuments = _editorsAndDocuments;
    this._languageModels = _languageModels;
    this._diagnostics = _diagnostics;
    this._tools = _tools;
    this._agents = /* @__PURE__ */ new Map();
    this._participantDetectionProviders = /* @__PURE__ */ new Map();
    this._promptFileProviders = /* @__PURE__ */ new Map();
    this._sessionDisposables = this._register(new DisposableResourceMap());
    this._completionDisposables = this._register(new DisposableMap());
    this._inFlightRequests = /* @__PURE__ */ new Set();
    this._pendingCarouselResolvers = /* @__PURE__ */ new Map();
    this._onDidChangeChatRequestTools = this._register(new Emitter());
    this.onDidChangeChatRequestTools = this._onDidChangeChatRequestTools.event;
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
  async transferActiveChat(newWorkspace) {
    await this._proxy.$transferActiveChatSession(newWorkspace);
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
  /**
   * Internal method that handles all prompt file provider types.
   * Routes custom agents, instructions, prompt files, and skills to the unified internal implementation.
   */
  registerPromptFileProvider(extension, type, provider) {
    const handle = ExtHostChatAgents2._contributionsProviderIdPool++;
    this._promptFileProviders.set(handle, { extension, provider });
    this._proxy.$registerPromptFileProvider(handle, type, extension.identifier);
    const disposables = new DisposableStore();
    let changeEvent;
    switch (type) {
      case PromptsType.agent:
        changeEvent = provider.onDidChangeCustomAgents;
        break;
      case PromptsType.instructions:
        changeEvent = provider.onDidChangeInstructions;
        break;
      case PromptsType.prompt:
        changeEvent = provider.onDidChangePromptFiles;
        break;
      case PromptsType.skill:
        changeEvent = provider.onDidChangeSkills;
        break;
    }
    if (changeEvent) {
      disposables.add(changeEvent(() => {
        this._proxy.$onDidChangePromptFiles(handle);
      }));
    }
    disposables.add(toDisposable(() => {
      this._promptFileProviders.delete(handle);
      this._proxy.$unregisterPromptFileProvider(handle);
    }));
    return disposables;
  }
  async $providePromptFiles(handle, type, context, token) {
    const providerData = this._promptFileProviders.get(handle);
    if (!providerData) {
      return void 0;
    }
    const provider = providerData.provider;
    let resources;
    switch (type) {
      case PromptsType.agent:
        resources = await provider.provideCustomAgents(context, token) ?? void 0;
        break;
      case PromptsType.instructions:
        resources = await provider.provideInstructions(context, token) ?? void 0;
        break;
      case PromptsType.prompt:
        resources = await provider.providePromptFiles(context, token) ?? void 0;
        break;
      case PromptsType.skill:
        resources = await provider.provideSkills(context, token) ?? void 0;
        break;
    }
    return resources;
  }
  async $detectChatParticipant(handle, requestDto, context, options, token) {
    const detector = this._participantDetectionProviders.get(handle);
    if (!detector) {
      return void 0;
    }
    const { request, location, history } = await this._createRequest(requestDto, context, detector.extension);
    const model = await this.getModelForRequest(request, detector.extension);
    const tools = await this.getToolsForRequest(detector.extension, request.userSelectedTools, model.id, token);
    const extRequest = typeConvert.ChatAgentRequest.to(request, location, model, this.getDiagnosticsWhenEnabled(detector.extension), tools, detector.extension, this._logService);
    return detector.provider.provideParticipantDetection(extRequest, { history, yieldRequested: false }, { participants: options.participants, location: typeConvert.ChatLocation.to(options.location) }, token);
  }
  async _createRequest(requestDto, context, extension) {
    const request = revive(requestDto);
    const convertedHistory = await this.prepareHistoryTurns(extension, request.agentId, context);
    let location;
    if (request.locationData?.type === ChatAgentLocation.EditorInline) {
      const document = this._documents.getDocument(request.locationData.document);
      const editor = this._editorsAndDocuments.getEditor(request.locationData.id);
      location = new extHostTypes.ChatRequestEditorData(editor.value, document, typeConvert.Selection.to(request.locationData.selection), typeConvert.Range.to(request.locationData.wholeRange));
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
  async $setRequestTools(requestId, tools) {
    const request = [...this._inFlightRequests].find((r) => r.requestId === requestId);
    if (!request) {
      return;
    }
    request.extRequest.tools.clear();
    const toolsMap = await this.getToolsForRequest(request.extension, tools, request.extRequest.model.id, CancellationToken.None);
    for (const [k, v] of toolsMap) {
      request.extRequest.tools.set(k, v);
    }
    this._onDidChangeChatRequestTools.fire(request.extRequest);
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
      let sessionDisposables = this._sessionDisposables.get(request.sessionResource);
      if (!sessionDisposables) {
        sessionDisposables = new DisposableStore();
        this._sessionDisposables.set(request.sessionResource, sessionDisposables);
      }
      stream = new ChatAgentResponseStream(agent.extension, request, this._proxy, this._commands.converter, sessionDisposables, this._pendingCarouselResolvers, token);
      const model = await this.getModelForRequest(request, agent.extension);
      const tools = await this.getToolsForRequest(agent.extension, request.userSelectedTools, model.id, token);
      const extRequest = typeConvert.ChatAgentRequest.to(request, location, model, this.getDiagnosticsWhenEnabled(agent.extension), tools, agent.extension, this._logService);
      inFlightRequest = { requestId: requestDto.requestId, extRequest, extension: agent.extension, hooks: request.hooks };
      this._inFlightRequests.add(inFlightRequest);
      let chatSessionContext;
      if (context.chatSessionContext) {
        chatSessionContext = {
          chatSessionItem: {
            resource: URI.revive(context.chatSessionContext.chatSessionResource),
            label: context.chatSessionContext.isUntitled ? "Untitled Session" : "Session"
          },
          isUntitled: context.chatSessionContext.isUntitled
        };
      }
      const chatContext = { history, chatSessionContext, yieldRequested: request.yieldRequested ?? false };
      const task = agent.invoke(extRequest, chatContext, stream.apiObject, token);
      return await raceCancellationWithTimeout(1e3, Promise.resolve(task).then((result) => {
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
        if (errorDetails?.responseIsRedacted || errorDetails?.isQuotaExceeded || errorDetails?.isRateLimited || errorDetails?.confirmationButtons || errorDetails?.code) {
          checkProposedApiEnabled(agent.extension, "chatParticipantPrivate");
        }
        return { errorDetails, timings: stream?.timings, metadata: result?.metadata, nextQuestion: result?.nextQuestion, details: result?.details };
      }), token);
    } catch (e) {
      this._logService.error(e, agent.extension);
      if (e instanceof extHostTypes.LanguageModelError && e.cause) {
        e = e.cause;
      }
      const isQuotaExceeded = e instanceof Error && e.name === "ChatQuotaExceeded";
      const isRateLimited = e instanceof Error && e.name === "ChatRateLimited";
      return { errorDetails: { message: toErrorMessage(e), responseIsIncomplete: true, isQuotaExceeded, isRateLimited } };
    } finally {
      if (inFlightRequest) {
        this._inFlightRequests.delete(inFlightRequest);
      }
      const pendingResolvers = this._pendingCarouselResolvers.get(requestDto.requestId);
      if (pendingResolvers) {
        for (const deferred of pendingResolvers.values()) {
          deferred.complete(void 0);
        }
        this._pendingCarouselResolvers.delete(requestDto.requestId);
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
  async getToolsForRequest(extension, tools, modelId, token) {
    if (!tools) {
      return /* @__PURE__ */ new Map();
    }
    const result = /* @__PURE__ */ new Map();
    for (const tool of this._tools.getTools(extension)) {
      if (typeof tools[tool.name] === "boolean") {
        result.set(tool, tools[tool.name]);
      }
    }
    return result;
  }
  async prepareHistoryTurns(extension, agentId, context) {
    const res = [];
    for (const h of context.history) {
      const ehResult = typeConvert.ChatAgentResult.to(h.result);
      const result = agentId === h.request.agentId || isBuiltinParticipant(h.request.agentId) && isBuiltinParticipant(agentId) ? ehResult : { ...ehResult, metadata: void 0 };
      const varsWithoutTools = [];
      const toolReferences = [];
      for (const v of h.request.variables.variables) {
        if (v.kind === "tool") {
          toolReferences.push(typeConvert.ChatLanguageModelToolReference.to(v));
        } else if (v.kind === "toolset") {
          toolReferences.push(...v.value.map(typeConvert.ChatLanguageModelToolReference.to));
        } else {
          const ref = typeConvert.ChatPromptReference.to(v, this.getDiagnosticsWhenEnabled(extension), this._logService);
          if (ref) {
            varsWithoutTools.push(ref);
          }
        }
      }
      const editedFileEvents = isProposedApiEnabled(extension, "chatParticipantPrivate") ? h.request.editedFileEvents : void 0;
      const turn = new extHostTypes.ChatRequestTurn(h.request.message, h.request.command, varsWithoutTools, h.request.agentId, toolReferences, editedFileEvents, h.request.requestId);
      res.push(turn);
      const parts = coalesce(h.response.map((r) => typeConvert.ChatResponsePart.toContent(r, this._commands.converter)));
      res.push(new extHostTypes.ChatResponseTurn(parts, result, h.request.agentId, h.request.command));
    }
    return res;
  }
  $releaseSession(sessionResourceDto) {
    const sessionResource = URI.revive(sessionResourceDto);
    this._sessionDisposables.deleteAndDispose(sessionResource);
    const sessionId = LocalChatSessionUri.parseLocalSessionId(sessionResource);
    if (sessionId) {
      this._onDidDisposeChatSession.fire(sessionId);
    }
  }
  async $provideFollowups(requestDto, handle, result, context, token) {
    const agent = this._agents.get(handle);
    if (!agent) {
      return Promise.resolve([]);
    }
    const request = revive(requestDto);
    const convertedHistory = await this.prepareHistoryTurns(agent.extension, agent.id, context);
    const ehResult = typeConvert.ChatAgentResult.to(result);
    return (await agent.provideFollowups(ehResult, { history: convertedHistory, yieldRequested: false }, token)).filter((f) => {
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
  $handleQuestionCarouselAnswer(requestId, resolveId, answers) {
    const requestResolvers = this._pendingCarouselResolvers.get(requestId);
    if (!requestResolvers) {
      return;
    }
    const deferred = requestResolvers.get(resolveId);
    if (deferred) {
      deferred.complete(answers);
      requestResolvers.delete(resolveId);
    }
    if (requestResolvers.size === 0) {
      this._pendingCarouselResolvers.delete(requestId);
    }
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
    return await agent.provideTitle({ history, yieldRequested: false }, token);
  }
  async $provideChatSummary(handle, context, token) {
    const agent = this._agents.get(handle);
    if (!agent) {
      return;
    }
    const history = await this.prepareHistoryTurns(agent.extension, agent.id, { history: context });
    return await agent.provideSummary({ history, yieldRequested: false }, token);
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
  async provideSummary(context, token) {
    if (!this._summarizer) {
      return;
    }
    return await this._summarizer.provideChatSummary(context, token) ?? void 0;
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
          helpTextPostfix: !this._helpTextPostfix || typeof this._helpTextPostfix === "string" ? this._helpTextPostfix : typeConvert.MarkdownString.from(this._helpTextPostfix),
          supportIssueReporting: this._supportIssueReporting,
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
      set summarizer(v) {
        checkProposedApiEnabled(that.extension, "defaultChatParticipant");
        that._summarizer = v;
      },
      get summarizer() {
        checkProposedApiEnabled(that.extension, "defaultChatParticipant");
        return that._summarizer;
      },
      get onDidChangePauseState() {
        checkProposedApiEnabled(that.extension, "chatParticipantAdditions");
        return that._pauseStateEmitter.event;
      },
      onDidPerformAction: !isProposedApiEnabled(this.extension, "chatParticipantAdditions") ? void 0 : this._onDidPerformAction.event,
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
function raceCancellationWithTimeout(cancelWait, promise, token) {
  return new Promise((resolve, reject) => {
    const ref = token.onCancellationRequested(async () => {
      ref.dispose();
      await timeout(cancelWait);
      resolve(void 0);
    });
    promise.then(resolve, reject).finally(() => ref.dispose());
  });
}
__name(raceCancellationWithTimeout, "raceCancellationWithTimeout");
function isBuiltinParticipant(agentId) {
  return agentId.startsWith("github.copilot");
}
__name(isBuiltinParticipant, "isBuiltinParticipant");
export {
  ChatAgentResponseStream,
  ExtHostChatAgents2
};
//# sourceMappingURL=extHostChatAgents2.js.map
