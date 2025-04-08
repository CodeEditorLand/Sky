var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { h } from "../../../../base/browser/dom.js";
import { Button } from "../../../../base/browser/ui/button/button.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { Disposable, DisposableStore } from "../../../../base/common/lifecycle.js";
import { autorun, derived, globalTransaction, observableValue } from "../../../../base/common/observable.js";
import { createActionViewItem } from "../../../../platform/actions/browser/menuEntryActionViewItem.js";
import { MenuWorkbenchToolBar } from "../../../../platform/actions/browser/toolbar.js";
import { MenuId } from "../../../../platform/actions/common/actions.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ServiceCollection } from "../../../../platform/instantiation/common/serviceCollection.js";
import { IDiffEditorOptions } from "../../../common/config/editorOptions.js";
import { OffsetRange } from "../../../common/core/offsetRange.js";
import { observableCodeEditor } from "../../observableCodeEditor.js";
import { DiffEditorWidget } from "../diffEditor/diffEditorWidget.js";
import { DocumentDiffItemViewModel } from "./multiDiffEditorViewModel.js";
import { IObjectData, IPooledObject } from "./objectPool.js";
import { ActionRunnerWithContext } from "./utils.js";
import { IWorkbenchUIElementFactory } from "./workbenchUIElementFactory.js";
class TemplateData {
  constructor(viewModel, deltaScrollVertical) {
    this.viewModel = viewModel;
    this.deltaScrollVertical = deltaScrollVertical;
  }
  static {
    __name(this, "TemplateData");
  }
  getId() {
    return this.viewModel;
  }
}
let DiffEditorItemTemplate = class extends Disposable {
  constructor(_container, _overflowWidgetsDomNode, _workbenchUIElementFactory, _instantiationService, _parentContextKeyService) {
    super();
    this._container = _container;
    this._overflowWidgetsDomNode = _overflowWidgetsDomNode;
    this._workbenchUIElementFactory = _workbenchUIElementFactory;
    this._instantiationService = _instantiationService;
    const btn = new Button(this._elements.collapseButton, {});
    this._register(autorun((reader) => {
      btn.element.className = "";
      btn.icon = this._collapsed.read(reader) ? Codicon.chevronRight : Codicon.chevronDown;
    }));
    this._register(btn.onDidClick(() => {
      this._viewModel.get()?.collapsed.set(!this._collapsed.get(), void 0);
    }));
    this._register(autorun((reader) => {
      this._elements.editor.style.display = this._collapsed.read(reader) ? "none" : "block";
    }));
    this._register(this.editor.getModifiedEditor().onDidLayoutChange((e) => {
      const width = this.editor.getModifiedEditor().getLayoutInfo().contentWidth;
      this._modifiedWidth.set(width, void 0);
    }));
    this._register(this.editor.getOriginalEditor().onDidLayoutChange((e) => {
      const width = this.editor.getOriginalEditor().getLayoutInfo().contentWidth;
      this._originalWidth.set(width, void 0);
    }));
    this._register(this.editor.onDidContentSizeChange((e) => {
      globalTransaction((tx) => {
        this._editorContentHeight.set(e.contentHeight, tx);
        this._modifiedContentWidth.set(this.editor.getModifiedEditor().getContentWidth(), tx);
        this._originalContentWidth.set(this.editor.getOriginalEditor().getContentWidth(), tx);
      });
    }));
    this._register(this.editor.getOriginalEditor().onDidScrollChange((e) => {
      if (this._isSettingScrollTop) {
        return;
      }
      if (!e.scrollTopChanged || !this._data) {
        return;
      }
      const delta = e.scrollTop - this._lastScrollTop;
      this._data.deltaScrollVertical(delta);
    }));
    this._register(autorun((reader) => {
      const isActive = this._viewModel.read(reader)?.isActive.read(reader);
      this._elements.root.classList.toggle("active", isActive);
    }));
    this._container.appendChild(this._elements.root);
    this._outerEditorHeight = this._headerHeight;
    this._contextKeyService = this._register(_parentContextKeyService.createScoped(this._elements.actions));
    const instantiationService = this._register(this._instantiationService.createChild(new ServiceCollection([IContextKeyService, this._contextKeyService])));
    this._register(instantiationService.createInstance(MenuWorkbenchToolBar, this._elements.actions, MenuId.MultiDiffEditorFileToolbar, {
      actionRunner: this._register(new ActionRunnerWithContext(() => this._viewModel.get()?.modifiedUri)),
      menuOptions: {
        shouldForwardArgs: true
      },
      toolbarOptions: { primaryGroup: /* @__PURE__ */ __name((g) => g.startsWith("navigation"), "primaryGroup") },
      actionViewItemProvider: /* @__PURE__ */ __name((action, options) => createActionViewItem(instantiationService, action, options), "actionViewItemProvider")
    }));
  }
  static {
    __name(this, "DiffEditorItemTemplate");
  }
  _viewModel = observableValue(this, void 0);
  _collapsed = derived(this, (reader) => this._viewModel.read(reader)?.collapsed.read(reader));
  _editorContentHeight = observableValue(this, 500);
  contentHeight = derived(this, (reader) => {
    const h2 = this._collapsed.read(reader) ? 0 : this._editorContentHeight.read(reader);
    return h2 + this._outerEditorHeight;
  });
  _modifiedContentWidth = observableValue(this, 0);
  _modifiedWidth = observableValue(this, 0);
  _originalContentWidth = observableValue(this, 0);
  _originalWidth = observableValue(this, 0);
  maxScroll = derived(this, (reader) => {
    const scroll1 = this._modifiedContentWidth.read(reader) - this._modifiedWidth.read(reader);
    const scroll2 = this._originalContentWidth.read(reader) - this._originalWidth.read(reader);
    if (scroll1 > scroll2) {
      return { maxScroll: scroll1, width: this._modifiedWidth.read(reader) };
    } else {
      return { maxScroll: scroll2, width: this._originalWidth.read(reader) };
    }
  });
  _elements = h("div.multiDiffEntry", [
    h("div.header@header", [
      h("div.header-content", [
        h("div.collapse-button@collapseButton"),
        h("div.file-path", [
          h("div.title.modified.show-file-icons@primaryPath", []),
          h("div.status.deleted@status", ["R"]),
          h("div.title.original.show-file-icons@secondaryPath", [])
        ]),
        h("div.actions@actions")
      ])
    ]),
    h("div.editorParent", [
      h("div.editorContainer@editor")
    ])
  ]);
  editor = this._register(this._instantiationService.createInstance(DiffEditorWidget, this._elements.editor, {
    overflowWidgetsDomNode: this._overflowWidgetsDomNode
  }, {}));
  isModifedFocused = observableCodeEditor(this.editor.getModifiedEditor()).isFocused;
  isOriginalFocused = observableCodeEditor(this.editor.getOriginalEditor()).isFocused;
  isFocused = derived(this, (reader) => this.isModifedFocused.read(reader) || this.isOriginalFocused.read(reader));
  _resourceLabel = this._workbenchUIElementFactory.createResourceLabel ? this._register(this._workbenchUIElementFactory.createResourceLabel(this._elements.primaryPath)) : void 0;
  _resourceLabel2 = this._workbenchUIElementFactory.createResourceLabel ? this._register(this._workbenchUIElementFactory.createResourceLabel(this._elements.secondaryPath)) : void 0;
  _outerEditorHeight;
  _contextKeyService;
  setScrollLeft(left) {
    if (this._modifiedContentWidth.get() - this._modifiedWidth.get() > this._originalContentWidth.get() - this._originalWidth.get()) {
      this.editor.getModifiedEditor().setScrollLeft(left);
    } else {
      this.editor.getOriginalEditor().setScrollLeft(left);
    }
  }
  _dataStore = this._register(new DisposableStore());
  _data;
  setData(data) {
    this._data = data;
    function updateOptions(options) {
      return {
        ...options,
        scrollBeyondLastLine: false,
        hideUnchangedRegions: {
          enabled: true
        },
        scrollbar: {
          vertical: "hidden",
          horizontal: "hidden",
          handleMouseWheel: false,
          useShadows: false
        },
        renderOverviewRuler: false,
        fixedOverflowWidgets: true,
        overviewRulerBorder: false
      };
    }
    __name(updateOptions, "updateOptions");
    if (!data) {
      globalTransaction((tx) => {
        this._viewModel.set(void 0, tx);
        this.editor.setDiffModel(null, tx);
        this._dataStore.clear();
      });
      return;
    }
    const value = data.viewModel.documentDiffItem;
    globalTransaction((tx) => {
      this._resourceLabel?.setUri(data.viewModel.modifiedUri ?? data.viewModel.originalUri, { strikethrough: data.viewModel.modifiedUri === void 0 });
      let isRenamed = false;
      let isDeleted = false;
      let isAdded = false;
      let flag = "";
      if (data.viewModel.modifiedUri && data.viewModel.originalUri && data.viewModel.modifiedUri.path !== data.viewModel.originalUri.path) {
        flag = "R";
        isRenamed = true;
      } else if (!data.viewModel.modifiedUri) {
        flag = "D";
        isDeleted = true;
      } else if (!data.viewModel.originalUri) {
        flag = "A";
        isAdded = true;
      }
      this._elements.status.classList.toggle("renamed", isRenamed);
      this._elements.status.classList.toggle("deleted", isDeleted);
      this._elements.status.classList.toggle("added", isAdded);
      this._elements.status.innerText = flag;
      this._resourceLabel2?.setUri(isRenamed ? data.viewModel.originalUri : void 0, { strikethrough: true });
      this._dataStore.clear();
      this._viewModel.set(data.viewModel, tx);
      this.editor.setDiffModel(data.viewModel.diffEditorViewModelRef, tx);
      this.editor.updateOptions(updateOptions(value.options ?? {}));
    });
    if (value.onOptionsDidChange) {
      this._dataStore.add(value.onOptionsDidChange(() => {
        this.editor.updateOptions(updateOptions(value.options ?? {}));
      }));
    }
    data.viewModel.isAlive.recomputeInitiallyAndOnChange(this._dataStore, (value2) => {
      if (!value2) {
        this.setData(void 0);
      }
    });
    if (data.viewModel.documentDiffItem.contextKeys) {
      for (const [key, value2] of Object.entries(data.viewModel.documentDiffItem.contextKeys)) {
        this._contextKeyService.createKey(key, value2);
      }
    }
  }
  _headerHeight = (
    /*this._elements.header.clientHeight*/
    40
  );
  _lastScrollTop = -1;
  _isSettingScrollTop = false;
  render(verticalRange, width, editorScroll, viewPort) {
    this._elements.root.style.visibility = "visible";
    this._elements.root.style.top = `${verticalRange.start}px`;
    this._elements.root.style.height = `${verticalRange.length}px`;
    this._elements.root.style.width = `${width}px`;
    this._elements.root.style.position = "absolute";
    const maxDelta = verticalRange.length - this._headerHeight;
    const delta = Math.max(0, Math.min(viewPort.start - verticalRange.start, maxDelta));
    this._elements.header.style.transform = `translateY(${delta}px)`;
    globalTransaction((tx) => {
      this.editor.layout({
        width: width - 2 * 8 - 2 * 1,
        height: verticalRange.length - this._outerEditorHeight
      });
    });
    try {
      this._isSettingScrollTop = true;
      this._lastScrollTop = editorScroll;
      this.editor.getOriginalEditor().setScrollTop(editorScroll);
    } finally {
      this._isSettingScrollTop = false;
    }
    this._elements.header.classList.toggle("shadow", delta > 0 || editorScroll > 0);
    this._elements.header.classList.toggle("collapsed", delta === maxDelta);
  }
  hide() {
    this._elements.root.style.top = `-100000px`;
    this._elements.root.style.visibility = "hidden";
  }
};
DiffEditorItemTemplate = __decorateClass([
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IContextKeyService)
], DiffEditorItemTemplate);
export {
  DiffEditorItemTemplate,
  TemplateData
};
//# sourceMappingURL=diffEditorItemTemplate.js.map
