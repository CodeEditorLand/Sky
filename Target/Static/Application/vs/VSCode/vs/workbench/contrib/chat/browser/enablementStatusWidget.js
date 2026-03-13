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
import { reset } from "../../../../base/browser/dom.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { MarkdownString } from "../../../../base/common/htmlContent.js";
import { Disposable, MutableDisposable } from "../../../../base/common/lifecycle.js";
import { autorun } from "../../../../base/common/observable.js";
import { localize } from "../../../../nls.js";
import { IMarkdownRendererService } from "../../../../platform/markdown/browser/markdownRenderer.js";
let EnablementStatusWidget = class EnablementStatusWidget2 extends Disposable {
  static {
    __name(this, "EnablementStatusWidget");
  }
  constructor(_container, enablement, _labels, _markdownRendererService) {
    super();
    this._container = _container;
    this._labels = _labels;
    this._markdownRendererService = _markdownRendererService;
    this._renderDisposables = this._register(new MutableDisposable());
    this._register(autorun((reader) => {
      this._render(enablement.read(reader));
    }));
  }
  _render(state) {
    reset(this._container);
    this._renderDisposables.value = void 0;
    let message;
    if (state === 0) {
      message = this._labels.disabledProfile;
    } else if (state === 1) {
      message = this._labels.disabledWorkspace;
    }
    if (!message) {
      return;
    }
    const markdown = new MarkdownString("", { isTrusted: true, supportThemeIcons: true });
    markdown.appendMarkdown(`$(${Codicon.info.id})&nbsp;`);
    markdown.appendText(message);
    const rendered = this._markdownRendererService.render(markdown);
    this._renderDisposables.value = rendered;
    this._container.appendChild(rendered.element);
  }
};
EnablementStatusWidget = __decorate([
  __param(3, IMarkdownRendererService)
], EnablementStatusWidget);
const pluginEnablementLabels = {
  disabledProfile: localize("pluginDisabled", "This plugin is disabled."),
  disabledWorkspace: localize("pluginDisabledWorkspace", "This plugin is disabled for this workspace.")
};
const mcpServerEnablementLabels = {
  disabledProfile: localize("mcpServerDisabled", "This MCP server is disabled."),
  disabledWorkspace: localize("mcpServerDisabledWorkspace", "This MCP server is disabled for this workspace.")
};
export {
  EnablementStatusWidget,
  mcpServerEnablementLabels,
  pluginEnablementLabels
};
//# sourceMappingURL=enablementStatusWidget.js.map
