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
import { webContents } from "electron";
import { IAuxiliaryWindowsMainService } from "../../auxiliaryWindow/electron-main/auxiliaryWindows.js";
import { IWindowsMainService } from "../../windows/electron-main/windows.js";
import { createDecorator } from "../../instantiation/common/instantiation.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import { IBrowserViewMainService } from "../../browserView/electron-main/browserViewMainService.js";
const INativeBrowserElementsMainService = createDecorator("browserElementsMainService");
let NativeBrowserElementsMainService = class NativeBrowserElementsMainService2 extends Disposable {
  static {
    __name(this, "NativeBrowserElementsMainService");
  }
  constructor(windowsMainService, auxiliaryWindowsMainService, browserViewMainService) {
    super();
    this.windowsMainService = windowsMainService;
    this.auxiliaryWindowsMainService = auxiliaryWindowsMainService;
    this.browserViewMainService = browserViewMainService;
  }
  get windowId() {
    throw new Error("Not implemented in electron-main");
  }
  /**
   * Find the webview target that matches the given locator.
   * Checks either webviewId or browserViewId depending on what's provided.
   */
  async findWebviewTarget(debuggers, locator) {
    const { targetInfos } = await debuggers.sendCommand("Target.getTargets");
    if (locator.webviewId) {
      let extensionId = "";
      for (const targetInfo of targetInfos) {
        try {
          const url = new URL(targetInfo.url);
          if (url.searchParams.get("id") === locator.webviewId) {
            extensionId = url.searchParams.get("extensionId") || "";
            break;
          }
        } catch (err) {
        }
      }
      if (!extensionId) {
        return void 0;
      }
      const target = targetInfos.find((targetInfo) => {
        try {
          const url = new URL(targetInfo.url);
          const isLiveServer = extensionId === "ms-vscode.live-server" && url.searchParams.get("serverWindowId") === locator.webviewId;
          const isSimpleBrowser = extensionId === "vscode.simple-browser" && url.searchParams.get("id") === locator.webviewId && url.searchParams.has("vscodeBrowserReqId");
          if (isLiveServer || isSimpleBrowser) {
            return true;
          }
          return false;
        } catch (e) {
          return false;
        }
      });
      return target?.targetId;
    }
    if (locator.browserViewId) {
      const webContentsInstance = this.browserViewMainService.tryGetBrowserView(locator.browserViewId)?.webContents;
      const target = targetInfos.find((targetInfo) => {
        if (targetInfo.type !== "page") {
          return false;
        }
        return webContents.fromDevToolsTargetId(targetInfo.targetId) === webContentsInstance;
      });
      return target?.targetId;
    }
    return void 0;
  }
  async waitForWebviewTargets(debuggers, locator) {
    const start = Date.now();
    const timeout = 1e4;
    while (Date.now() - start < timeout) {
      const targetId = await this.findWebviewTarget(debuggers, locator);
      if (targetId) {
        return targetId;
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    debuggers.detach();
    return void 0;
  }
  async startDebugSession(windowId, token, locator, cancelAndDetachId) {
    const window = this.windowById(windowId);
    if (!window?.win) {
      return void 0;
    }
    const allWebContents = webContents.getAllWebContents();
    const simpleBrowserWebview = allWebContents.find((webContent) => webContent.id === window.id);
    if (!simpleBrowserWebview) {
      return void 0;
    }
    const debuggers = simpleBrowserWebview.debugger;
    if (!debuggers.isAttached()) {
      debuggers.attach();
    }
    try {
      const matchingTargetId = await this.waitForWebviewTargets(debuggers, locator);
      if (!matchingTargetId) {
        if (debuggers.isAttached()) {
          debuggers.detach();
        }
        throw new Error("No target found");
      }
    } catch (e) {
      if (debuggers.isAttached()) {
        debuggers.detach();
      }
      throw new Error("No target found");
    }
    window.win.webContents.on("ipc-message", async (event, channel, closedCancelAndDetachId) => {
      if (channel === `vscode:cancelCurrentSession${cancelAndDetachId}`) {
        if (cancelAndDetachId !== closedCancelAndDetachId) {
          return;
        }
        if (debuggers.isAttached()) {
          debuggers.detach();
        }
        if (window.win) {
          window.win.webContents.removeAllListeners("ipc-message");
        }
      }
    });
  }
  async finishOverlay(debuggers, sessionId) {
    if (debuggers.isAttached() && sessionId) {
      await debuggers.sendCommand("Overlay.setInspectMode", {
        mode: "none",
        highlightConfig: {
          showInfo: false,
          showStyles: false
        }
      }, sessionId);
      await debuggers.sendCommand("Overlay.hideHighlight", {}, sessionId);
      await debuggers.sendCommand("Overlay.disable", {}, sessionId);
      debuggers.detach();
    }
  }
  async getElementData(windowId, rect, token, locator, cancellationId) {
    const window = this.windowById(windowId);
    if (!window?.win) {
      return void 0;
    }
    const allWebContents = webContents.getAllWebContents();
    const simpleBrowserWebview = allWebContents.find((webContent) => webContent.id === window.id);
    if (!simpleBrowserWebview) {
      return void 0;
    }
    const debuggers = simpleBrowserWebview.debugger;
    if (!debuggers.isAttached()) {
      debuggers.attach();
    }
    let targetSessionId = void 0;
    try {
      const targetId = await this.findWebviewTarget(debuggers, locator);
      const { sessionId } = await debuggers.sendCommand("Target.attachToTarget", {
        targetId,
        flatten: true
      });
      targetSessionId = sessionId;
      await debuggers.sendCommand("DOM.enable", {}, sessionId);
      await debuggers.sendCommand("CSS.enable", {}, sessionId);
      await debuggers.sendCommand("Overlay.enable", {}, sessionId);
      await debuggers.sendCommand("Debugger.enable", {}, sessionId);
      await debuggers.sendCommand("Runtime.enable", {}, sessionId);
      await debuggers.sendCommand("Runtime.evaluate", {
        expression: `(function() {
							const style = document.createElement('style');
							style.id = '__pseudoBlocker__';
							style.textContent = '*::before, *::after { pointer-events: none !important; }';
							document.head.appendChild(style);
						})();`
      }, sessionId);
      await debuggers.sendCommand("Overlay.setInspectMode", {
        mode: "searchForNode",
        highlightConfig: {
          showInfo: true,
          showRulers: false,
          showStyles: true,
          showAccessibilityInfo: true,
          showExtensionLines: false,
          contrastAlgorithm: "aa",
          contentColor: { r: 173, g: 216, b: 255, a: 0.8 },
          paddingColor: { r: 150, g: 200, b: 255, a: 0.5 },
          borderColor: { r: 120, g: 180, b: 255, a: 0.7 },
          marginColor: { r: 200, g: 220, b: 255, a: 0.4 },
          eventTargetColor: { r: 130, g: 160, b: 255, a: 0.8 },
          shapeColor: { r: 130, g: 160, b: 255, a: 0.8 },
          shapeMarginColor: { r: 130, g: 160, b: 255, a: 0.5 },
          gridHighlightConfig: {
            rowGapColor: { r: 140, g: 190, b: 255, a: 0.3 },
            rowHatchColor: { r: 140, g: 190, b: 255, a: 0.7 },
            columnGapColor: { r: 140, g: 190, b: 255, a: 0.3 },
            columnHatchColor: { r: 140, g: 190, b: 255, a: 0.7 },
            rowLineColor: { r: 120, g: 180, b: 255 },
            columnLineColor: { r: 120, g: 180, b: 255 },
            rowLineDash: true,
            columnLineDash: true
          },
          flexContainerHighlightConfig: {
            containerBorder: {
              color: { r: 120, g: 180, b: 255 },
              pattern: "solid"
            },
            itemSeparator: {
              color: { r: 140, g: 190, b: 255 },
              pattern: "solid"
            },
            lineSeparator: {
              color: { r: 140, g: 190, b: 255 },
              pattern: "solid"
            },
            mainDistributedSpace: {
              hatchColor: { r: 140, g: 190, b: 255, a: 0.7 },
              fillColor: { r: 140, g: 190, b: 255, a: 0.4 }
            },
            crossDistributedSpace: {
              hatchColor: { r: 140, g: 190, b: 255, a: 0.7 },
              fillColor: { r: 140, g: 190, b: 255, a: 0.4 }
            },
            rowGapSpace: {
              hatchColor: { r: 140, g: 190, b: 255, a: 0.7 },
              fillColor: { r: 140, g: 190, b: 255, a: 0.4 }
            },
            columnGapSpace: {
              hatchColor: { r: 140, g: 190, b: 255, a: 0.7 },
              fillColor: { r: 140, g: 190, b: 255, a: 0.4 }
            }
          },
          flexItemHighlightConfig: {
            baseSizeBox: {
              hatchColor: { r: 130, g: 170, b: 255, a: 0.6 }
            },
            baseSizeBorder: {
              color: { r: 120, g: 180, b: 255 },
              pattern: "solid"
            },
            flexibilityArrow: {
              color: { r: 130, g: 190, b: 255 }
            }
          }
        }
      }, sessionId);
    } catch (e) {
      debuggers.detach();
      throw new Error("No target found", e);
    }
    if (!targetSessionId) {
      debuggers.detach();
      throw new Error("No target session id found");
    }
    const nodeData = await this.getNodeData(targetSessionId, debuggers, window.win, cancellationId);
    await this.finishOverlay(debuggers, targetSessionId);
    const zoomFactor = simpleBrowserWebview.getZoomFactor();
    const absoluteBounds = {
      x: rect.x + nodeData.bounds.x,
      y: rect.y + nodeData.bounds.y,
      width: nodeData.bounds.width,
      height: nodeData.bounds.height
    };
    const clippedBounds = {
      x: Math.max(absoluteBounds.x, rect.x),
      y: Math.max(absoluteBounds.y, rect.y),
      width: Math.max(0, Math.min(absoluteBounds.x + absoluteBounds.width, rect.x + rect.width) - Math.max(absoluteBounds.x, rect.x)),
      height: Math.max(0, Math.min(absoluteBounds.y + absoluteBounds.height, rect.y + rect.height) - Math.max(absoluteBounds.y, rect.y))
    };
    const scaledBounds = {
      x: clippedBounds.x * zoomFactor,
      y: clippedBounds.y * zoomFactor,
      width: clippedBounds.width * zoomFactor,
      height: clippedBounds.height * zoomFactor
    };
    return { outerHTML: nodeData.outerHTML, computedStyle: nodeData.computedStyle, bounds: scaledBounds };
  }
  async getNodeData(sessionId, debuggers, window, cancellationId) {
    return new Promise((resolve, reject) => {
      const onMessage = /* @__PURE__ */ __name(async (event, method, params) => {
        if (method === "Overlay.inspectNodeRequested") {
          debuggers.off("message", onMessage);
          await debuggers.sendCommand("Runtime.evaluate", {
            expression: `(() => {
										const style = document.getElementById('__pseudoBlocker__');
										if (style) style.remove();
									})();`
          }, sessionId);
          const backendNodeId = params?.backendNodeId;
          if (!backendNodeId) {
            throw new Error("Missing backendNodeId in inspectNodeRequested event");
          }
          try {
            await debuggers.sendCommand("DOM.getDocument", {}, sessionId);
            const { nodeIds } = await debuggers.sendCommand("DOM.pushNodesByBackendIdsToFrontend", { backendNodeIds: [backendNodeId] }, sessionId);
            if (!nodeIds || nodeIds.length === 0) {
              throw new Error("Failed to get node IDs.");
            }
            const nodeId = nodeIds[0];
            const { model } = await debuggers.sendCommand("DOM.getBoxModel", { nodeId }, sessionId);
            if (!model) {
              throw new Error("Failed to get box model.");
            }
            const content = model.content;
            const margin = model.margin;
            const x = Math.min(margin[0], content[0]);
            const y = Math.min(margin[1], content[1]);
            const width = Math.max(margin[2] - margin[0], content[2] - content[0]);
            const height = Math.max(margin[5] - margin[1], content[5] - content[1]);
            const matched = await debuggers.sendCommand("CSS.getMatchedStylesForNode", { nodeId }, sessionId);
            if (!matched) {
              throw new Error("Failed to get matched css.");
            }
            const formatted = this.formatMatchedStyles(matched);
            const { outerHTML } = await debuggers.sendCommand("DOM.getOuterHTML", { nodeId }, sessionId);
            if (!outerHTML) {
              throw new Error("Failed to get outerHTML.");
            }
            resolve({
              outerHTML,
              computedStyle: formatted,
              bounds: { x, y, width, height }
            });
          } catch (err) {
            debuggers.off("message", onMessage);
            debuggers.detach();
            reject(err);
          }
        }
      }, "onMessage");
      window.webContents.on("ipc-message", async (event, channel, closedCancellationId) => {
        if (channel === `vscode:cancelElementSelection${cancellationId}`) {
          if (cancellationId !== closedCancellationId) {
            return;
          }
          debuggers.off("message", onMessage);
          await this.finishOverlay(debuggers, sessionId);
          window.webContents.removeAllListeners("ipc-message");
        }
      });
      debuggers.on("message", onMessage);
    });
  }
  formatMatchedStyles(matched) {
    const lines = [];
    if (matched.inlineStyle?.cssProperties?.length) {
      lines.push("/* Inline style */");
      lines.push("element {");
      for (const prop of matched.inlineStyle.cssProperties) {
        if (prop.name && prop.value) {
          lines.push(`  ${prop.name}: ${prop.value};`);
        }
      }
      lines.push("}\n");
    }
    if (matched.matchedCSSRules?.length) {
      for (const ruleEntry of matched.matchedCSSRules) {
        const rule = ruleEntry.rule;
        const selectors = rule.selectorList.selectors.map((s) => s.text).join(", ");
        lines.push(`/* Matched Rule from ${rule.origin} */`);
        lines.push(`${selectors} {`);
        for (const prop of rule.style.cssProperties) {
          if (prop.name && prop.value) {
            lines.push(`  ${prop.name}: ${prop.value};`);
          }
        }
        lines.push("}\n");
      }
    }
    if (matched.inherited?.length) {
      let level = 1;
      for (const inherited of matched.inherited) {
        const inline = inherited.inlineStyle;
        if (inline) {
          lines.push(`/* Inherited from ancestor level ${level} (inline) */`);
          lines.push("element {");
          lines.push(inline.cssText);
          lines.push("}\n");
        }
        const rules = inherited.matchedCSSRules || [];
        for (const ruleEntry of rules) {
          const rule = ruleEntry.rule;
          const selectors = rule.selectorList.selectors.map((s) => s.text).join(", ");
          lines.push(`/* Inherited from ancestor level ${level} (${rule.origin}) */`);
          lines.push(`${selectors} {`);
          for (const prop of rule.style.cssProperties) {
            if (prop.name && prop.value) {
              lines.push(`  ${prop.name}: ${prop.value};`);
            }
          }
          lines.push("}\n");
        }
        level++;
      }
    }
    return "\n" + lines.join("\n");
  }
  windowById(windowId, fallbackCodeWindowId) {
    return this.codeWindowById(windowId) ?? this.auxiliaryWindowById(windowId) ?? this.codeWindowById(fallbackCodeWindowId);
  }
  codeWindowById(windowId) {
    if (typeof windowId !== "number") {
      return void 0;
    }
    return this.windowsMainService.getWindowById(windowId);
  }
  auxiliaryWindowById(windowId) {
    if (typeof windowId !== "number") {
      return void 0;
    }
    const contents = webContents.fromId(windowId);
    if (!contents) {
      return void 0;
    }
    return this.auxiliaryWindowsMainService.getWindowByWebContents(contents);
  }
};
NativeBrowserElementsMainService = __decorate([
  __param(0, IWindowsMainService),
  __param(1, IAuxiliaryWindowsMainService),
  __param(2, IBrowserViewMainService)
], NativeBrowserElementsMainService);
export {
  INativeBrowserElementsMainService,
  NativeBrowserElementsMainService
};
//# sourceMappingURL=nativeBrowserElementsMainService.js.map
