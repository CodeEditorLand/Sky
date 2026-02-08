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
import { CancellationToken } from "../../../base/common/cancellation.js";
import { Disposable, DisposableMap, DisposableStore } from "../../../base/common/lifecycle.js";
import { revive } from "../../../base/common/marshalling.js";
import { ThemeIcon } from "../../../base/common/themables.js";
import { isUriComponents, URI } from "../../../base/common/uri.js";
import { ILogService } from "../../../platform/log/common/log.js";
import { toToolSetKey } from "../../contrib/chat/common/tools/languageModelToolsContribution.js";
import { ILanguageModelToolsService, toolResultHasBuffers, ToolSet } from "../../contrib/chat/common/tools/languageModelToolsService.js";
import { extHostNamedCustomer } from "../../services/extensions/common/extHostCustomers.js";
import { SerializableObjectWithBuffers } from "../../services/extensions/common/proxyIdentifier.js";
import { ExtHostContext, MainContext } from "../common/extHost.protocol.js";
let MainThreadLanguageModelTools = class MainThreadLanguageModelTools2 extends Disposable {
  static {
    __name(this, "MainThreadLanguageModelTools");
  }
  constructor(extHostContext, _languageModelToolsService, _logService) {
    super();
    this._languageModelToolsService = _languageModelToolsService;
    this._logService = _logService;
    this._tools = this._register(new DisposableMap());
    this._runningToolCalls = /* @__PURE__ */ new Map();
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostLanguageModelTools);
    this._register(this._languageModelToolsService.onDidChangeTools((e) => this._proxy.$onDidChangeTools(this.getToolDtos())));
  }
  getToolDtos() {
    return Array.from(this._languageModelToolsService.getAllToolsIncludingDisabled()).map((tool) => ({
      id: tool.id,
      displayName: tool.displayName,
      toolReferenceName: tool.toolReferenceName,
      legacyToolReferenceFullNames: tool.legacyToolReferenceFullNames,
      tags: tool.tags,
      userDescription: tool.userDescription,
      modelDescription: tool.modelDescription,
      inputSchema: tool.inputSchema,
      source: tool.source
    }));
  }
  async $getTools() {
    return this.getToolDtos();
  }
  async $invokeTool(dto, token) {
    const result = await this._languageModelToolsService.invokeTool(revive(dto), (input, token2) => this._proxy.$countTokensForInvocation(dto.callId, input, token2), token ?? CancellationToken.None);
    const out = {
      content: result.content,
      toolMetadata: result.toolMetadata
    };
    return toolResultHasBuffers(result) ? new SerializableObjectWithBuffers(out) : out;
  }
  $acceptToolProgress(callId, progress) {
    this._runningToolCalls.get(callId)?.progress.report(progress);
  }
  $countTokensForInvocation(callId, input, token) {
    const fn = this._runningToolCalls.get(callId);
    if (!fn) {
      throw new Error(`Tool invocation call ${callId} not found`);
    }
    return fn.countTokens(input, token);
  }
  $registerTool(id, hasHandleToolStream) {
    const disposable = this._languageModelToolsService.registerToolImplementation(id, {
      invoke: /* @__PURE__ */ __name(async (dto, countTokens, progress, token) => {
        try {
          this._runningToolCalls.set(dto.callId, { countTokens, progress });
          const resultSerialized = await this._proxy.$invokeTool(dto, token);
          const resultDto = resultSerialized instanceof SerializableObjectWithBuffers ? resultSerialized.value : resultSerialized;
          return revive(resultDto);
        } finally {
          this._runningToolCalls.delete(dto.callId);
        }
      }, "invoke"),
      prepareToolInvocation: /* @__PURE__ */ __name((context, token) => this._proxy.$prepareToolInvocation(id, context, token), "prepareToolInvocation"),
      handleToolStream: hasHandleToolStream ? (context, token) => this._proxy.$handleToolStream(id, context, token) : void 0
    });
    this._tools.set(id, disposable);
  }
  $registerToolWithDefinition(extensionId, definition, hasHandleToolStream) {
    let icon;
    if (definition.icon) {
      if (ThemeIcon.isThemeIcon(definition.icon)) {
        icon = definition.icon;
      } else if (typeof definition.icon === "object" && definition.icon !== null && isUriComponents(definition.icon)) {
        icon = { dark: URI.revive(definition.icon) };
      } else {
        const iconObj = definition.icon;
        icon = { dark: URI.revive(iconObj.dark), light: iconObj.light ? URI.revive(iconObj.light) : void 0 };
      }
    }
    const source = revive(definition.source);
    const toolData = {
      id: definition.id,
      displayName: definition.displayName,
      toolReferenceName: definition.toolReferenceName,
      legacyToolReferenceFullNames: definition.legacyToolReferenceFullNames,
      tags: definition.tags,
      userDescription: definition.userDescription,
      modelDescription: definition.modelDescription,
      inputSchema: definition.inputSchema,
      source,
      icon,
      models: definition.models,
      canBeReferencedInPrompt: !!definition.userDescription && !definition.toolSet
    };
    const id = definition.id;
    const store = new DisposableStore();
    store.add(this._languageModelToolsService.registerTool(toolData, {
      invoke: /* @__PURE__ */ __name(async (dto, countTokens, progress, token) => {
        try {
          this._runningToolCalls.set(dto.callId, { countTokens, progress });
          const resultSerialized = await this._proxy.$invokeTool(dto, token);
          const resultDto = resultSerialized instanceof SerializableObjectWithBuffers ? resultSerialized.value : resultSerialized;
          return revive(resultDto);
        } finally {
          this._runningToolCalls.delete(dto.callId);
        }
      }, "invoke"),
      handleToolStream: hasHandleToolStream ? (context, token) => this._proxy.$handleToolStream(id, context, token) : void 0,
      prepareToolInvocation: /* @__PURE__ */ __name((context, token) => this._proxy.$prepareToolInvocation(id, context, token), "prepareToolInvocation")
    }));
    if (definition.toolSet) {
      const ts = this._languageModelToolsService.getToolSet(toToolSetKey(extensionId, definition.toolSet)) || this._languageModelToolsService.getToolSet(definition.toolSet);
      if (!ts || !(ts instanceof ToolSet)) {
        this._logService.warn(`ToolSet ${definition.toolSet} not found for tool ${definition.id} from extension ${extensionId.value}`);
      } else {
        store.add(ts.addTool(toolData));
      }
    }
    this._tools.set(id, store);
  }
  $unregisterTool(name) {
    this._tools.deleteAndDispose(name);
  }
};
MainThreadLanguageModelTools = __decorate([
  extHostNamedCustomer(MainContext.MainThreadLanguageModelTools),
  __param(1, ILanguageModelToolsService),
  __param(2, ILogService)
], MainThreadLanguageModelTools);
export {
  MainThreadLanguageModelTools
};
//# sourceMappingURL=mainThreadLanguageModelTools.js.map
