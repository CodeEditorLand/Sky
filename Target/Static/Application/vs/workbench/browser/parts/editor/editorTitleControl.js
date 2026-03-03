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
import "./media/editortitlecontrol.css";
import { $, Dimension, clearNode } from "../../../../base/browser/dom.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IThemeService, Themable } from "../../../../platform/theme/common/themeService.js";
import { BreadcrumbsControl, BreadcrumbsControlFactory } from "./breadcrumbsControl.js";
import { MultiEditorTabsControl } from "./multiEditorTabsControl.js";
import { SingleEditorTabsControl } from "./singleEditorTabsControl.js";
import { DisposableStore } from "../../../../base/common/lifecycle.js";
import { MultiRowEditorControl } from "./multiRowEditorTabsControl.js";
import { NoEditorTabsControl } from "./noEditorTabsControl.js";
let EditorTitleControl = class EditorTitleControl2 extends Themable {
  static {
    __name(this, "EditorTitleControl");
  }
  get breadcrumbsControl() {
    return this.breadcrumbsControlFactory?.control;
  }
  constructor(parent, editorPartsView, groupsView, groupView, model, instantiationService, themeService) {
    super(themeService);
    this.parent = parent;
    this.editorPartsView = editorPartsView;
    this.groupsView = groupsView;
    this.groupView = groupView;
    this.model = model;
    this.instantiationService = instantiationService;
    this.editorTabsControlDisposable = this._register(new DisposableStore());
    this.breadcrumbsControlDisposables = this._register(new DisposableStore());
    this.editorTabsControl = this.createEditorTabsControl();
    this.breadcrumbsControlFactory = this.createBreadcrumbsControl();
  }
  createEditorTabsControl() {
    let tabsControlType;
    switch (this.groupsView.partOptions.showTabs) {
      case "none":
        tabsControlType = NoEditorTabsControl;
        break;
      case "single":
        tabsControlType = SingleEditorTabsControl;
        break;
      case "multiple":
      default:
        tabsControlType = this.groupsView.partOptions.pinnedTabsOnSeparateRow ? MultiRowEditorControl : MultiEditorTabsControl;
        break;
    }
    const control = this.instantiationService.createInstance(tabsControlType, this.parent, this.editorPartsView, this.groupsView, this.groupView, this.model);
    return this.editorTabsControlDisposable.add(control);
  }
  createBreadcrumbsControl() {
    if (this.groupsView.partOptions.showTabs === "single") {
      return void 0;
    }
    const breadcrumbsContainer = $(".breadcrumbs-below-tabs");
    this.parent.appendChild(breadcrumbsContainer);
    const breadcrumbsControlFactory = this.breadcrumbsControlDisposables.add(this.instantiationService.createInstance(BreadcrumbsControlFactory, breadcrumbsContainer, this.groupView, {
      showFileIcons: true,
      showSymbolIcons: true,
      showDecorationColors: false,
      showPlaceholder: true,
      dragEditor: false
    }));
    this.breadcrumbsControlDisposables.add(breadcrumbsControlFactory.onDidEnablementChange(() => this.groupView.relayout()));
    this.breadcrumbsControlDisposables.add(breadcrumbsControlFactory.onDidVisibilityChange(() => this.groupView.relayout()));
    return breadcrumbsControlFactory;
  }
  openEditor(editor, options) {
    const didChange = this.editorTabsControl.openEditor(editor, options);
    this.handleOpenedEditors(didChange);
  }
  openEditors(editors) {
    const didChange = this.editorTabsControl.openEditors(editors);
    this.handleOpenedEditors(didChange);
  }
  handleOpenedEditors(didChange) {
    if (didChange) {
      this.breadcrumbsControl?.update();
    } else {
      this.breadcrumbsControl?.revealLast();
    }
  }
  beforeCloseEditor(editor) {
    return this.editorTabsControl.beforeCloseEditor(editor);
  }
  closeEditor(editor) {
    this.editorTabsControl.closeEditor(editor);
    this.handleClosedEditors();
  }
  closeEditors(editors) {
    this.editorTabsControl.closeEditors(editors);
    this.handleClosedEditors();
  }
  handleClosedEditors() {
    if (!this.groupView.activeEditor) {
      this.breadcrumbsControl?.update();
    }
  }
  moveEditor(editor, fromIndex, targetIndex, stickyStateChange) {
    return this.editorTabsControl.moveEditor(editor, fromIndex, targetIndex, stickyStateChange);
  }
  pinEditor(editor) {
    return this.editorTabsControl.pinEditor(editor);
  }
  stickEditor(editor) {
    return this.editorTabsControl.stickEditor(editor);
  }
  unstickEditor(editor) {
    return this.editorTabsControl.unstickEditor(editor);
  }
  setActive(isActive) {
    return this.editorTabsControl.setActive(isActive);
  }
  updateEditorSelections() {
    this.editorTabsControl.updateEditorSelections();
  }
  updateEditorLabel(editor) {
    return this.editorTabsControl.updateEditorLabel(editor);
  }
  updateEditorDirty(editor) {
    return this.editorTabsControl.updateEditorDirty(editor);
  }
  updateOptions(oldOptions, newOptions) {
    if (oldOptions.showTabs !== newOptions.showTabs || newOptions.showTabs !== "single" && oldOptions.pinnedTabsOnSeparateRow !== newOptions.pinnedTabsOnSeparateRow) {
      this.editorTabsControlDisposable.clear();
      this.breadcrumbsControlDisposables.clear();
      clearNode(this.parent);
      this.editorTabsControl = this.createEditorTabsControl();
      this.breadcrumbsControlFactory = this.createBreadcrumbsControl();
    } else {
      this.editorTabsControl.updateOptions(oldOptions, newOptions);
    }
  }
  layout(dimensions) {
    const tabsControlDimension = this.editorTabsControl.layout(dimensions);
    let breadcrumbsControlDimension = void 0;
    if (this.breadcrumbsControl?.isHidden() === false) {
      breadcrumbsControlDimension = new Dimension(dimensions.container.width, BreadcrumbsControl.HEIGHT);
      this.breadcrumbsControl.layout(breadcrumbsControlDimension);
    }
    return new Dimension(dimensions.container.width, tabsControlDimension.height + (breadcrumbsControlDimension ? breadcrumbsControlDimension.height : 0));
  }
  getHeight() {
    const tabsControlHeight = this.editorTabsControl.getHeight();
    const breadcrumbsControlHeight = this.breadcrumbsControl?.isHidden() === false ? BreadcrumbsControl.HEIGHT : 0;
    return {
      total: tabsControlHeight + breadcrumbsControlHeight,
      offset: tabsControlHeight
    };
  }
};
EditorTitleControl = __decorate([
  __param(5, IInstantiationService),
  __param(6, IThemeService)
], EditorTitleControl);
export {
  EditorTitleControl
};
//# sourceMappingURL=editorTitleControl.js.map
