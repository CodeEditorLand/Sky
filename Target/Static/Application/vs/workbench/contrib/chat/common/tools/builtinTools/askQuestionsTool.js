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
import { CancellationError } from "../../../../../../base/common/errors.js";
import { MarkdownString } from "../../../../../../base/common/htmlContent.js";
import { Disposable } from "../../../../../../base/common/lifecycle.js";
import { generateUuid } from "../../../../../../base/common/uuid.js";
import { localize } from "../../../../../../nls.js";
import { IChatService } from "../../chatService/chatService.js";
import { ChatQuestionCarouselData } from "../../model/chatProgressTypes/chatQuestionCarouselData.js";
import { StopWatch } from "../../../../../../base/common/stopwatch.js";
import { ILogService } from "../../../../../../platform/log/common/log.js";
import { ITelemetryService } from "../../../../../../platform/telemetry/common/telemetry.js";
import { ToolDataSource } from "../languageModelToolsService.js";
import { ThemeIcon } from "../../../../../../base/common/themables.js";
import { Codicon } from "../../../../../../base/common/codicons.js";
import { raceCancellation } from "../../../../../../base/common/async.js";
const AskQuestionsToolId = "vscode_askQuestions";
const SoftLimits = {
  header: 50,
  question: 200
};
const HardLimits = {
  header: 75,
  question: 300
};
function truncateToLimit(value, limit) {
  if (value === void 0) {
    return void 0;
  }
  if (value.length > limit) {
    return value.slice(0, limit - 3) + "...";
  }
  return value;
}
__name(truncateToLimit, "truncateToLimit");
function createAskQuestionsToolData() {
  const questionSchema = {
    type: "object",
    properties: {
      header: {
        type: "string",
        description: "Short identifier for the question. Must be unique so answers can be mapped back to the question.",
        maxLength: SoftLimits.header
      },
      question: {
        type: "string",
        description: "The question text to display to the user. Keep it concise, ideally one sentence.",
        maxLength: SoftLimits.question
      },
      multiSelect: {
        type: "boolean",
        description: "Allow selecting multiple options when options are provided."
      },
      allowFreeformInput: {
        type: "boolean",
        description: "Allow freeform text answers in addition to option selection."
      },
      options: {
        type: "array",
        description: "Optional list of selectable answers. If omitted, the question is free text.",
        items: {
          type: "object",
          properties: {
            label: {
              type: "string",
              description: "Display label and value for the option."
            },
            description: {
              type: "string",
              description: "Optional secondary text shown with the option."
            },
            recommended: {
              type: "boolean",
              description: "Mark this option as the recommended default."
            }
          },
          required: ["label"]
        }
      }
    },
    required: ["header", "question"]
  };
  const inputSchema = {
    type: "object",
    properties: {
      questions: {
        type: "array",
        description: "List of questions to ask the user. Order is preserved.",
        items: questionSchema,
        minItems: 1
      }
    },
    required: ["questions"]
  };
  return {
    id: AskQuestionsToolId,
    toolReferenceName: "askQuestions",
    legacyToolReferenceFullNames: [AskQuestionsToolId, "vscode/askQuestions"],
    canBeReferencedInPrompt: false,
    icon: ThemeIcon.fromId(Codicon.question.id),
    displayName: localize("tool.askQuestions.displayName", "Ask Clarifying Questions"),
    userDescription: localize("tool.askQuestions.userDescription", "Ask structured clarifying questions using single select, multi-select, or freeform inputs to collect task requirements before proceeding."),
    modelDescription: "Use this tool to ask the user a small number of clarifying questions before proceeding. Provide the questions array with concise headers and prompts. Use options for fixed choices, set multiSelect when multiple selections are allowed, and set allowFreeformInput to let users supply their own answer.",
    source: ToolDataSource.Internal,
    inputSchema
  };
}
__name(createAskQuestionsToolData, "createAskQuestionsToolData");
const AskQuestionsToolData = createAskQuestionsToolData();
let AskQuestionsTool = class AskQuestionsTool2 extends Disposable {
  static {
    __name(this, "AskQuestionsTool");
  }
  constructor(chatService, telemetryService, logService) {
    super();
    this.chatService = chatService;
    this.telemetryService = telemetryService;
    this.logService = logService;
  }
  async invoke(invocation, _countTokens, progress, token) {
    const stopWatch = StopWatch.create(true);
    const parameters = invocation.parameters;
    const { questions } = parameters;
    this.logService.trace(`[AskQuestionsTool] Invoking with ${questions?.length ?? 0} question(s)`);
    if (!questions || questions.length === 0) {
      throw new Error(localize("askQuestionsTool.noQuestions", "No questions provided. The questions array must contain at least one question."));
    }
    const chatSessionResource = invocation.context?.sessionResource;
    const chatRequestId = invocation.chatRequestId;
    const { request, sessionResource } = this.getRequest(chatSessionResource, chatRequestId);
    if (!sessionResource || !request) {
      this.logService.warn("[AskQuestionsTool] Missing chat context; marking all questions as skipped.");
      return this.createSkippedResult(questions);
    }
    const { carousel, idToHeaderMap } = this.toQuestionCarousel(questions);
    this.chatService.appendProgress(request, carousel);
    const answerResult = await raceCancellation(carousel.completion.p, token);
    if (token.isCancellationRequested) {
      throw new CancellationError();
    }
    progress.report({ message: localize("askQuestionsTool.progress", "Analyzing your answers...") });
    const converted = this.convertCarouselAnswers(questions, answerResult?.answers, idToHeaderMap);
    const { answeredCount, skippedCount, freeTextCount, recommendedAvailableCount, recommendedSelectedCount } = this.collectMetrics(questions, converted);
    this.sendTelemetry(invocation.chatRequestId, questions.length, answeredCount, skippedCount, freeTextCount, recommendedAvailableCount, recommendedSelectedCount, stopWatch.elapsed());
    const toolResultJson = JSON.stringify(converted);
    this.logService.trace(`[AskQuestionsTool] Returning tool result with metrics: questions=${questions.length}, answered=${answeredCount}, skipped=${skippedCount}, freeText=${freeTextCount}, recommendedAvailable=${recommendedAvailableCount}, recommendedSelected=${recommendedSelectedCount}`);
    return {
      content: [{ kind: "text", value: toolResultJson }]
    };
  }
  async prepareToolInvocation(context, _token) {
    const parameters = context.parameters;
    const { questions } = parameters;
    if (!questions || questions.length === 0) {
      throw new Error(localize("askQuestionsTool.noQuestions", "No questions provided. The questions array must contain at least one question."));
    }
    for (const question of questions) {
      if (question.options && question.options.length === 1) {
        throw new Error(localize("askQuestionsTool.invalidOptions", 'Question "{0}" must have at least two options, or none for free text input.', question.header));
      }
      question.question = truncateToLimit(question.question, HardLimits.question) ?? question.question;
    }
    const questionCount = questions.length;
    const headers = questions.map((q) => q.header).join(", ");
    const message = questionCount === 1 ? localize("askQuestionsTool.invocation.single", "Asking a question ({0})", headers) : localize("askQuestionsTool.invocation.multiple", "Asking {0} questions ({1})", questionCount, headers);
    const pastMessage = questionCount === 1 ? localize("askQuestionsTool.invocation.single.past", "Asked a question ({0})", headers) : localize("askQuestionsTool.invocation.multiple.past", "Asked {0} questions ({1})", questionCount, headers);
    return {
      invocationMessage: new MarkdownString(message),
      pastTenseMessage: new MarkdownString(pastMessage)
    };
  }
  getRequest(chatSessionResource, chatRequestId) {
    if (!chatSessionResource) {
      return { request: void 0, sessionResource: void 0 };
    }
    const model = this.chatService.getSession(chatSessionResource);
    let request;
    if (model) {
      if (chatRequestId) {
        request = model.getRequests().find((r) => r.id === chatRequestId);
      }
      if (!request) {
        request = model.getRequests().at(-1);
      }
    }
    if (!request) {
      return { request: void 0, sessionResource: chatSessionResource };
    }
    return { request, sessionResource: chatSessionResource };
  }
  toQuestionCarousel(questions) {
    const idToHeaderMap = /* @__PURE__ */ new Map();
    const mappedQuestions = questions.map((question) => this.toChatQuestion(question, idToHeaderMap));
    return {
      carousel: new ChatQuestionCarouselData(mappedQuestions, true, generateUuid()),
      idToHeaderMap
    };
  }
  toChatQuestion(question, idToHeaderMap) {
    let type;
    if (!question.options || question.options.length === 0) {
      type = "text";
    } else if (question.multiSelect) {
      type = "multiSelect";
    } else {
      type = "singleSelect";
    }
    let defaultValue;
    if (question.options) {
      const recommendedOptions = question.options.filter((opt) => opt.recommended);
      if (recommendedOptions.length > 0) {
        defaultValue = question.multiSelect ? recommendedOptions.map((opt) => opt.label) : recommendedOptions[0].label;
      }
    }
    const internalId = generateUuid();
    idToHeaderMap.set(internalId, question.header);
    const displayTitle = truncateToLimit(question.header, HardLimits.header) ?? question.header;
    return {
      id: internalId,
      type,
      title: displayTitle,
      message: question.question,
      options: question.options?.map((opt) => ({
        id: opt.label,
        label: opt.description ? `${opt.label} - ${opt.description}` : opt.label,
        value: opt.label
      })),
      defaultValue,
      allowFreeformInput: question.allowFreeformInput ?? false
    };
  }
  convertCarouselAnswers(questions, carouselAnswers, idToHeaderMap) {
    const result = { answers: {} };
    if (carouselAnswers) {
      this.logService.trace(`[AskQuestionsTool] Carousel answer keys: ${Object.keys(carouselAnswers).join(", ")}`);
      this.logService.trace(`[AskQuestionsTool] Question headers: ${questions.map((q) => q.header).join(", ")}`);
    }
    const headerToIdMap = /* @__PURE__ */ new Map();
    for (const [internalId, originalHeader] of idToHeaderMap) {
      headerToIdMap.set(originalHeader, internalId);
    }
    for (const question of questions) {
      if (!carouselAnswers) {
        result.answers[question.header] = {
          selected: [],
          freeText: null,
          skipped: true
        };
        continue;
      }
      const internalId = headerToIdMap.get(question.header);
      const answer = internalId ? carouselAnswers[internalId] : void 0;
      this.logService.trace(`[AskQuestionsTool] Processing question "${question.header}" (internal ID: ${internalId}), raw answer: ${JSON.stringify(answer)}, type: ${typeof answer}`);
      if (answer === void 0) {
        result.answers[question.header] = {
          selected: [],
          freeText: null,
          skipped: true
        };
      } else if (typeof answer === "string") {
        if (question.options?.some((opt) => opt.label === answer)) {
          result.answers[question.header] = {
            selected: [answer],
            freeText: null,
            skipped: false
          };
        } else {
          result.answers[question.header] = {
            selected: [],
            freeText: answer,
            skipped: false
          };
        }
      } else if (Array.isArray(answer)) {
        result.answers[question.header] = {
          selected: answer.map((a) => String(a)),
          freeText: null,
          skipped: false
        };
      } else if (typeof answer === "object" && answer !== null) {
        const answerObj = answer;
        const freeformValue = typeof answerObj.freeformValue === "string" && answerObj.freeformValue ? answerObj.freeformValue : null;
        const selectedValues = Array.isArray(answerObj.selectedValues) ? answerObj.selectedValues.map((v) => String(v)) : void 0;
        const selectedValue = answerObj.selectedValue;
        const label = typeof answerObj.label === "string" ? answerObj.label : void 0;
        if (selectedValues) {
          result.answers[question.header] = {
            selected: selectedValues,
            freeText: freeformValue,
            skipped: false
          };
        } else if (typeof selectedValue === "string") {
          if (question.options?.some((opt) => opt.label === selectedValue)) {
            result.answers[question.header] = {
              selected: [selectedValue],
              freeText: freeformValue,
              skipped: false
            };
          } else {
            result.answers[question.header] = {
              selected: [],
              freeText: freeformValue ?? selectedValue,
              skipped: false
            };
          }
        } else if (Array.isArray(selectedValue)) {
          result.answers[question.header] = {
            selected: selectedValue.map((v) => String(v)),
            freeText: freeformValue,
            skipped: false
          };
        } else if (selectedValue === void 0 || selectedValue === null) {
          if (freeformValue) {
            result.answers[question.header] = {
              selected: [],
              freeText: freeformValue,
              skipped: false
            };
          } else {
            result.answers[question.header] = {
              selected: [],
              freeText: null,
              skipped: true
            };
          }
        } else if (freeformValue) {
          result.answers[question.header] = {
            selected: [],
            freeText: freeformValue,
            skipped: false
          };
        } else if (label) {
          result.answers[question.header] = {
            selected: [label],
            freeText: null,
            skipped: false
          };
        } else {
          this.logService.warn(`[AskQuestionsTool] Unknown answer object format for "${question.header}": ${JSON.stringify(answer)}`);
          result.answers[question.header] = {
            selected: [],
            freeText: null,
            skipped: true
          };
        }
      } else {
        this.logService.warn(`[AskQuestionsTool] Unknown answer format for "${question.header}": ${typeof answer}`);
        result.answers[question.header] = {
          selected: [],
          freeText: null,
          skipped: true
        };
      }
    }
    return result;
  }
  collectMetrics(questions, result) {
    const answers = Object.values(result.answers);
    const answeredCount = answers.filter((a) => !a.skipped).length;
    const skippedCount = answers.filter((a) => a.skipped).length;
    const freeTextCount = answers.filter((a) => a.freeText !== null).length;
    const recommendedAvailableCount = questions.filter((q) => q.options?.some((opt) => opt.recommended)).length;
    const recommendedSelectedCount = questions.filter((q) => {
      const answer = result.answers[q.header];
      const recommendedOption = q.options?.find((opt) => opt.recommended);
      return answer && !answer.skipped && recommendedOption && answer.selected.includes(recommendedOption.label);
    }).length;
    return { answeredCount, skippedCount, freeTextCount, recommendedAvailableCount, recommendedSelectedCount };
  }
  createSkippedResult(questions) {
    const skippedAnswers = {};
    for (const question of questions) {
      skippedAnswers[question.header] = { selected: [], freeText: null, skipped: true };
    }
    return {
      content: [{ kind: "text", value: JSON.stringify({ answers: skippedAnswers }) }]
    };
  }
  sendTelemetry(requestId, questionCount, answeredCount, skippedCount, freeTextCount, recommendedAvailableCount, recommendedSelectedCount, duration) {
    this.telemetryService.publicLog2("askQuestionsToolInvoked", {
      requestId,
      questionCount,
      answeredCount,
      skippedCount,
      freeTextCount,
      recommendedAvailableCount,
      recommendedSelectedCount,
      duration
    });
  }
};
AskQuestionsTool = __decorate([
  __param(0, IChatService),
  __param(1, ITelemetryService),
  __param(2, ILogService)
], AskQuestionsTool);
export {
  AskQuestionsTool,
  AskQuestionsToolData,
  AskQuestionsToolId,
  createAskQuestionsToolData
};
//# sourceMappingURL=askQuestionsTool.js.map
