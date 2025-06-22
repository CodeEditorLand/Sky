var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Action } from "../../../../base/common/actions.js";
import { assertNever } from "../../../../base/common/assert.js";
import { markdownCommandLink, MarkdownString } from "../../../../base/common/htmlContent.js";
import { DisposableStore } from "../../../../base/common/lifecycle.js";
import { localize } from "../../../../nls.js";
import { INotificationService, Severity } from "../../../../platform/notification/common/notification.js";
import { IQuickInputService } from "../../../../platform/quickinput/common/quickInput.js";
import { ChatModel } from "../../chat/common/chatModel.js";
import { IChatService } from "../../chat/common/chatService.js";
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
const noneItem = { id: void 0, label: localize("mcp.elicit.enum.none", "None"), description: localize("mcp.elicit.enum.none.description", "No selection"), alwaysShow: true };
let McpElicitationService = class McpElicitationService2 {
  static {
    __name(this, "McpElicitationService");
  }
  constructor(_notificationService, _quickInputService, _chatService) {
    this._notificationService = _notificationService;
    this._quickInputService = _quickInputService;
    this._chatService = _chatService;
  }
  elicit(server, context, elicitation, token) {
    const store = new DisposableStore();
    return new Promise((resolve) => {
      const chatModel = context?.chatSessionId && this._chatService.getSession(context.chatSessionId);
      if (chatModel instanceof ChatModel) {
        const request = chatModel.getRequests().at(-1);
        if (request) {
          const part = new ChatElicitationRequestPart(localize("mcp.elicit.title", "Request for Input"), elicitation.message, new MarkdownString(markdownCommandLink({
            id: "workbench.mcp.showConfiguration",
            title: localize("msg.subtitle", "{0} (MCP Server)", server.definition.label),
            arguments: [server.collection.id, server.definition.id]
          }), { isTrusted: true }), async () => {
            const p = this._doElicit(elicitation, token);
            resolve(p);
            const result = await p;
            part.state = result.action === "accept" ? "accepted" : "rejected";
            part.acceptedResult = result.content;
          }, () => {
            resolve({ action: "decline" });
            part.state = "rejected";
            return Promise.resolve();
          });
          chatModel.acceptResponseProgress(request, part);
        }
      } else {
        const handle = this._notificationService.notify({
          message: elicitation.message,
          source: localize("mcp.elicit.source", "MCP Server ({0})", server.definition.label),
          severity: Severity.Info,
          actions: {
            primary: [store.add(new Action("mcp.elicit.give", localize("mcp.elicit.give", "Respond"), void 0, true, () => resolve(this._doElicit(elicitation, token))))],
            secondary: [store.add(new Action("mcp.elicit.cancel", localize("mcp.elicit.cancel", "Cancel"), void 0, true, () => resolve({ action: "decline" })))]
          }
        });
        store.add(handle.onDidClose(() => resolve({ action: "cancel" })));
        store.add(token.onCancellationRequested(() => resolve({ action: "cancel" })));
      }
    }).finally(() => store.dispose());
  }
  async _doElicit(elicitation, token) {
    const quickPick = this._quickInputService.createQuickPick();
    const store = new DisposableStore();
    try {
      const properties = Object.entries(elicitation.requestedSchema.properties);
      const requiredFields = new Set(elicitation.requestedSchema.required || []);
      const results = {};
      const backSnapshots = [];
      quickPick.title = elicitation.message;
      quickPick.totalSteps = properties.length;
      quickPick.ignoreFocusOut = true;
      for (let i = 0; i < properties.length; i++) {
        const [propertyName, schema] = properties[i];
        const isRequired = requiredFields.has(propertyName);
        const restore = backSnapshots.at(i);
        store.clear();
        quickPick.step = i + 1;
        quickPick.title = schema.title || propertyName;
        quickPick.placeholder = this._getFieldPlaceholder(schema, isRequired);
        quickPick.value = restore?.value ?? "";
        quickPick.validationMessage = "";
        quickPick.buttons = i > 0 ? [this._quickInputService.backButton] : [];
        let result;
        if (schema.type === "boolean") {
          result = await this._handleEnumField(quickPick, { ...schema, type: "string", enum: ["true", "false"] }, isRequired, store, token);
          if (result.type === "value") {
            result.value = result.value === "true" ? true : false;
          }
        } else if (schema.type === "string" && "enum" in schema) {
          result = await this._handleEnumField(quickPick, schema, isRequired, store, token);
        } else {
          result = await this._handleInputField(quickPick, schema, isRequired, store, token);
          if (result.type === "value" && (schema.type === "number" || schema.type === "integer")) {
            result.value = Number(result.value);
          }
        }
        if (result.type === "back") {
          i -= 2;
          continue;
        }
        if (result.type === "cancel") {
          return { action: "cancel" };
        }
        backSnapshots[i] = { value: quickPick.value };
        if (result.value === void 0) {
          delete results[propertyName];
        } else {
          results[propertyName] = result.value;
        }
      }
      return {
        action: "accept",
        content: results
      };
    } finally {
      store.dispose();
      quickPick.dispose();
    }
  }
  _getFieldPlaceholder(schema, required) {
    let placeholder = schema.description || "";
    if (!required) {
      placeholder = placeholder ? `${placeholder} (${localize("optional", "Optional")})` : localize("optional", "Optional");
    }
    return placeholder;
  }
  async _handleEnumField(quickPick, schema, required, store, token) {
    const items = schema.enum.map((value, index) => ({
      id: value,
      label: value,
      description: schema.enumNames?.[index]
    }));
    if (!required) {
      items.push(noneItem);
    }
    quickPick.items = items;
    quickPick.canSelectMany = false;
    return new Promise((resolve) => {
      store.add(token.onCancellationRequested(() => resolve({ type: "cancel" })));
      store.add(quickPick.onDidAccept(() => {
        const selected = quickPick.selectedItems[0];
        if (selected) {
          resolve({ type: "value", value: selected.id });
        }
      }));
      store.add(quickPick.onDidTriggerButton(() => resolve({ type: "back" })));
      store.add(quickPick.onDidHide(() => resolve({ type: "cancel" })));
      quickPick.show();
    });
  }
  async _handleInputField(quickPick, schema, required, store, token) {
    quickPick.canSelectMany = false;
    const updateItems = /* @__PURE__ */ __name(() => {
      const items = [];
      if (quickPick.value) {
        const validation = this._validateInput(quickPick.value, schema);
        quickPick.validationMessage = validation.message;
        if (validation.isValid) {
          items.push({ id: "$current", label: `\u27A4 ${quickPick.value}` });
        }
      } else {
        quickPick.validationMessage = "";
      }
      if (quickPick.validationMessage) {
        quickPick.severity = Severity.Warning;
      } else {
        quickPick.severity = Severity.Ignore;
        if (!required) {
          items.push(noneItem);
        }
      }
      quickPick.items = items;
    }, "updateItems");
    updateItems();
    return new Promise((resolve) => {
      if (token.isCancellationRequested) {
        resolve({ type: "cancel" });
        return;
      }
      store.add(token.onCancellationRequested(() => resolve({ type: "cancel" })));
      store.add(quickPick.onDidChangeValue(updateItems));
      store.add(quickPick.onDidAccept(() => {
        if (!quickPick.selectedItems[0].id) {
          resolve({ type: "value", value: void 0 });
        } else if (!quickPick.validationMessage) {
          resolve({ type: "value", value: quickPick.value });
        }
      }));
      store.add(quickPick.onDidTriggerButton(() => resolve({ type: "back" })));
      store.add(quickPick.onDidHide(() => resolve({ type: "cancel" })));
      quickPick.show();
    });
  }
  _validateInput(value, schema) {
    switch (schema.type) {
      case "string":
        return this._validateString(value, schema);
      case "number":
      case "integer":
        return this._validateNumber(value, schema);
      default:
        assertNever(schema);
    }
  }
  _validateString(value, schema) {
    if (schema.minLength && value.length < schema.minLength) {
      return { isValid: false, message: localize("mcp.elicit.validation.minLength", "Minimum length is {0}", schema.minLength) };
    }
    if (schema.maxLength && value.length > schema.maxLength) {
      return { isValid: false, message: localize("mcp.elicit.validation.maxLength", "Maximum length is {0}", schema.maxLength) };
    }
    if (schema.format) {
      const formatValid = this._validateStringFormat(value, schema.format);
      if (!formatValid.isValid) {
        return formatValid;
      }
    }
    return { isValid: true, parsedValue: value };
  }
  _validateStringFormat(value, format) {
    switch (format) {
      case "email":
        return !value.includes("@") ? { isValid: true } : { isValid: false, message: localize("mcp.elicit.validation.email", "Please enter a valid email address") };
      case "uri":
        if (URL.canParse(value)) {
          return { isValid: true };
        } else {
          return { isValid: false, message: localize("mcp.elicit.validation.uri", "Please enter a valid URI") };
        }
      case "date": {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(value)) {
          return { isValid: false, message: localize("mcp.elicit.validation.date", "Please enter a valid date (YYYY-MM-DD)") };
        }
        const date = new Date(value);
        return !isNaN(date.getTime()) ? { isValid: true } : { isValid: false, message: localize("mcp.elicit.validation.date", "Please enter a valid date (YYYY-MM-DD)") };
      }
      case "date-time": {
        const dateTime = new Date(value);
        return !isNaN(dateTime.getTime()) ? { isValid: true } : { isValid: false, message: localize("mcp.elicit.validation.dateTime", "Please enter a valid date-time") };
      }
      default:
        return { isValid: true };
    }
  }
  _validateNumber(value, schema) {
    const parsed = Number(value);
    if (isNaN(parsed)) {
      return { isValid: false, message: localize("mcp.elicit.validation.number", "Please enter a valid number") };
    }
    if (schema.type === "integer" && !Number.isInteger(parsed)) {
      return { isValid: false, message: localize("mcp.elicit.validation.integer", "Please enter a valid integer") };
    }
    if (schema.minimum !== void 0 && parsed < schema.minimum) {
      return { isValid: false, message: localize("mcp.elicit.validation.minimum", "Minimum value is {0}", schema.minimum) };
    }
    if (schema.maximum !== void 0 && parsed > schema.maximum) {
      return { isValid: false, message: localize("mcp.elicit.validation.maximum", "Maximum value is {0}", schema.maximum) };
    }
    return { isValid: true, parsedValue: parsed };
  }
};
McpElicitationService = __decorate([
  __param(0, INotificationService),
  __param(1, IQuickInputService),
  __param(2, IChatService)
], McpElicitationService);
class ChatElicitationRequestPart {
  static {
    __name(this, "ChatElicitationRequestPart");
  }
  constructor(title, message, originMessage, accept, reject) {
    this.title = title;
    this.message = message;
    this.originMessage = originMessage;
    this.accept = accept;
    this.reject = reject;
    this.kind = "elicitation";
    this.state = "pending";
  }
  toJSON() {
    return {
      kind: "elicitation",
      title: this.title,
      message: this.message,
      state: this.state === "pending" ? "rejected" : this.state,
      acceptedResult: this.acceptedResult
    };
  }
}
export {
  McpElicitationService
};
//# sourceMappingURL=mcpElicitationService.js.map
