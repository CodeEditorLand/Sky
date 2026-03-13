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
import { CancellationTokenSource } from "../../../../base/common/cancellation.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { Disposable, DisposableStore, toDisposable } from "../../../../base/common/lifecycle.js";
import { autorun, debouncedObservable, derived, ObservablePromise, observableValue } from "../../../../base/common/observable.js";
import { basename } from "../../../../base/common/resources.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { Range } from "../../../../editor/common/core/range.js";
import { localize } from "../../../../nls.js";
import { Action2, MenuId, registerAction2 } from "../../../../platform/actions/common/actions.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IChatWidgetService } from "../../chat/browser/chat.js";
import { IChatContextPickService } from "../../chat/browser/attachments/chatContextPickService.js";
import { ChatContextKeys } from "../../chat/common/actions/chatContextKeys.js";
import { IDebugService } from "../common/debug.js";
import { Variable } from "../common/debugModel.js";
var PickerMode;
(function(PickerMode2) {
  PickerMode2["Main"] = "main";
  PickerMode2["Expression"] = "expression";
})(PickerMode || (PickerMode = {}));
let DebugSessionContextPick = class DebugSessionContextPick2 {
  static {
    __name(this, "DebugSessionContextPick");
  }
  constructor(debugService) {
    this.debugService = debugService;
    this.type = "pickerPick";
    this.label = localize("chatContext.debugSession", "Debug Session...");
    this.icon = Codicon.debug;
    this.ordinal = -200;
  }
  isEnabled() {
    const viewModel = this.debugService.getViewModel();
    const focusedSession = viewModel.focusedSession;
    return !!focusedSession && focusedSession.state === 2;
  }
  asPicker(_widget) {
    const store = new DisposableStore();
    const mode = observableValue(
      "debugPicker.mode",
      "main"
      /* PickerMode.Main */
    );
    const query = observableValue("debugPicker.query", "");
    const picksObservable = this.createPicksObservable(mode, query, store);
    return {
      placeholder: localize("selectDebugData", "Select debug data to attach"),
      picks: /* @__PURE__ */ __name((_queryObs, token) => {
        store.add(autorun((reader) => {
          query.set(_queryObs.read(reader), void 0);
        }));
        const cts = new CancellationTokenSource(token);
        store.add(toDisposable(() => cts.dispose(true)));
        return picksObservable;
      }, "picks"),
      goBack: /* @__PURE__ */ __name(() => {
        if (mode.get() === "expression") {
          mode.set("main", void 0);
          return true;
        }
        return false;
      }, "goBack"),
      dispose: /* @__PURE__ */ __name(() => store.dispose(), "dispose")
    };
  }
  createPicksObservable(mode, query, store) {
    const debouncedQuery = debouncedObservable(query, 300);
    return derived((reader) => {
      const currentMode = mode.read(reader);
      if (currentMode === "expression") {
        return this.getExpressionPicks(debouncedQuery, store);
      } else {
        return this.getMainPicks(mode);
      }
    }).flatten();
  }
  getMainPicks(mode) {
    const promise = derived((_reader) => {
      return new ObservablePromise(this.buildMainPicks(mode));
    });
    return promise.map((value, reader) => {
      const result = value.promiseResult.read(reader);
      return { picks: result?.data || [], busy: result === void 0 };
    });
  }
  async buildMainPicks(mode) {
    const picks = [];
    const viewModel = this.debugService.getViewModel();
    const stackFrame = viewModel.focusedStackFrame;
    const session = viewModel.focusedSession;
    if (!session || !stackFrame) {
      return picks;
    }
    picks.push({
      label: localize("expressionValue", "Expression Value..."),
      iconClass: ThemeIcon.asClassName(Codicon.symbolVariable),
      asAttachment: /* @__PURE__ */ __name(() => {
        mode.set("expression", void 0);
        return "noop";
      }, "asAttachment")
    });
    const watches = this.debugService.getModel().getWatchExpressions();
    if (watches.length > 0) {
      picks.push({ type: "separator", label: localize("watchExpressions", "Watch Expressions") });
      for (const watch of watches) {
        picks.push({
          label: watch.name,
          description: watch.value,
          iconClass: ThemeIcon.asClassName(Codicon.eye),
          asAttachment: /* @__PURE__ */ __name(() => createDebugAttachments(stackFrame, createDebugVariableEntry(watch)), "asAttachment")
        });
      }
    }
    let scopes = [];
    try {
      scopes = await stackFrame.getScopes();
    } catch {
    }
    for (const scope of scopes) {
      if (scope.expensive && !scope.childrenHaveBeenLoaded) {
        continue;
      }
      picks.push({ type: "separator", label: scope.name });
      try {
        const variables = await scope.getChildren();
        if (variables.length > 1) {
          picks.push({
            label: localize("allVariablesInScope", "All variables in {0}", scope.name),
            iconClass: ThemeIcon.asClassName(Codicon.symbolNamespace),
            asAttachment: /* @__PURE__ */ __name(() => createDebugAttachments(stackFrame, createScopeEntry(scope, variables)), "asAttachment")
          });
        }
        for (const variable of variables) {
          picks.push({
            label: variable.name,
            description: formatVariableDescription(variable),
            iconClass: ThemeIcon.asClassName(Codicon.symbolVariable),
            asAttachment: /* @__PURE__ */ __name(() => createDebugAttachments(stackFrame, createDebugVariableEntry(variable)), "asAttachment")
          });
        }
      } catch {
      }
    }
    return picks;
  }
  getExpressionPicks(query, _store) {
    const promise = derived((reader) => {
      const queryValue = query.read(reader);
      const cts = new CancellationTokenSource();
      reader.store.add(toDisposable(() => cts.dispose(true)));
      return new ObservablePromise(this.evaluateExpression(queryValue, cts.token));
    });
    return promise.map((value, r) => {
      const result = value.promiseResult.read(r);
      return { picks: result?.data || [], busy: result === void 0 };
    });
  }
  async evaluateExpression(expression, token) {
    if (!expression.trim()) {
      return [{
        label: localize("typeExpression", "Type an expression to evaluate..."),
        disabled: true,
        asAttachment: /* @__PURE__ */ __name(() => "noop", "asAttachment")
      }];
    }
    const viewModel = this.debugService.getViewModel();
    const session = viewModel.focusedSession;
    const stackFrame = viewModel.focusedStackFrame;
    if (!session || !stackFrame) {
      return [{
        label: localize("noDebugSession", "No active debug session"),
        disabled: true,
        asAttachment: /* @__PURE__ */ __name(() => "noop", "asAttachment")
      }];
    }
    try {
      const response = await session.evaluate(expression, stackFrame.frameId, "watch");
      if (token.isCancellationRequested) {
        return [];
      }
      if (response?.body) {
        const resultValue = response.body.result;
        const resultType = response.body.type;
        return [{
          label: expression,
          description: formatExpressionResult(resultValue, resultType),
          iconClass: ThemeIcon.asClassName(Codicon.symbolVariable),
          asAttachment: /* @__PURE__ */ __name(() => createDebugAttachments(stackFrame, {
            kind: "debugVariable",
            id: `debug-expression:${expression}`,
            name: expression,
            fullName: expression,
            icon: Codicon.debug,
            value: resultValue,
            expression,
            type: resultType,
            modelDescription: formatModelDescription(expression, resultValue, resultType)
          }), "asAttachment")
        }];
      } else {
        return [{
          label: expression,
          description: localize("noResult", "No result"),
          disabled: true,
          asAttachment: /* @__PURE__ */ __name(() => "noop", "asAttachment")
        }];
      }
    } catch (err) {
      return [{
        label: expression,
        description: err instanceof Error ? err.message : localize("evaluationError", "Evaluation error"),
        disabled: true,
        asAttachment: /* @__PURE__ */ __name(() => "noop", "asAttachment")
      }];
    }
  }
};
DebugSessionContextPick = __decorate([
  __param(0, IDebugService)
], DebugSessionContextPick);
function createDebugVariableEntry(expression) {
  return {
    kind: "debugVariable",
    id: `debug-variable:${expression.getId()}`,
    name: expression.name,
    fullName: expression.name,
    icon: Codicon.debug,
    value: expression.value,
    expression: expression.name,
    type: expression.type,
    modelDescription: formatModelDescription(expression.name, expression.value, expression.type)
  };
}
__name(createDebugVariableEntry, "createDebugVariableEntry");
function createPausedLocationEntry(stackFrame) {
  const uri = stackFrame.source.uri;
  let range = Range.lift(stackFrame.range);
  if (range.isEmpty()) {
    range = range.setEndPosition(range.startLineNumber + 1, 1);
  }
  return {
    kind: "file",
    value: { uri, range },
    id: `debug-paused-location:${uri.toString()}:${range.startLineNumber}`,
    name: basename(uri),
    modelDescription: "The debugger is currently paused at this location"
  };
}
__name(createPausedLocationEntry, "createPausedLocationEntry");
function createDebugAttachments(stackFrame, variableEntry) {
  return [
    createPausedLocationEntry(stackFrame),
    variableEntry
  ];
}
__name(createDebugAttachments, "createDebugAttachments");
function createScopeEntry(scope, variables) {
  const variablesSummary = variables.map((v) => `${v.name}: ${v.value}`).join("\n");
  return {
    kind: "debugVariable",
    id: `debug-scope:${scope.name}`,
    name: `Scope: ${scope.name}`,
    fullName: `Scope: ${scope.name}`,
    icon: Codicon.debug,
    value: variablesSummary,
    expression: scope.name,
    type: "scope",
    modelDescription: `Debug scope "${scope.name}" with ${variables.length} variables:
${variablesSummary}`
  };
}
__name(createScopeEntry, "createScopeEntry");
function formatVariableDescription(expression) {
  const value = expression.value;
  const type = expression.type;
  if (type && value) {
    return `${type}: ${value}`;
  }
  return value || type || "";
}
__name(formatVariableDescription, "formatVariableDescription");
function formatExpressionResult(value, type) {
  if (type && value) {
    return `${type}: ${value}`;
  }
  return value || type || "";
}
__name(formatExpressionResult, "formatExpressionResult");
function formatModelDescription(name, value, type) {
  let description = `Debug variable "${name}"`;
  if (type) {
    description += ` of type ${type}`;
  }
  description += ` with value: ${value}`;
  return description;
}
__name(formatModelDescription, "formatModelDescription");
let DebugChatContextContribution = class DebugChatContextContribution2 extends Disposable {
  static {
    __name(this, "DebugChatContextContribution");
  }
  static {
    this.ID = "workbench.contrib.chat.debugChatContextContribution";
  }
  constructor(contextPickService, instantiationService) {
    super();
    this._register(contextPickService.registerChatContextItem(instantiationService.createInstance(DebugSessionContextPick)));
  }
};
DebugChatContextContribution = __decorate([
  __param(0, IChatContextPickService),
  __param(1, IInstantiationService)
], DebugChatContextContribution);
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.debug.action.addVariableToChat",
      title: localize("addToChat", "Add to Chat"),
      f1: false,
      menu: {
        id: MenuId.DebugVariablesContext,
        group: "z_commands",
        order: 110,
        when: ChatContextKeys.enabled
      }
    });
  }
  async run(accessor, context) {
    const chatWidgetService = accessor.get(IChatWidgetService);
    const debugService = accessor.get(IDebugService);
    const widget = await chatWidgetService.revealWidget();
    if (!widget) {
      return;
    }
    const entry = createDebugVariableEntryFromContext(context);
    if (entry) {
      const stackFrame = debugService.getViewModel().focusedStackFrame;
      if (stackFrame) {
        widget.attachmentModel.addContext(createPausedLocationEntry(stackFrame));
      }
      widget.attachmentModel.addContext(entry);
    }
  }
});
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.debug.action.addWatchExpressionToChat",
      title: localize("addToChat", "Add to Chat"),
      f1: false,
      menu: {
        id: MenuId.DebugWatchContext,
        group: "z_commands",
        order: 110,
        when: ChatContextKeys.enabled
      }
    });
  }
  async run(accessor, context) {
    const chatWidgetService = accessor.get(IChatWidgetService);
    const debugService = accessor.get(IDebugService);
    const widget = await chatWidgetService.revealWidget();
    if (!context || !widget) {
      return;
    }
    const stackFrame = debugService.getViewModel().focusedStackFrame;
    if (stackFrame) {
      widget.attachmentModel.addContext(createPausedLocationEntry(stackFrame));
    }
    widget.attachmentModel.addContext(createDebugVariableEntry(context));
  }
});
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.debug.action.addScopeToChat",
      title: localize("addToChat", "Add to Chat"),
      f1: false,
      menu: {
        id: MenuId.DebugScopesContext,
        group: "z_commands",
        order: 1,
        when: ChatContextKeys.enabled
      }
    });
  }
  async run(accessor, context) {
    const chatWidgetService = accessor.get(IChatWidgetService);
    const debugService = accessor.get(IDebugService);
    const widget = await chatWidgetService.revealWidget();
    if (!context || !widget) {
      return;
    }
    const viewModel = debugService.getViewModel();
    const stackFrame = viewModel.focusedStackFrame;
    if (!stackFrame) {
      return;
    }
    try {
      const scopes = await stackFrame.getScopes();
      const scope = scopes.find((s) => s.name === context.scope.name);
      if (scope) {
        const variables = await scope.getChildren();
        widget.attachmentModel.addContext(createPausedLocationEntry(stackFrame));
        widget.attachmentModel.addContext(createScopeEntry(scope, variables));
      }
    } catch {
    }
  }
});
function isVariablesContext(context) {
  return typeof context === "object" && context !== null && "variable" in context && "sessionId" in context;
}
__name(isVariablesContext, "isVariablesContext");
function createDebugVariableEntryFromContext(context) {
  if (context instanceof Variable) {
    return createDebugVariableEntry(context);
  }
  if (isVariablesContext(context)) {
    const variable = context.variable;
    return {
      kind: "debugVariable",
      id: `debug-variable:${variable.name}`,
      name: variable.name,
      fullName: variable.evaluateName ?? variable.name,
      icon: Codicon.debug,
      value: variable.value,
      expression: variable.evaluateName ?? variable.name,
      type: variable.type,
      modelDescription: formatModelDescription(variable.evaluateName || variable.name, variable.value, variable.type)
    };
  }
  return void 0;
}
__name(createDebugVariableEntryFromContext, "createDebugVariableEntryFromContext");
export {
  DebugChatContextContribution
};
//# sourceMappingURL=debugChatIntegration.js.map
