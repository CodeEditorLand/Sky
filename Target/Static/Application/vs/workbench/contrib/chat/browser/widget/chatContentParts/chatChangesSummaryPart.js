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
import * as dom from "../../../../../../base/browser/dom.js";
import { $ } from "../../../../../../base/browser/dom.js";
import { ButtonWithIcon } from "../../../../../../base/browser/ui/button/button.js";
import { Codicon } from "../../../../../../base/common/codicons.js";
import { Emitter } from "../../../../../../base/common/event.js";
import { Iterable } from "../../../../../../base/common/iterator.js";
import { Disposable, DisposableStore, toDisposable } from "../../../../../../base/common/lifecycle.js";
import { autorun } from "../../../../../../base/common/observable.js";
import { isEqual } from "../../../../../../base/common/resources.js";
import { ThemeIcon } from "../../../../../../base/common/themables.js";
import { URI } from "../../../../../../base/common/uri.js";
import { localize2 } from "../../../../../../nls.js";
import { FileKind } from "../../../../../../platform/files/common/files.js";
import { IHoverService } from "../../../../../../platform/hover/browser/hover.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
import { WorkbenchList } from "../../../../../../platform/list/browser/listService.js";
import { IThemeService } from "../../../../../../platform/theme/common/themeService.js";
import { ResourceLabels } from "../../../../../browser/labels.js";
import { IEditorGroupsService } from "../../../../../services/editor/common/editorGroupsService.js";
import { IEditorService } from "../../../../../services/editor/common/editorService.js";
import { createFileIconThemableTreeContainerScope } from "../../../../files/browser/views/explorerView.js";
import { MultiDiffEditorInput } from "../../../../multiDiffEditor/browser/multiDiffEditorInput.js";
import { MultiDiffEditorItem } from "../../../../multiDiffEditor/browser/multiDiffSourceResolverService.js";
import { IChatService } from "../../../common/chatService/chatService.js";
import { ResourcePool } from "./chatCollections.js";
let ChatCheckpointFileChangesSummaryContentPart = class ChatCheckpointFileChangesSummaryContentPart2 extends Disposable {
  static {
    __name(this, "ChatCheckpointFileChangesSummaryContentPart");
  }
  constructor(content, context, hoverService, chatService, editorService, editorGroupsService, instantiationService) {
    super();
    this.content = content;
    this.hoverService = hoverService;
    this.chatService = chatService;
    this.editorService = editorService;
    this.editorGroupsService = editorGroupsService;
    this.instantiationService = instantiationService;
    this.ELEMENT_HEIGHT = 22;
    this.MAX_ITEMS_SHOWN = 6;
    this._onDidChangeHeight = this._register(new Emitter());
    this.onDidChangeHeight = this._onDidChangeHeight.event;
    this.diffsBetweenRequests = /* @__PURE__ */ new Map();
    this.isCollapsed = true;
    this.fileChangesDiffsObservable = this.computeFileChangesDiffs(content);
    const headerDomNode = $(".checkpoint-file-changes-summary-header");
    this.domNode = $(".checkpoint-file-changes-summary", void 0, headerDomNode);
    this.domNode.tabIndex = 0;
    this._register(this.renderHeader(headerDomNode));
    this._register(this.renderFilesList(this.domNode));
  }
  computeFileChangesDiffs({ requestId, sessionResource }) {
    return this.chatService.chatModels.map((models) => Iterable.find(models, (m) => isEqual(m.sessionResource, sessionResource))).map((model) => model?.editingSession?.getDiffsForFilesInRequest(requestId)).map((diffs, r) => diffs?.read(r) || Iterable.empty());
  }
  getCachedEntryDiffBetweenRequests(editSession, uri, startRequestId, stopRequestId) {
    const key = `${uri}\0${startRequestId}\0${stopRequestId}`;
    let observable = this.diffsBetweenRequests.get(key);
    if (!observable) {
      observable = editSession.getEntryDiffBetweenRequests(uri, startRequestId, stopRequestId);
      this.diffsBetweenRequests.set(key, observable);
    }
    return observable;
  }
  renderHeader(container) {
    const viewListButtonContainer = container.appendChild($(".chat-file-changes-label"));
    const viewListButton = new ButtonWithIcon(viewListButtonContainer, {});
    this._register(autorun((r) => {
      const diffs = this.fileChangesDiffsObservable.read(r);
      viewListButton.label = diffs.length === 1 ? `Changed 1 file` : `Changed ${diffs.length} files`;
    }));
    const setExpansionState = /* @__PURE__ */ __name(() => {
      viewListButton.icon = this.isCollapsed ? Codicon.chevronRight : Codicon.chevronDown;
      this.domNode.classList.toggle("chat-file-changes-collapsed", this.isCollapsed);
      this._onDidChangeHeight.fire();
    }, "setExpansionState");
    setExpansionState();
    const disposables = new DisposableStore();
    disposables.add(viewListButton);
    disposables.add(viewListButton.onDidClick(() => {
      this.isCollapsed = !this.isCollapsed;
      setExpansionState();
    }));
    disposables.add(this.renderViewAllFileChangesButton(viewListButton.element));
    return toDisposable(() => disposables.dispose());
  }
  renderViewAllFileChangesButton(container) {
    const button = container.appendChild($(".chat-view-changes-icon"));
    this.hoverService.setupDelayedHover(button, () => ({
      content: localize2("chat.viewFileChangesSummary", "View All File Changes")
    }));
    button.classList.add(...ThemeIcon.asClassNameArray(Codicon.diffMultiple));
    button.setAttribute("role", "button");
    button.tabIndex = 0;
    return dom.addDisposableListener(button, "click", (e) => {
      const resources = this.fileChangesDiffsObservable.get().map((diff) => ({
        originalUri: diff.originalURI,
        modifiedUri: diff.modifiedURI
      }));
      const source = URI.parse(`multi-diff-editor:${(/* @__PURE__ */ new Date()).getMilliseconds().toString() + Math.random().toString()}`);
      const input = this.instantiationService.createInstance(MultiDiffEditorInput, source, "Checkpoint File Changes", resources.map((resource) => {
        return new MultiDiffEditorItem(resource.originalUri, resource.modifiedUri, void 0);
      }), false);
      this.editorGroupsService.activeGroup.openEditor(input);
      dom.EventHelper.stop(e, true);
    });
  }
  renderFilesList(container) {
    const store = new DisposableStore();
    this.list = store.add(this.instantiationService.createInstance(CollapsibleChangesSummaryListPool)).get();
    const listNode = this.list.getHTMLElement();
    container.appendChild(listNode.parentElement);
    store.add(this.list.onDidOpen((item) => {
      const diff = item.element;
      if (!diff) {
        return;
      }
      const input = {
        original: { resource: diff.originalURI },
        modified: { resource: diff.modifiedURI },
        options: { preserveFocus: true }
      };
      this.editorService.openEditor(input);
    }));
    store.add(this.list.onContextMenu((e) => {
      dom.EventHelper.stop(e.browserEvent, true);
    }));
    store.add(autorun((r) => {
      const diffs = this.fileChangesDiffsObservable.read(r);
      const itemsShown = Math.min(diffs.length, this.MAX_ITEMS_SHOWN);
      const height = itemsShown * this.ELEMENT_HEIGHT;
      this.list.layout(height);
      listNode.style.height = height + "px";
      this.list.splice(0, this.list.length, diffs);
    }));
    return store;
  }
  hasSameContent(other, followingContent, element) {
    return other.kind === "changesSummary" && other.requestId === this.content.requestId;
  }
  addDisposable(disposable) {
    this._register(disposable);
  }
};
ChatCheckpointFileChangesSummaryContentPart = __decorate([
  __param(2, IHoverService),
  __param(3, IChatService),
  __param(4, IEditorService),
  __param(5, IEditorGroupsService),
  __param(6, IInstantiationService)
], ChatCheckpointFileChangesSummaryContentPart);
let CollapsibleChangesSummaryListPool = class CollapsibleChangesSummaryListPool2 extends Disposable {
  static {
    __name(this, "CollapsibleChangesSummaryListPool");
  }
  constructor(instantiationService, themeService) {
    super();
    this.instantiationService = instantiationService;
    this.themeService = themeService;
    this._resourcePool = this._register(new ResourcePool(() => this.listFactory()));
  }
  listFactory() {
    const container = $(".chat-summary-list");
    const store = new DisposableStore();
    store.add(createFileIconThemableTreeContainerScope(container, this.themeService));
    const resourceLabels = store.add(this.instantiationService.createInstance(ResourceLabels, { onDidChangeVisibility: /* @__PURE__ */ __name(() => Disposable.None, "onDidChangeVisibility") }));
    const list = store.add(this.instantiationService.createInstance(WorkbenchList, "ChatListRenderer", container, new CollapsibleChangesSummaryListDelegate(), [this.instantiationService.createInstance(CollapsibleChangesSummaryListRenderer, resourceLabels)], {
      alwaysConsumeMouseWheel: false
    }));
    return {
      list,
      dispose: /* @__PURE__ */ __name(() => {
        store.dispose();
      }, "dispose")
    };
  }
  get() {
    return this._resourcePool.get().list;
  }
};
CollapsibleChangesSummaryListPool = __decorate([
  __param(0, IInstantiationService),
  __param(1, IThemeService)
], CollapsibleChangesSummaryListPool);
class CollapsibleChangesSummaryListDelegate {
  static {
    __name(this, "CollapsibleChangesSummaryListDelegate");
  }
  getHeight(element) {
    return 22;
  }
  getTemplateId(element) {
    return CollapsibleChangesSummaryListRenderer.TEMPLATE_ID;
  }
}
class CollapsibleChangesSummaryListRenderer {
  static {
    __name(this, "CollapsibleChangesSummaryListRenderer");
  }
  static {
    this.TEMPLATE_ID = "collapsibleChangesSummaryListRenderer";
  }
  static {
    this.CHANGES_SUMMARY_CLASS_NAME = "insertions-and-deletions";
  }
  constructor(labels) {
    this.labels = labels;
    this.templateId = CollapsibleChangesSummaryListRenderer.TEMPLATE_ID;
  }
  renderTemplate(container) {
    const label = this.labels.create(container, { supportHighlights: true, supportIcons: true });
    return { label, dispose: /* @__PURE__ */ __name(() => label.dispose(), "dispose") };
  }
  renderElement(data, index, templateData) {
    const label = templateData.label;
    label.setFile(data.modifiedURI, {
      fileKind: FileKind.FILE,
      title: data.modifiedURI.path
    });
    const labelElement = label.element;
    templateData.changesElement?.remove();
    if (!data.identical && !data.isBusy) {
      const changesSummary = labelElement.appendChild($(`.${CollapsibleChangesSummaryListRenderer.CHANGES_SUMMARY_CLASS_NAME}`));
      const added = changesSummary.appendChild($(`.insertions`));
      added.textContent = `+${data.added}`;
      const removed = changesSummary.appendChild($(`.deletions`));
      removed.textContent = `-${data.removed}`;
      templateData.changesElement = changesSummary;
    }
  }
  disposeTemplate(templateData) {
    templateData.dispose();
  }
}
export {
  ChatCheckpointFileChangesSummaryContentPart
};
//# sourceMappingURL=chatChangesSummaryPart.js.map
