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
import * as dom from "../../../../../../../base/browser/dom.js";
import { softAssertNever } from "../../../../../../../base/common/assert.js";
import { disposableTimeout } from "../../../../../../../base/common/async.js";
import { decodeBase64 } from "../../../../../../../base/common/buffer.js";
import { CancellationTokenSource } from "../../../../../../../base/common/cancellation.js";
import { Emitter } from "../../../../../../../base/common/event.js";
import { Disposable } from "../../../../../../../base/common/lifecycle.js";
import { autorun, autorunSelfDisposable, derived, observableValue } from "../../../../../../../base/common/observable.js";
import { basename } from "../../../../../../../base/common/resources.js";
import { isFalsyOrWhitespace } from "../../../../../../../base/common/strings.js";
import { hasKey, isDefined } from "../../../../../../../base/common/types.js";
import { localize } from "../../../../../../../nls.js";
import { IInstantiationService } from "../../../../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../../../../platform/log/common/log.js";
import { IOpenerService } from "../../../../../../../platform/opener/common/opener.js";
import { IProductService } from "../../../../../../../platform/product/common/productService.js";
import { IStorageService } from "../../../../../../../platform/storage/common/storage.js";
import { McpToolCallUI } from "../../../../../mcp/browser/mcpToolCallUI.js";
import { McpResourceURI } from "../../../../../mcp/common/mcpTypes.js";
import { McpApps } from "../../../../../mcp/common/modelContextProtocolApps.js";
import { IWebviewService, WebviewOriginStore } from "../../../../../webview/browser/webview.js";
import { isToolResultInputOutputDetails } from "../../../../common/tools/languageModelToolsService.js";
import { IChatWidgetService } from "../../../chat.js";
const ORIGIN_STORE_KEY = "chatMcpApp.origins";
let ChatMcpAppModel = class ChatMcpAppModel2 extends Disposable {
  static {
    __name(this, "ChatMcpAppModel");
  }
  constructor(toolInvocation, renderData, _container, maxHeight, currentWidth, _instantiationService, _chatWidgetService, _webviewService, storageService, _logService, _productService, _openerService) {
    super();
    this.toolInvocation = toolInvocation;
    this.renderData = renderData;
    this._container = _container;
    this._instantiationService = _instantiationService;
    this._chatWidgetService = _chatWidgetService;
    this._webviewService = _webviewService;
    this._logService = _logService;
    this._productService = _productService;
    this._openerService = _openerService;
    this._disposeCts = this._register(new CancellationTokenSource());
    this._announcedCapabilities = false;
    this._latestCsp = void 0;
    this._height = 300;
    this._loadState = observableValue(this, { status: "loading" });
    this.loadState = this._loadState;
    this._onDidChangeHeight = this._register(new Emitter());
    this.onDidChangeHeight = this._onDidChangeHeight.event;
    this._originStore = new WebviewOriginStore(ORIGIN_STORE_KEY, storageService);
    this._webviewOrigin = this._originStore.getOrigin("mcpApp", renderData.serverDefinitionId);
    this._mcpToolCallUI = this._register(this._instantiationService.createInstance(McpToolCallUI, renderData));
    this._webview = this._register(this._webviewService.createWebviewElement({
      origin: this._webviewOrigin,
      title: localize("mcpAppTitle", "MCP App"),
      options: {
        purpose: "chatOutputItem",
        enableFindWidget: false,
        disableServiceWorker: true,
        retainContextWhenHidden: true
      },
      contentOptions: {
        allowMultipleAPIAcquire: true,
        allowScripts: true,
        allowForms: true
      },
      extension: void 0
    }));
    const targetWindow = dom.getWindow(this._container);
    this._webview.mountTo(this._container, targetWindow);
    this.hostContext = this._mcpToolCallUI.hostContext.map((context, reader) => ({
      ...context,
      containerDimensions: {
        width: currentWidth.read(reader),
        maxHeight: maxHeight.read(reader)
      },
      toolCall: {
        toolCallId: this.toolInvocation.toolCallId,
        toolName: this.toolInvocation.toolId
      }
    }));
    this._register(autorun((reader) => {
      const context = this.hostContext.read(reader);
      if (this._announcedCapabilities) {
        this._sendNotification({
          method: "ui/notifications/host-context-changed",
          params: context
        });
      }
    }));
    this._register(this._webview.onMessage(async ({ message }) => {
      await this._handleWebviewMessage(message);
    }));
    const canScrollWithin = derived((reader) => {
      const contentSize = this._webview.intrinsicContentSize.read(reader);
      const maxHeightValue = maxHeight.read(reader);
      if (!contentSize) {
        return false;
      }
      return contentSize.height > maxHeightValue;
    });
    this._register(autorun((reader) => {
      if (!canScrollWithin.read(reader)) {
        const widget = this._chatWidgetService.getWidgetBySessionResource(this.renderData.sessionResource);
        reader.store.add(this._webview.onDidWheel((e) => {
          widget?.delegateScrollFromMouseWheelEvent({
            ...e,
            preventDefault: /* @__PURE__ */ __name(() => {
            }, "preventDefault"),
            stopPropagation: /* @__PURE__ */ __name(() => {
            }, "stopPropagation")
          });
        }));
      }
    }));
    this._loadContent();
  }
  /**
   * Gets the current height of the webview.
   */
  get height() {
    return this._height;
  }
  remount() {
    this._webview.reinitializeAfterDismount();
    this._announcedCapabilities = false;
  }
  /**
   * Retries loading the MCP App content.
   */
  retry() {
    this._loadState.set({ status: "loading" }, void 0);
    this._loadContent();
  }
  /**
   * Loads the MCP App content into the webview.
   */
  async _loadContent() {
    const token = this._disposeCts.token;
    try {
      const resourceContent = await this._mcpToolCallUI.loadResource(token);
      if (token.isCancellationRequested) {
        return;
      }
      const htmlWithCsp = this._injectPreamble(resourceContent);
      this._announcedCapabilities = false;
      this._latestCsp = resourceContent.csp;
      this._webview.setHtml(htmlWithCsp);
      this._loadState.set({ status: "loaded" }, void 0);
    } catch (error) {
      this._logService.error("[MCP App] Error loading app:", error);
      this._loadState.set({ status: "error", error }, void 0);
    }
  }
  /**
   * Injects a Content-Security-Policy meta tag into the HTML.
   */
  _injectPreamble({ html, csp }) {
    const cleanDomains = /* @__PURE__ */ __name((s) => (s?.join(" ") || "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;"), "cleanDomains");
    const cspContent = `
			default-src 'none';
			script-src 'self' 'unsafe-inline' ${cleanDomains(csp?.resourceDomains)};
			style-src 'self' 'unsafe-inline' ${cleanDomains(csp?.resourceDomains)};
			connect-src 'self' ${cleanDomains(csp?.connectDomains)};
			img-src 'self' data: ${cleanDomains(csp?.resourceDomains)};
			font-src 'self' ${cleanDomains(csp?.resourceDomains)};
			media-src 'self' data: ${cleanDomains(csp?.resourceDomains)};
			frame-src ${cleanDomains(csp?.frameDomains) || `'none'`};
			object-src 'none';
			base-uri ${cleanDomains(csp?.baseUriDomains) || `'self'`};
		`;
    const cspTag = `<meta http-equiv="Content-Security-Policy" content="${cspContent}">`;
    const postMessageRehoist = `
			<script>(() => {
				const api = acquireVsCodeApi();
				const setMessageSource = (obj, src) => new Proxy(obj, {
					get: (target, prop) => {
						if (prop === 'source')  {
							return src;
						}
						return target[prop];
					}
				});

				const wrappedFns = new WeakMap();

				let patchedPostMessage = (message, transfer) => api.postMessage(message, transfer);
				const wrap = target => new Proxy(target, {
					set: (obj, prop, value) => {
						if (prop === 'postMessage') {
							patchedPostMessage = (message, transfer) => value.call(target, message, transfer);
						} else {
							obj[prop] = value;
						}
						return true;
					},
					get: (obj, prop) => {
						if (prop === 'postMessage') {
							return patchedPostMessage;
						}
						return obj[prop];
					},
				});

				const originalAddEventListener = window.addEventListener.bind(window);
				window.addEventListener = (type, listener, options) => {
					if (type === 'message') {
						const originalListener = listener;
						const wrappedListener = (event) => {
							if (event.source.origin === document.location.origin && event.source !== window) { event = setMessageSource(event, window.parent); }
							originalListener(event);
						};
						wrappedFns.set(originalListener, wrappedListener);
						listener = wrappedListener;
					}

					return originalAddEventListener(type, listener, options);
				};

				const originalRemoveEventListener = window.removeEventListener.bind(window);
				window.removeEventListener = (type, listener, options) => {
					const wrappedListener = wrappedFns.get(listener) || listener;
					return originalRemoveEventListener(type, wrappedListener, options);
				};

				window.parent = wrap(window.parent);
			})();<\/script>
		`;
    return this._prependToHead(html, cspTag + postMessageRehoist);
  }
  _prependToHead(html, content) {
    const headMatch = html.match(/<head[^>]*>/i);
    if (headMatch) {
      const insertIndex = headMatch.index + headMatch[0].length;
      return html.slice(0, insertIndex) + "\n" + content + html.slice(insertIndex);
    }
    const htmlMatch = html.match(/<html[^>]*>/i);
    if (htmlMatch) {
      const insertIndex = htmlMatch.index + htmlMatch[0].length;
      return html.slice(0, insertIndex) + "\n<head>" + content + "</head>" + html.slice(insertIndex);
    }
    return `<!DOCTYPE html><html><head>${content}</head><body>${html}</body></html>`;
  }
  /**
   * Handles incoming JSON-RPC messages from the webview.
   */
  async _handleWebviewMessage(message) {
    const request = message;
    const token = this._disposeCts.token;
    try {
      let result = {};
      switch (request.method) {
        case "ui/initialize":
          result = await this._handleInitialize(request.params);
          break;
        case "tools/call":
          result = await this._handleToolsCall(request.params, token);
          break;
        case "resources/read":
          result = await this._handleResourcesRead(request.params, token);
          break;
        case "ping":
          break;
        case "ui/notifications/size-changed":
          this._handleSizeChanged(request.params);
          break;
        case "ui/open-link":
          result = await this._handleOpenLink(request.params);
          break;
        case "ui/request-display-mode":
          break;
        // not supported
        case "ui/notifications/initialized":
          break;
        case "ui/message":
          result = await this._handleUiMessage(request.params);
          break;
        case "notifications/message":
          await this._mcpToolCallUI.log(request.params);
          break;
        default: {
          softAssertNever(request);
          const cast = request;
          if (cast.id !== void 0) {
            await this._sendError(cast.id, -32601, `Method not found: ${cast.method}`);
          }
          return;
        }
      }
      if (hasKey(request, { id: true })) {
        await this._sendResponse(request.id, result);
      }
    } catch (error) {
      this._logService.error(`[MCP App] Error handling ${request.method}:`, error);
      if (hasKey(request, { id: true })) {
        const message2 = error instanceof Error ? error.message : String(error);
        await this._sendError(request.id, -32e3, message2);
      }
    }
  }
  /**
   * Handles the ui/initialize request from the MCP App.
   */
  async _handleInitialize(_params) {
    this._announcedCapabilities = true;
    let args;
    try {
      args = JSON.parse(this.renderData.input);
    } catch {
      args = this.renderData.input;
    }
    const timeout = this._register(disposableTimeout(async () => {
      this._store.delete(timeout);
      await this._sendNotification({
        method: "ui/notifications/tool-input",
        params: { arguments: args }
      });
      if (this.toolInvocation.kind === "toolInvocationSerialized") {
        this._sendToolResult(this.toolInvocation.resultDetails);
      } else if (this.toolInvocation.kind === "toolInvocation") {
        const invocation = this.toolInvocation;
        this._register(autorunSelfDisposable((reader) => {
          const state = invocation.state.read(reader);
          if (state.type === 4) {
            this._sendToolResult(state.resultDetails);
            reader.dispose();
          }
        }));
      }
    }));
    return {
      protocolVersion: McpApps.LATEST_PROTOCOL_VERSION,
      hostInfo: {
        name: this._productService.nameLong,
        version: this._productService.version
      },
      hostCapabilities: {
        openLinks: {},
        serverTools: { listChanged: true },
        serverResources: { listChanged: true },
        logging: {},
        sandbox: {
          csp: this._latestCsp,
          permissions: { clipboardWrite: true }
        }
      },
      hostContext: this.hostContext.get()
    };
  }
  /**
   * Sends the tool result notification when the result becomes available.
   */
  _sendToolResult(resultDetails) {
    if (isToolResultInputOutputDetails(resultDetails) && resultDetails.mcpOutput) {
      this._sendNotification({
        method: "ui/notifications/tool-result",
        params: resultDetails.mcpOutput
      });
    }
  }
  async _handleUiMessage(params) {
    const widget = this._chatWidgetService.getWidgetBySessionResource(this.renderData.sessionResource);
    if (!widget) {
      return { isError: true };
    }
    if (!isFalsyOrWhitespace(widget.getInput())) {
      return { isError: true };
    }
    widget.setInput(params.content.filter((c) => c.type === "text").map((c) => c.text).join("\n\n"));
    widget.attachmentModel.clearAndSetContext(...params.content.map((c, i) => {
      const id = `mcpui-${i}-${Date.now()}`;
      if (c.type === "image") {
        return { kind: "image", value: decodeBase64(c.data).buffer, id, name: "Image" };
      } else if (c.type === "resource_link") {
        const uri = McpResourceURI.fromServer({ id: this.renderData.serverDefinitionId, label: "" }, c.uri);
        return { kind: "file", value: uri, id, name: basename(uri) };
      } else {
        return void 0;
      }
    }).filter(isDefined));
    widget.focusInput();
    return { isError: false };
  }
  _handleSizeChanged(params) {
    if (params.height !== void 0) {
      this._height = params.height;
      this._onDidChangeHeight.fire();
    }
  }
  async _handleOpenLink(params) {
    const ok = await this._openerService.open(params.url);
    return { isError: !ok };
  }
  /**
   * Handles tools/call requests from the MCP App.
   */
  async _handleToolsCall(params, token) {
    if (!params?.name) {
      throw new Error("Missing tool name in tools/call request");
    }
    return this._mcpToolCallUI.callTool(params.name, params.arguments || {}, token);
  }
  /**
   * Handles resources/read requests from the MCP App.
   */
  async _handleResourcesRead(params, token) {
    if (!params?.uri) {
      throw new Error("Missing uri in resources/read request");
    }
    return this._mcpToolCallUI.readResource(params.uri, token);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async _sendResponse(id, result) {
    await this._webview.postMessage({
      jsonrpc: "2.0",
      id,
      result
    });
  }
  async _sendError(id, code, message) {
    await this._webview.postMessage({
      jsonrpc: "2.0",
      id,
      error: { code, message }
    });
  }
  async _sendNotification(message) {
    await this._webview.postMessage({
      jsonrpc: "2.0",
      ...message
    });
  }
  dispose() {
    this._disposeCts.dispose(true);
    super.dispose();
  }
};
ChatMcpAppModel = __decorate([
  __param(5, IInstantiationService),
  __param(6, IChatWidgetService),
  __param(7, IWebviewService),
  __param(8, IStorageService),
  __param(9, ILogService),
  __param(10, IProductService),
  __param(11, IOpenerService)
], ChatMcpAppModel);
export {
  ChatMcpAppModel
};
//# sourceMappingURL=chatMcpAppModel.js.map
