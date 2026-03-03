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
import { Action } from "../../../../base/common/actions.js";
import { assertNever, softAssertNever } from "../../../../base/common/assert.js";
import { CancellationError } from "../../../../base/common/errors.js";
import { MarkdownString } from "../../../../base/common/htmlContent.js";
import { DisposableStore } from "../../../../base/common/lifecycle.js";
import { autorun } from "../../../../base/common/observable.js";
import { isDefined } from "../../../../base/common/types.js";
import { URI } from "../../../../base/common/uri.js";
import { localize } from "../../../../nls.js";
import { INotificationService, Severity } from "../../../../platform/notification/common/notification.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { IQuickInputService } from "../../../../platform/quickinput/common/quickInput.js";
import { ChatElicitationRequestPart } from "../../chat/common/model/chatProgressTypes/chatElicitationRequestPart.js";
import { ChatModel } from "../../chat/common/model/chatModel.js";
import { IChatService } from "../../chat/common/chatService/chatService.js";
import { McpConnectionState, MpcResponseError } from "../common/mcpTypes.js";
import { mcpServerToSourceData } from "../common/mcpTypesUtils.js";
import { MCP } from "../common/modelContextProtocol.js";
const noneItem = { id: void 0, label: localize("mcp.elicit.enum.none", "None"), description: localize("mcp.elicit.enum.none.description", "No selection"), alwaysShow: true };
function isFormElicitation(params) {
  return params.mode === "form" || params.mode === void 0 && !!params.requestedSchema;
}
__name(isFormElicitation, "isFormElicitation");
function isUrlElicitation(params) {
  return params.mode === "url";
}
__name(isUrlElicitation, "isUrlElicitation");
function isLegacyTitledEnumSchema(schema) {
  const cast = schema;
  return cast.type === "string" && Array.isArray(cast.enum) && Array.isArray(cast.enumNames);
}
__name(isLegacyTitledEnumSchema, "isLegacyTitledEnumSchema");
function isUntitledEnumSchema(schema) {
  const cast = schema;
  return cast.type === "string" && Array.isArray(cast.enum);
}
__name(isUntitledEnumSchema, "isUntitledEnumSchema");
function isTitledSingleEnumSchema(schema) {
  const cast = schema;
  return cast.type === "string" && Array.isArray(cast.oneOf);
}
__name(isTitledSingleEnumSchema, "isTitledSingleEnumSchema");
function isUntitledMultiEnumSchema(schema) {
  const cast = schema;
  return cast.type === "array" && !!cast.items?.enum;
}
__name(isUntitledMultiEnumSchema, "isUntitledMultiEnumSchema");
function isTitledMultiEnumSchema(schema) {
  const cast = schema;
  return cast.type === "array" && !!cast.items?.anyOf;
}
__name(isTitledMultiEnumSchema, "isTitledMultiEnumSchema");
let McpElicitationService = class McpElicitationService2 {
  static {
    __name(this, "McpElicitationService");
  }
  constructor(_notificationService, _quickInputService, _chatService, _openerService) {
    this._notificationService = _notificationService;
    this._quickInputService = _quickInputService;
    this._chatService = _chatService;
    this._openerService = _openerService;
  }
  elicit(server, context, elicitation, token) {
    if (isFormElicitation(elicitation)) {
      return this._elicitForm(server, context, elicitation, token);
    } else if (isUrlElicitation(elicitation)) {
      return this._elicitUrl(server, context, elicitation, token);
    } else {
      softAssertNever(elicitation);
      return Promise.reject(new MpcResponseError("Unsupported elicitation type", MCP.INVALID_PARAMS, void 0));
    }
  }
  async _elicitForm(server, context, elicitation, token) {
    const store = new DisposableStore();
    const value = await new Promise((resolve) => {
      const chatModel = context?.chatSessionResource && this._chatService.getSession(context.chatSessionResource);
      if (chatModel instanceof ChatModel) {
        const request = chatModel.getRequests().at(-1);
        if (request) {
          const part = new ChatElicitationRequestPart(localize("mcp.elicit.title", "Request for Input"), elicitation.message, localize("msg.subtitle", "{0} (MCP Server)", server.definition.label), localize("mcp.elicit.accept", "Respond"), localize("mcp.elicit.reject", "Cancel"), async () => {
            const p = this._doElicitForm(elicitation, token);
            resolve(p);
            const result = await p;
            part.acceptedResult = result.content;
            return result.action === "accept" ? "accepted" : "rejected";
          }, () => {
            resolve({ action: "decline" });
            return Promise.resolve(
              "rejected"
              /* ElicitationState.Rejected */
            );
          }, mcpServerToSourceData(server));
          chatModel.acceptResponseProgress(request, part);
        }
      } else {
        const handle = this._notificationService.notify({
          message: elicitation.message,
          source: localize("mcp.elicit.source", "MCP Server ({0})", server.definition.label),
          severity: Severity.Info,
          actions: {
            primary: [store.add(new Action("mcp.elicit.give", localize("mcp.elicit.give", "Respond"), void 0, true, () => resolve(this._doElicitForm(elicitation, token))))],
            secondary: [store.add(new Action("mcp.elicit.cancel", localize("mcp.elicit.cancel", "Cancel"), void 0, true, () => resolve({ action: "decline" })))]
          }
        });
        store.add(handle.onDidClose(() => resolve({ action: "cancel" })));
        store.add(token.onCancellationRequested(() => resolve({ action: "cancel" })));
      }
    }).finally(() => store.dispose());
    return { kind: 0, value, dispose: /* @__PURE__ */ __name(() => {
    }, "dispose") };
  }
  async _elicitUrl(server, context, elicitation, token) {
    const promiseStore = new DisposableStore();
    const completePromise = new Promise((resolve, reject) => {
      promiseStore.add(token.onCancellationRequested(() => reject(new CancellationError())));
      promiseStore.add(autorun((reader) => {
        const cnx = server.connection.read(reader);
        const handler = cnx?.handler.read(reader);
        if (handler) {
          reader.store.add(handler.onDidReceiveElicitationCompleteNotification((e) => {
            if (e.params.elicitationId === elicitation.elicitationId) {
              resolve();
            }
          }));
        } else if (!McpConnectionState.isRunning(server.connectionState.read(reader))) {
          reject(new CancellationError());
        }
      }));
    }).finally(() => promiseStore.dispose());
    const store = new DisposableStore();
    const value = await new Promise((resolve) => {
      const chatModel = context?.chatSessionResource && this._chatService.getSession(context.chatSessionResource);
      if (chatModel instanceof ChatModel) {
        const request = chatModel.getRequests().at(-1);
        if (request) {
          const part = new ChatElicitationRequestPart(localize("mcp.elicit.url.title", "Authorization Required"), new MarkdownString().appendText(elicitation.message).appendMarkdown("\n\n" + localize("mcp.elicit.url.instruction", "Open this URL?")).appendCodeblock("", elicitation.url), localize("msg.subtitle", "{0} (MCP Server)", server.definition.label), localize("mcp.elicit.url.open", "Open {0}", URI.parse(elicitation.url).authority), localize("mcp.elicit.reject", "Cancel"), async () => {
            const result = await this._doElicitUrl(elicitation, token);
            resolve(result);
            completePromise.then(() => part.hide());
            return result.action === "accept" ? "accepted" : "rejected";
          }, () => {
            resolve({ action: "decline" });
            return Promise.resolve(
              "rejected"
              /* ElicitationState.Rejected */
            );
          }, mcpServerToSourceData(server));
          chatModel.acceptResponseProgress(request, part);
        }
      } else {
        const handle = this._notificationService.notify({
          message: elicitation.message + " " + localize("mcp.elicit.url.instruction2", "This will open {0}", elicitation.url),
          source: localize("mcp.elicit.source", "MCP Server ({0})", server.definition.label),
          severity: Severity.Info,
          actions: {
            primary: [store.add(new Action("mcp.elicit.url.open2", localize("mcp.elicit.url.open2", "Open URL"), void 0, true, () => resolve(this._doElicitUrl(elicitation, token))))],
            secondary: [store.add(new Action("mcp.elicit.cancel", localize("mcp.elicit.cancel", "Cancel"), void 0, true, () => resolve({ action: "decline" })))]
          }
        });
        store.add(handle.onDidClose(() => resolve({ action: "cancel" })));
        store.add(token.onCancellationRequested(() => resolve({ action: "cancel" })));
      }
    }).finally(() => store.dispose());
    return {
      kind: 1,
      value,
      wait: completePromise,
      dispose: /* @__PURE__ */ __name(() => promiseStore.dispose(), "dispose")
    };
  }
  async _doElicitUrl(elicitation, token) {
    if (token.isCancellationRequested) {
      return { action: "cancel" };
    }
    try {
      if (await this._openerService.open(elicitation.url, { allowCommands: false })) {
        return { action: "accept" };
      }
    } catch {
    }
    return { action: "decline" };
  }
  async _doElicitForm(elicitation, token) {
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
          result = await this._handleEnumField(quickPick, { enum: [{ const: "true" }, { const: "false" }], default: schema.default ? String(schema.default) : void 0 }, isRequired, store, token);
          if (result.type === "value") {
            result.value = result.value === "true" ? true : false;
          }
        } else if (isLegacyTitledEnumSchema(schema)) {
          result = await this._handleEnumField(quickPick, { enum: schema.enum.map((v, i2) => ({ const: v, title: schema.enumNames[i2] })), default: schema.default }, isRequired, store, token);
        } else if (isUntitledEnumSchema(schema)) {
          result = await this._handleEnumField(quickPick, { enum: schema.enum.map((v) => ({ const: v })), default: schema.default }, isRequired, store, token);
        } else if (isTitledSingleEnumSchema(schema)) {
          result = await this._handleEnumField(quickPick, { enum: schema.oneOf, default: schema.default }, isRequired, store, token);
        } else if (isTitledMultiEnumSchema(schema)) {
          result = await this._handleMultiEnumField(quickPick, { enum: schema.items.anyOf, default: schema.default }, isRequired, store, token);
        } else if (isUntitledMultiEnumSchema(schema)) {
          result = await this._handleMultiEnumField(quickPick, { enum: schema.items.enum.map((v) => ({ const: v })), default: schema.default }, isRequired, store, token);
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
    const items = schema.enum.map(({ const: value, title }) => ({
      id: value,
      label: value,
      description: title
    }));
    if (!required) {
      items.push(noneItem);
    }
    quickPick.canSelectMany = false;
    quickPick.items = items;
    if (schema.default !== void 0) {
      quickPick.activeItems = items.filter((item) => item.id === schema.default);
    }
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
  async _handleMultiEnumField(quickPick, schema, required, store, token) {
    const items = schema.enum.map(({ const: value, title }) => ({
      id: value,
      label: value,
      description: title,
      picked: !!schema.default?.includes(value),
      pickable: true
    }));
    if (!required) {
      items.push(noneItem);
    }
    quickPick.canSelectMany = true;
    quickPick.items = items;
    return new Promise((resolve) => {
      store.add(token.onCancellationRequested(() => resolve({ type: "cancel" })));
      store.add(quickPick.onDidAccept(() => {
        const selected = quickPick.selectedItems[0];
        if (selected.id === void 0) {
          resolve({ type: "value", value: void 0 });
        } else {
          resolve({ type: "value", value: quickPick.selectedItems.map((i) => i.id).filter(isDefined) });
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
        if (schema.default) {
          items.push({ id: "$default", label: `${schema.default}`, description: localize("mcp.elicit.useDefault", "Default value") });
        }
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
        const id = quickPick.selectedItems[0].id;
        if (!id) {
          resolve({ type: "value", value: void 0 });
        } else if (id === "$default") {
          resolve({ type: "value", value: String(schema.default) });
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
        return value.includes("@") ? { isValid: true } : { isValid: false, message: localize("mcp.elicit.validation.email", "Please enter a valid email address") };
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
  __param(2, IChatService),
  __param(3, IOpenerService)
], McpElicitationService);
export {
  McpElicitationService
};
//# sourceMappingURL=mcpElicitationService.js.map
