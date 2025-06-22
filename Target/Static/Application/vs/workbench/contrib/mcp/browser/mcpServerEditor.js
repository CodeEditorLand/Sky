var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { $, addDisposableListener, append, clearNode, setParentFlowTo } from "../../../../base/browser/dom.js";
import { ActionBar } from "../../../../base/browser/ui/actionbar/actionbar.js";
import { getDefaultHoverDelegate } from "../../../../base/browser/ui/hover/hoverDelegateFactory.js";
import { DomScrollableElement } from "../../../../base/browser/ui/scrollbar/scrollableElement.js";
import { Action } from "../../../../base/common/actions.js";
import * as arrays from "../../../../base/common/arrays.js";
import { Cache } from "../../../../base/common/cache.js";
import { CancellationTokenSource } from "../../../../base/common/cancellation.js";
import { isCancellationError } from "../../../../base/common/errors.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { Disposable, DisposableStore, MutableDisposable, dispose, toDisposable } from "../../../../base/common/lifecycle.js";
import { Schemas, matchesScheme } from "../../../../base/common/network.js";
import { language } from "../../../../base/common/platform.js";
import { URI } from "../../../../base/common/uri.js";
import { generateUuid } from "../../../../base/common/uuid.js";
import { TokenizationRegistry } from "../../../../editor/common/languages.js";
import { ILanguageService } from "../../../../editor/common/languages/language.js";
import { generateTokensCSSForColorMap } from "../../../../editor/common/languages/supports/tokenization.js";
import { localize } from "../../../../nls.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { INotificationService } from "../../../../platform/notification/common/notification.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { EditorPane } from "../../../browser/parts/editor/editorPane.js";
import { DEFAULT_MARKDOWN_STYLES, renderMarkdownDocument } from "../../markdown/browser/markdownDocumentRenderer.js";
import { IWebviewService } from "../../webview/browser/webview.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.js";
import { McpServerContainers, mcpServerIcon } from "../common/mcpTypes.js";
import { InstallCountWidget, onClick, PublisherWidget, RatingsWidget } from "./mcpServerWidgets.js";
import { DropDownAction, InstallAction, ManageMcpServerAction, UninstallAction } from "./mcpServerActions.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
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
var McpServerEditor_1;
var McpServerEditorTab;
(function(McpServerEditorTab2) {
  McpServerEditorTab2["Readme"] = "readme";
})(McpServerEditorTab || (McpServerEditorTab = {}));
function toDateString(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}, ${date.toLocaleTimeString(language, { hourCycle: "h23" })}`;
}
__name(toDateString, "toDateString");
class NavBar extends Disposable {
  static {
    __name(this, "NavBar");
  }
  get onChange() {
    return this._onChange.event;
  }
  get currentId() {
    return this._currentId;
  }
  constructor(container) {
    super();
    this._onChange = this._register(new Emitter());
    this._currentId = null;
    const element = append(container, $(".navbar"));
    this.actions = [];
    this.actionbar = this._register(new ActionBar(element));
  }
  push(id, label, tooltip) {
    const action = new Action(id, label, void 0, true, () => this.update(id, true));
    action.tooltip = tooltip;
    this.actions.push(action);
    this.actionbar.push(action);
    if (this.actions.length === 1) {
      this.update(id);
    }
  }
  clear() {
    this.actions = dispose(this.actions);
    this.actionbar.clear();
  }
  switch(id) {
    const action = this.actions.find((action2) => action2.id === id);
    if (action) {
      action.run();
      return true;
    }
    return false;
  }
  update(id, focus) {
    this._currentId = id;
    this._onChange.fire({ id, focus: !!focus });
    this.actions.forEach((a) => a.checked = a.id === id);
  }
}
var WebviewIndex;
(function(WebviewIndex2) {
  WebviewIndex2[WebviewIndex2["Readme"] = 0] = "Readme";
  WebviewIndex2[WebviewIndex2["Changelog"] = 1] = "Changelog";
})(WebviewIndex || (WebviewIndex = {}));
let McpServerEditor = class McpServerEditor2 extends EditorPane {
  static {
    __name(this, "McpServerEditor");
  }
  static {
    McpServerEditor_1 = this;
  }
  static {
    this.ID = "workbench.editor.mcpServer";
  }
  constructor(group, telemetryService, instantiationService, themeService, notificationService, openerService, storageService, extensionService, webviewService, languageService, contextKeyService, hoverService) {
    super(McpServerEditor_1.ID, group, telemetryService, themeService, storageService);
    this.instantiationService = instantiationService;
    this.notificationService = notificationService;
    this.openerService = openerService;
    this.extensionService = extensionService;
    this.webviewService = webviewService;
    this.languageService = languageService;
    this.contextKeyService = contextKeyService;
    this.hoverService = hoverService;
    this._scopedContextKeyService = this._register(new MutableDisposable());
    this.initialScrollProgress = /* @__PURE__ */ new Map();
    this.currentIdentifier = "";
    this.layoutParticipants = [];
    this.contentDisposables = this._register(new DisposableStore());
    this.transientDisposables = this._register(new DisposableStore());
    this.activeElement = null;
    this.mcpServerReadme = null;
  }
  get scopedContextKeyService() {
    return this._scopedContextKeyService.value;
  }
  createEditor(parent) {
    const root = append(parent, $(".extension-editor"));
    this._scopedContextKeyService.value = this.contextKeyService.createScoped(root);
    this._scopedContextKeyService.value.createKey("inExtensionEditor", true);
    root.tabIndex = 0;
    root.style.outline = "none";
    root.setAttribute("role", "document");
    const header = append(root, $(".header"));
    const iconContainer = append(header, $(".icon-container"));
    const details = append(header, $(".details"));
    const title = append(details, $(".title"));
    const name = append(title, $("span.name.clickable", { role: "heading", tabIndex: 0 }));
    this._register(this.hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), name, localize("name", "Extension name")));
    const subtitle = append(details, $(".subtitle"));
    const subTitleEntryContainers = [];
    const publisherContainer = append(subtitle, $(".subtitle-entry"));
    subTitleEntryContainers.push(publisherContainer);
    const publisherWidget = this.instantiationService.createInstance(PublisherWidget, publisherContainer, false);
    const installCountContainer = append(subtitle, $(".subtitle-entry"));
    subTitleEntryContainers.push(installCountContainer);
    const installCountWidget = this.instantiationService.createInstance(InstallCountWidget, installCountContainer, false);
    const ratingsContainer = append(subtitle, $(".subtitle-entry"));
    subTitleEntryContainers.push(ratingsContainer);
    const ratingsWidget = this.instantiationService.createInstance(RatingsWidget, ratingsContainer, false);
    const widgets = [
      publisherWidget,
      installCountWidget,
      ratingsWidget
    ];
    const description = append(details, $(".description"));
    const actions = [
      this.instantiationService.createInstance(InstallAction),
      this.instantiationService.createInstance(UninstallAction),
      this.instantiationService.createInstance(ManageMcpServerAction, true)
    ];
    const actionsAndStatusContainer = append(details, $(".actions-status-container.mcp-server-actions"));
    const actionBar = this._register(new ActionBar(actionsAndStatusContainer, {
      actionViewItemProvider: /* @__PURE__ */ __name((action, options) => {
        if (action instanceof DropDownAction) {
          return action.createActionViewItem(options);
        }
        return void 0;
      }, "actionViewItemProvider"),
      focusOnlyEnabledItems: true
    }));
    actionBar.push(actions, { icon: true, label: true });
    actionBar.setFocusable(true);
    this._register(Event.any(...actions.map((a) => Event.filter(a.onDidChange, (e) => e.enabled !== void 0)))(() => {
      actionBar.setFocusable(false);
      actionBar.setFocusable(true);
    }));
    const mcpServerContainers = this.instantiationService.createInstance(McpServerContainers, [...actions, ...widgets]);
    for (const disposable of [...actions, ...widgets, mcpServerContainers]) {
      this._register(disposable);
    }
    const onError = Event.chain(actionBar.onDidRun, ($2) => $2.map(({ error }) => error).filter((error) => !!error));
    this._register(onError(this.onError, this));
    const body = append(root, $(".body"));
    const navbar = new NavBar(body);
    const content = append(body, $(".content"));
    content.id = generateUuid();
    this.template = {
      content,
      description,
      header,
      iconContainer,
      name,
      navbar,
      actionsAndStatusContainer,
      actionBar,
      set mcpServer(mcpServer) {
        mcpServerContainers.mcpServer = mcpServer;
        let lastNonEmptySubtitleEntryContainer;
        for (const subTitleEntryElement of subTitleEntryContainers) {
          subTitleEntryElement.classList.remove("last-non-empty");
          if (subTitleEntryElement.children.length > 0) {
            lastNonEmptySubtitleEntryContainer = subTitleEntryElement;
          }
        }
        if (lastNonEmptySubtitleEntryContainer) {
          lastNonEmptySubtitleEntryContainer.classList.add("last-non-empty");
        }
      }
    };
  }
  async setInput(input, options, context, token) {
    await super.setInput(input, options, context, token);
    if (this.template) {
      await this.render(input.mcpServer, this.template, !!options?.preserveFocus);
    }
  }
  async render(mcpServer, template, preserveFocus) {
    this.activeElement = null;
    this.transientDisposables.clear();
    const token = this.transientDisposables.add(new CancellationTokenSource()).token;
    this.mcpServerReadme = new Cache(() => mcpServer.getReadme(token));
    template.mcpServer = mcpServer;
    clearNode(template.iconContainer);
    if (mcpServer.iconUrl) {
      const icon = append(template.iconContainer, $("img.icon", { alt: "" }));
      this.transientDisposables.add(addDisposableListener(icon, "error", () => {
        clearNode(template.iconContainer);
        append(template.iconContainer, $(ThemeIcon.asCSSSelector(mcpServerIcon)));
      }, { once: true }));
      icon.src = mcpServer.iconUrl;
    } else {
      append(template.iconContainer, $(ThemeIcon.asCSSSelector(mcpServerIcon)));
    }
    template.name.textContent = mcpServer.label;
    template.name.classList.toggle("clickable", !!mcpServer.url);
    template.description.textContent = mcpServer.description;
    if (mcpServer.url) {
      this.transientDisposables.add(onClick(template.name, () => this.openerService.open(URI.parse(mcpServer.url))));
    }
    this.renderNavbar(mcpServer, template, preserveFocus);
  }
  renderNavbar(extension, template, preserveFocus) {
    template.content.innerText = "";
    template.navbar.clear();
    if (this.currentIdentifier !== extension.id) {
      this.initialScrollProgress.clear();
      this.currentIdentifier = extension.id;
    }
    template.navbar.push("readme", localize("details", "Details"), localize("detailstooltip", "Extension details, rendered from the extension's 'README.md' file"));
    if (template.navbar.currentId) {
      this.onNavbarChange(extension, { id: template.navbar.currentId, focus: !preserveFocus }, template);
    }
    template.navbar.onChange((e) => this.onNavbarChange(extension, e, template), this, this.transientDisposables);
  }
  clearInput() {
    this.contentDisposables.clear();
    this.transientDisposables.clear();
    super.clearInput();
  }
  focus() {
    super.focus();
    this.activeElement?.focus();
  }
  showFind() {
    this.activeWebview?.showFind();
  }
  runFindAction(previous) {
    this.activeWebview?.runFindAction(previous);
  }
  get activeWebview() {
    if (!this.activeElement || !this.activeElement.runFindAction) {
      return void 0;
    }
    return this.activeElement;
  }
  onNavbarChange(extension, { id, focus }, template) {
    this.contentDisposables.clear();
    template.content.innerText = "";
    this.activeElement = null;
    if (id) {
      const cts = new CancellationTokenSource();
      this.contentDisposables.add(toDisposable(() => cts.dispose(true)));
      this.open(id, extension, template, cts.token).then((activeElement) => {
        if (cts.token.isCancellationRequested) {
          return;
        }
        this.activeElement = activeElement;
        if (focus) {
          this.focus();
        }
      });
    }
  }
  open(id, extension, template, token) {
    switch (id) {
      case "readme":
        return this.openDetails(extension, template, token);
    }
    return Promise.resolve(null);
  }
  async openMarkdown(extension, cacheResult, noContentCopy, container, webviewIndex, title, token) {
    try {
      const body = await this.renderMarkdown(extension, cacheResult, container, token);
      if (token.isCancellationRequested) {
        return Promise.resolve(null);
      }
      const webview = this.contentDisposables.add(this.webviewService.createWebviewOverlay({
        title,
        options: {
          enableFindWidget: true,
          tryRestoreScrollPosition: true,
          disableServiceWorker: true
        },
        contentOptions: {},
        extension: void 0
      }));
      webview.initialScrollProgress = this.initialScrollProgress.get(webviewIndex) || 0;
      webview.claim(this, this.window, this.scopedContextKeyService);
      setParentFlowTo(webview.container, container);
      webview.layoutWebviewOverElement(container);
      webview.setHtml(body);
      webview.claim(this, this.window, void 0);
      this.contentDisposables.add(webview.onDidFocus(() => this._onDidFocus?.fire()));
      this.contentDisposables.add(webview.onDidScroll(() => this.initialScrollProgress.set(webviewIndex, webview.initialScrollProgress)));
      const removeLayoutParticipant = arrays.insert(this.layoutParticipants, {
        layout: /* @__PURE__ */ __name(() => {
          webview.layoutWebviewOverElement(container);
        }, "layout")
      });
      this.contentDisposables.add(toDisposable(removeLayoutParticipant));
      let isDisposed = false;
      this.contentDisposables.add(toDisposable(() => {
        isDisposed = true;
      }));
      this.contentDisposables.add(this.themeService.onDidColorThemeChange(async () => {
        const body2 = await this.renderMarkdown(extension, cacheResult, container);
        if (!isDisposed) {
          webview.setHtml(body2);
        }
      }));
      this.contentDisposables.add(webview.onDidClickLink((link) => {
        if (!link) {
          return;
        }
        if (matchesScheme(link, Schemas.http) || matchesScheme(link, Schemas.https) || matchesScheme(link, Schemas.mailto)) {
          this.openerService.open(link);
        }
      }));
      return webview;
    } catch (e) {
      const p = append(container, $("p.nocontent"));
      p.textContent = noContentCopy;
      return p;
    }
  }
  async renderMarkdown(extension, cacheResult, container, token) {
    const contents = await this.loadContents(() => cacheResult, container);
    if (token?.isCancellationRequested) {
      return "";
    }
    const content = await renderMarkdownDocument(contents, this.extensionService, this.languageService, { shouldSanitize: true, token });
    if (token?.isCancellationRequested) {
      return "";
    }
    return this.renderBody(content);
  }
  renderBody(body) {
    const nonce = generateUuid();
    const colorMap = TokenizationRegistry.getColorMap();
    const css = colorMap ? generateTokensCSSForColorMap(colorMap) : "";
    return `<!DOCTYPE html>
		<html>
			<head>
				<meta http-equiv="Content-type" content="text/html;charset=UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src https: data:; media-src https:; script-src 'none'; style-src 'nonce-${nonce}';">
				<style nonce="${nonce}">
					${DEFAULT_MARKDOWN_STYLES}

					/* prevent scroll-to-top button from blocking the body text */
					body {
						padding-bottom: 75px;
					}

					#scroll-to-top {
						position: fixed;
						width: 32px;
						height: 32px;
						right: 25px;
						bottom: 25px;
						background-color: var(--vscode-button-secondaryBackground);
						border-color: var(--vscode-button-border);
						border-radius: 50%;
						cursor: pointer;
						box-shadow: 1px 1px 1px rgba(0,0,0,.25);
						outline: none;
						display: flex;
						justify-content: center;
						align-items: center;
					}

					#scroll-to-top:hover {
						background-color: var(--vscode-button-secondaryHoverBackground);
						box-shadow: 2px 2px 2px rgba(0,0,0,.25);
					}

					body.vscode-high-contrast #scroll-to-top {
						border-width: 2px;
						border-style: solid;
						box-shadow: none;
					}

					#scroll-to-top span.icon::before {
						content: "";
						display: block;
						background: var(--vscode-button-secondaryForeground);
						/* Chevron up icon */
						webkit-mask-image: url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjIuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCAxNiAxNiIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMTYgMTY7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPHN0eWxlIHR5cGU9InRleHQvY3NzIj4KCS5zdDB7ZmlsbDojRkZGRkZGO30KCS5zdDF7ZmlsbDpub25lO30KPC9zdHlsZT4KPHRpdGxlPnVwY2hldnJvbjwvdGl0bGU+CjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik04LDUuMWwtNy4zLDcuM0wwLDExLjZsOC04bDgsOGwtMC43LDAuN0w4LDUuMXoiLz4KPHJlY3QgY2xhc3M9InN0MSIgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2Ii8+Cjwvc3ZnPgo=');
						-webkit-mask-image: url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjIuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCAxNiAxNiIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMTYgMTY7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPHN0eWxlIHR5cGU9InRleHQvY3NzIj4KCS5zdDB7ZmlsbDojRkZGRkZGO30KCS5zdDF7ZmlsbDpub25lO30KPC9zdHlsZT4KPHRpdGxlPnVwY2hldnJvbjwvdGl0bGU+CjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik04LDUuMWwtNy4zLDcuM0wwLDExLjZsOC04bDgsOGwtMC43LDAuN0w4LDUuMXoiLz4KPHJlY3QgY2xhc3M9InN0MSIgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2Ii8+Cjwvc3ZnPgo=');
						width: 16px;
						height: 16px;
					}
					${css}
				</style>
			</head>
			<body>
				<a id="scroll-to-top" role="button" aria-label="scroll to top" href="#"><span class="icon"></span></a>
				${body}
			</body>
		</html>`;
  }
  async openDetails(extension, template, token) {
    const details = append(template.content, $(".details"));
    const readmeContainer = append(details, $(".readme-container"));
    const additionalDetailsContainer = append(details, $(".additional-details-container"));
    const layout = /* @__PURE__ */ __name(() => details.classList.toggle("narrow", this.dimension && this.dimension.width < 500), "layout");
    layout();
    this.contentDisposables.add(toDisposable(arrays.insert(this.layoutParticipants, { layout })));
    const activeElement = await this.openMarkdown(extension, this.mcpServerReadme.get(), localize("noReadme", "No README available."), readmeContainer, 0, localize("Readme title", "Readme"), token);
    this.renderAdditionalDetails(additionalDetailsContainer, extension);
    return activeElement;
  }
  renderAdditionalDetails(container, extension) {
    const content = $("div", { class: "additional-details-content", tabindex: "0" });
    const scrollableContent = new DomScrollableElement(content, {});
    const layout = /* @__PURE__ */ __name(() => scrollableContent.scanDomNode(), "layout");
    const removeLayoutParticipant = arrays.insert(this.layoutParticipants, { layout });
    this.contentDisposables.add(toDisposable(removeLayoutParticipant));
    this.contentDisposables.add(scrollableContent);
    this.contentDisposables.add(this.instantiationService.createInstance(AdditionalDetailsWidget, content, extension));
    append(container, scrollableContent.getDomNode());
    scrollableContent.scanDomNode();
  }
  loadContents(loadingTask, container) {
    container.classList.add("loading");
    const result = this.contentDisposables.add(loadingTask());
    const onDone = /* @__PURE__ */ __name(() => container.classList.remove("loading"), "onDone");
    result.promise.then(onDone, onDone);
    return result.promise;
  }
  layout(dimension) {
    this.dimension = dimension;
    this.layoutParticipants.forEach((p) => p.layout());
  }
  onError(err) {
    if (isCancellationError(err)) {
      return;
    }
    this.notificationService.error(err);
  }
};
McpServerEditor = McpServerEditor_1 = __decorate([
  __param(1, ITelemetryService),
  __param(2, IInstantiationService),
  __param(3, IThemeService),
  __param(4, INotificationService),
  __param(5, IOpenerService),
  __param(6, IStorageService),
  __param(7, IExtensionService),
  __param(8, IWebviewService),
  __param(9, ILanguageService),
  __param(10, IContextKeyService),
  __param(11, IHoverService)
], McpServerEditor);
let AdditionalDetailsWidget = class AdditionalDetailsWidget2 extends Disposable {
  static {
    __name(this, "AdditionalDetailsWidget");
  }
  constructor(container, extension, hoverService, openerService) {
    super();
    this.container = container;
    this.hoverService = hoverService;
    this.openerService = openerService;
    this.disposables = this._register(new DisposableStore());
    this.render(extension);
  }
  render(extension) {
    this.container.innerText = "";
    this.disposables.clear();
    if (extension.local) {
      this.renderInstallInfo(this.container, extension.local);
    }
    if (extension.gallery) {
      this.renderMarketplaceInfo(this.container, extension);
    }
    this.renderExtensionResources(this.container, extension);
  }
  renderExtensionResources(container, extension) {
    const resources = [];
    if (extension.repository) {
      try {
        resources.push([localize("repository", "Repository"), URI.parse(extension.repository)]);
      } catch (error) {
      }
    }
    if (extension.publisherUrl && extension.publisherDisplayName) {
      resources.push([extension.publisherDisplayName, URI.parse(extension.publisherUrl)]);
    }
    if (resources.length) {
      const extensionResourcesContainer = append(container, $(".resources-container.additional-details-element"));
      append(extensionResourcesContainer, $(".additional-details-title", void 0, localize("resources", "Resources")));
      const resourcesElement = append(extensionResourcesContainer, $(".resources"));
      for (const [label, uri] of resources) {
        const resource = append(resourcesElement, $("a.resource", { tabindex: "0" }, label));
        this.disposables.add(onClick(resource, () => this.openerService.open(uri)));
        this.disposables.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), resource, uri.toString()));
      }
    }
  }
  renderInstallInfo(container, extension) {
    const installInfoContainer = append(container, $(".more-info-container.additional-details-element"));
    append(installInfoContainer, $(".additional-details-title", void 0, localize("Install Info", "Installation")));
    const installInfo = append(installInfoContainer, $(".more-info"));
    append(installInfo, $(".more-info-entry", void 0, $("div.more-info-entry-name", void 0, localize("id", "Identifier")), $("code", void 0, extension.name)));
    append(installInfo, $(".more-info-entry", void 0, $("div.more-info-entry-name", void 0, localize("Version", "Version")), $("code", void 0, extension.version)));
  }
  renderMarketplaceInfo(container, extension) {
    const gallery = extension.gallery;
    const moreInfoContainer = append(container, $(".more-info-container.additional-details-element"));
    append(moreInfoContainer, $(".additional-details-title", void 0, localize("Marketplace Info", "Marketplace")));
    const moreInfo = append(moreInfoContainer, $(".more-info"));
    if (gallery) {
      if (!extension.local) {
        append(moreInfo, $(".more-info-entry", void 0, $("div.more-info-entry-name", void 0, localize("id", "Identifier")), $("code", void 0, extension.name)));
        append(moreInfo, $(".more-info-entry", void 0, $("div.more-info-entry-name", void 0, localize("Version", "Version")), $("code", void 0, gallery.version)));
      }
      append(moreInfo, $(".more-info-entry", void 0, $("div.more-info-entry-name", void 0, localize("last released", "Last Released")), $("div", void 0, toDateString(new Date(gallery.lastUpdated)))));
    }
  }
};
AdditionalDetailsWidget = __decorate([
  __param(2, IHoverService),
  __param(3, IOpenerService)
], AdditionalDetailsWidget);
export {
  McpServerEditor
};
//# sourceMappingURL=mcpServerEditor.js.map
