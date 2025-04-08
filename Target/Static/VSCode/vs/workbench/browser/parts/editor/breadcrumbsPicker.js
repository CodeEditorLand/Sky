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
import { compareFileNames } from "../../../../base/common/comparers.js";
import { onUnexpectedError } from "../../../../base/common/errors.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { createMatches, FuzzyScore } from "../../../../base/common/filters.js";
import * as glob from "../../../../base/common/glob.js";
import { IDisposable, DisposableStore, MutableDisposable, Disposable } from "../../../../base/common/lifecycle.js";
import { posix, relative } from "../../../../base/common/path.js";
import { basename, dirname, isEqual } from "../../../../base/common/resources.js";
import { URI } from "../../../../base/common/uri.js";
import "./media/breadcrumbscontrol.css";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { FileKind, IFileService, IFileStat } from "../../../../platform/files/common/files.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { WorkbenchDataTree, WorkbenchAsyncDataTree } from "../../../../platform/list/browser/listService.js";
import { breadcrumbsPickerBackground, widgetBorder, widgetShadow } from "../../../../platform/theme/common/colorRegistry.js";
import { isWorkspace, isWorkspaceFolder, IWorkspace, IWorkspaceContextService, IWorkspaceFolder } from "../../../../platform/workspace/common/workspace.js";
import { ResourceLabels, IResourceLabel, DEFAULT_LABELS_CONTAINER } from "../../labels.js";
import { BreadcrumbsConfig } from "./breadcrumbs.js";
import { OutlineElement2, FileElement } from "./breadcrumbsModel.js";
import { IAsyncDataSource, ITreeRenderer, ITreeNode, ITreeFilter, TreeVisibility, ITreeSorter } from "../../../../base/browser/ui/tree/tree.js";
import { IIdentityProvider, IListVirtualDelegate, IKeyboardNavigationLabelProvider } from "../../../../base/browser/ui/list/list.js";
import { IFileIconTheme, IThemeService } from "../../../../platform/theme/common/themeService.js";
import { IListAccessibilityProvider } from "../../../../base/browser/ui/list/listWidget.js";
import { localize } from "../../../../nls.js";
import { IOutline, IOutlineComparator } from "../../../services/outline/browser/outline.js";
import { IEditorOptions } from "../../../../platform/editor/common/editor.js";
import { IEditorService, SIDE_GROUP } from "../../../services/editor/common/editorService.js";
import { ITextResourceConfigurationService } from "../../../../editor/common/services/textResourceConfiguration.js";
let BreadcrumbsPicker = class {
  constructor(parent, resource, _instantiationService, _themeService, _configurationService) {
    this.resource = resource;
    this._instantiationService = _instantiationService;
    this._themeService = _themeService;
    this._configurationService = _configurationService;
    this._domNode = document.createElement("div");
    this._domNode.className = "monaco-breadcrumbs-picker show-file-icons";
    parent.appendChild(this._domNode);
  }
  static {
    __name(this, "BreadcrumbsPicker");
  }
  _disposables = new DisposableStore();
  _domNode;
  _arrow;
  _treeContainer;
  _tree;
  _fakeEvent = new UIEvent("fakeEvent");
  _layoutInfo;
  _onWillPickElement = new Emitter();
  onWillPickElement = this._onWillPickElement.event;
  _previewDispoables = new MutableDisposable();
  dispose() {
    this._disposables.dispose();
    this._previewDispoables.dispose();
    this._onWillPickElement.dispose();
    this._domNode.remove();
    setTimeout(() => this._tree.dispose(), 0);
  }
  async show(input, maxHeight, width, arrowSize, arrowOffset) {
    const theme = this._themeService.getColorTheme();
    const color = theme.getColor(breadcrumbsPickerBackground);
    this._arrow = document.createElement("div");
    this._arrow.className = "arrow";
    this._arrow.style.borderColor = `transparent transparent ${color ? color.toString() : ""}`;
    this._domNode.appendChild(this._arrow);
    this._treeContainer = document.createElement("div");
    this._treeContainer.style.background = color ? color.toString() : "";
    this._treeContainer.style.paddingTop = "2px";
    this._treeContainer.style.borderRadius = "3px";
    this._treeContainer.style.boxShadow = `0 0 8px 2px ${this._themeService.getColorTheme().getColor(widgetShadow)}`;
    this._treeContainer.style.border = `1px solid ${this._themeService.getColorTheme().getColor(widgetBorder)}`;
    this._domNode.appendChild(this._treeContainer);
    this._layoutInfo = { maxHeight, width, arrowSize, arrowOffset, inputHeight: 0 };
    this._tree = this._createTree(this._treeContainer, input);
    this._disposables.add(this._tree.onDidOpen(async (e) => {
      const { element, editorOptions, sideBySide } = e;
      const didReveal = await this._revealElement(element, { ...editorOptions, preserveFocus: false }, sideBySide);
      if (!didReveal) {
        return;
      }
    }));
    this._disposables.add(this._tree.onDidChangeFocus((e) => {
      this._previewDispoables.value = this._previewElement(e.elements[0]);
    }));
    this._disposables.add(this._tree.onDidChangeContentHeight(() => {
      this._layout();
    }));
    this._domNode.focus();
    try {
      await this._setInput(input);
      this._layout();
    } catch (err) {
      onUnexpectedError(err);
    }
  }
  _layout() {
    const headerHeight = 2 * this._layoutInfo.arrowSize;
    const treeHeight = Math.min(this._layoutInfo.maxHeight - headerHeight, this._tree.contentHeight);
    const totalHeight = treeHeight + headerHeight;
    this._domNode.style.height = `${totalHeight}px`;
    this._domNode.style.width = `${this._layoutInfo.width}px`;
    this._arrow.style.top = `-${2 * this._layoutInfo.arrowSize}px`;
    this._arrow.style.borderWidth = `${this._layoutInfo.arrowSize}px`;
    this._arrow.style.marginLeft = `${this._layoutInfo.arrowOffset}px`;
    this._treeContainer.style.height = `${treeHeight}px`;
    this._treeContainer.style.width = `${this._layoutInfo.width}px`;
    this._tree.layout(treeHeight, this._layoutInfo.width);
  }
  restoreViewState() {
  }
};
BreadcrumbsPicker = __decorateClass([
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IThemeService),
  __decorateParam(4, IConfigurationService)
], BreadcrumbsPicker);
class FileVirtualDelegate {
  static {
    __name(this, "FileVirtualDelegate");
  }
  getHeight(_element) {
    return 22;
  }
  getTemplateId(_element) {
    return "FileStat";
  }
}
class FileIdentityProvider {
  static {
    __name(this, "FileIdentityProvider");
  }
  getId(element) {
    if (URI.isUri(element)) {
      return element.toString();
    } else if (isWorkspace(element)) {
      return element.id;
    } else if (isWorkspaceFolder(element)) {
      return element.uri.toString();
    } else {
      return element.resource.toString();
    }
  }
}
let FileDataSource = class {
  constructor(_fileService) {
    this._fileService = _fileService;
  }
  static {
    __name(this, "FileDataSource");
  }
  hasChildren(element) {
    return URI.isUri(element) || isWorkspace(element) || isWorkspaceFolder(element) || element.isDirectory;
  }
  async getChildren(element) {
    if (isWorkspace(element)) {
      return element.folders;
    }
    let uri;
    if (isWorkspaceFolder(element)) {
      uri = element.uri;
    } else if (URI.isUri(element)) {
      uri = element;
    } else {
      uri = element.resource;
    }
    const stat = await this._fileService.resolve(uri);
    return stat.children ?? [];
  }
};
FileDataSource = __decorateClass([
  __decorateParam(0, IFileService)
], FileDataSource);
let FileRenderer = class {
  constructor(_labels, _configService) {
    this._labels = _labels;
    this._configService = _configService;
  }
  static {
    __name(this, "FileRenderer");
  }
  templateId = "FileStat";
  renderTemplate(container) {
    return this._labels.create(container, { supportHighlights: true });
  }
  renderElement(node, index, templateData) {
    const fileDecorations = this._configService.getValue("explorer.decorations");
    const { element } = node;
    let resource;
    let fileKind;
    if (isWorkspaceFolder(element)) {
      resource = element.uri;
      fileKind = FileKind.ROOT_FOLDER;
    } else {
      resource = element.resource;
      fileKind = element.isDirectory ? FileKind.FOLDER : FileKind.FILE;
    }
    templateData.setFile(resource, {
      fileKind,
      hidePath: true,
      fileDecorations,
      matches: createMatches(node.filterData),
      extraClasses: ["picker-item"]
    });
  }
  disposeTemplate(templateData) {
    templateData.dispose();
  }
};
FileRenderer = __decorateClass([
  __decorateParam(1, IConfigurationService)
], FileRenderer);
class FileNavigationLabelProvider {
  static {
    __name(this, "FileNavigationLabelProvider");
  }
  getKeyboardNavigationLabel(element) {
    return element.name;
  }
}
class FileAccessibilityProvider {
  static {
    __name(this, "FileAccessibilityProvider");
  }
  getWidgetAriaLabel() {
    return localize("breadcrumbs", "Breadcrumbs");
  }
  getAriaLabel(element) {
    return element.name;
  }
}
let FileFilter = class {
  constructor(_workspaceService, configService) {
    this._workspaceService = _workspaceService;
    const config = BreadcrumbsConfig.FileExcludes.bindTo(configService);
    const update = /* @__PURE__ */ __name(() => {
      _workspaceService.getWorkspace().folders.forEach((folder) => {
        const excludesConfig = config.getValue({ resource: folder.uri });
        if (!excludesConfig) {
          return;
        }
        const adjustedConfig = {};
        for (const pattern in excludesConfig) {
          if (typeof excludesConfig[pattern] !== "boolean") {
            continue;
          }
          const patternAbs = pattern.indexOf("**/") !== 0 ? posix.join(folder.uri.path, pattern) : pattern;
          adjustedConfig[patternAbs] = excludesConfig[pattern];
        }
        this._cachedExpressions.set(folder.uri.toString(), glob.parse(adjustedConfig));
      });
    }, "update");
    update();
    this._disposables.add(config);
    this._disposables.add(config.onDidChange(update));
    this._disposables.add(_workspaceService.onDidChangeWorkspaceFolders(update));
  }
  static {
    __name(this, "FileFilter");
  }
  _cachedExpressions = /* @__PURE__ */ new Map();
  _disposables = new DisposableStore();
  dispose() {
    this._disposables.dispose();
  }
  filter(element, _parentVisibility) {
    if (isWorkspaceFolder(element)) {
      return true;
    }
    const folder = this._workspaceService.getWorkspaceFolder(element.resource);
    if (!folder || !this._cachedExpressions.has(folder.uri.toString())) {
      return true;
    }
    const expression = this._cachedExpressions.get(folder.uri.toString());
    return !expression(relative(folder.uri.path, element.resource.path), basename(element.resource));
  }
};
FileFilter = __decorateClass([
  __decorateParam(0, IWorkspaceContextService),
  __decorateParam(1, IConfigurationService)
], FileFilter);
class FileSorter {
  static {
    __name(this, "FileSorter");
  }
  compare(a, b) {
    if (isWorkspaceFolder(a) && isWorkspaceFolder(b)) {
      return a.index - b.index;
    }
    if (a.isDirectory === b.isDirectory) {
      return compareFileNames(a.name, b.name);
    } else if (a.isDirectory) {
      return -1;
    } else {
      return 1;
    }
  }
}
let BreadcrumbsFilePicker = class extends BreadcrumbsPicker {
  constructor(parent, resource, instantiationService, themeService, configService, _workspaceService, _editorService) {
    super(parent, resource, instantiationService, themeService, configService);
    this._workspaceService = _workspaceService;
    this._editorService = _editorService;
  }
  static {
    __name(this, "BreadcrumbsFilePicker");
  }
  _createTree(container) {
    this._treeContainer.classList.add("file-icon-themable-tree");
    this._treeContainer.classList.add("show-file-icons");
    const onFileIconThemeChange = /* @__PURE__ */ __name((fileIconTheme) => {
      this._treeContainer.classList.toggle("align-icons-and-twisties", fileIconTheme.hasFileIcons && !fileIconTheme.hasFolderIcons);
      this._treeContainer.classList.toggle("hide-arrows", fileIconTheme.hidesExplorerArrows === true);
    }, "onFileIconThemeChange");
    this._disposables.add(this._themeService.onDidFileIconThemeChange(onFileIconThemeChange));
    onFileIconThemeChange(this._themeService.getFileIconTheme());
    const labels = this._instantiationService.createInstance(
      ResourceLabels,
      DEFAULT_LABELS_CONTAINER
      /* TODO@Jo visibility propagation */
    );
    this._disposables.add(labels);
    return this._instantiationService.createInstance(
      WorkbenchAsyncDataTree,
      "BreadcrumbsFilePicker",
      container,
      new FileVirtualDelegate(),
      [this._instantiationService.createInstance(FileRenderer, labels)],
      this._instantiationService.createInstance(FileDataSource),
      {
        multipleSelectionSupport: false,
        sorter: new FileSorter(),
        filter: this._instantiationService.createInstance(FileFilter),
        identityProvider: new FileIdentityProvider(),
        keyboardNavigationLabelProvider: new FileNavigationLabelProvider(),
        accessibilityProvider: this._instantiationService.createInstance(FileAccessibilityProvider),
        showNotFoundMessage: false,
        overrideStyles: {
          listBackground: breadcrumbsPickerBackground
        }
      }
    );
  }
  async _setInput(element) {
    const { uri, kind } = element;
    let input;
    if (kind === FileKind.ROOT_FOLDER) {
      input = this._workspaceService.getWorkspace();
    } else {
      input = dirname(uri);
    }
    const tree = this._tree;
    await tree.setInput(input);
    let focusElement;
    for (const { element: element2 } of tree.getNode().children) {
      if (isWorkspaceFolder(element2) && isEqual(element2.uri, uri)) {
        focusElement = element2;
        break;
      } else if (isEqual(element2.resource, uri)) {
        focusElement = element2;
        break;
      }
    }
    if (focusElement) {
      tree.reveal(focusElement, 0.5);
      tree.setFocus([focusElement], this._fakeEvent);
    }
    tree.domFocus();
  }
  _previewElement(_element) {
    return Disposable.None;
  }
  async _revealElement(element, options, sideBySide) {
    if (!isWorkspaceFolder(element) && element.isFile) {
      this._onWillPickElement.fire();
      await this._editorService.openEditor({ resource: element.resource, options }, sideBySide ? SIDE_GROUP : void 0);
      return true;
    }
    return false;
  }
};
BreadcrumbsFilePicker = __decorateClass([
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IThemeService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, IWorkspaceContextService),
  __decorateParam(6, IEditorService)
], BreadcrumbsFilePicker);
let OutlineTreeSorter = class {
  constructor(comparator, uri, configService) {
    this.comparator = comparator;
    this._order = configService.getValue(uri, "breadcrumbs.symbolSortOrder");
  }
  static {
    __name(this, "OutlineTreeSorter");
  }
  _order;
  compare(a, b) {
    if (this._order === "name") {
      return this.comparator.compareByName(a, b);
    } else if (this._order === "type") {
      return this.comparator.compareByType(a, b);
    } else {
      return this.comparator.compareByPosition(a, b);
    }
  }
};
OutlineTreeSorter = __decorateClass([
  __decorateParam(2, ITextResourceConfigurationService)
], OutlineTreeSorter);
class BreadcrumbsOutlinePicker extends BreadcrumbsPicker {
  static {
    __name(this, "BreadcrumbsOutlinePicker");
  }
  _createTree(container, input) {
    const { config } = input.outline;
    return this._instantiationService.createInstance(
      WorkbenchDataTree,
      "BreadcrumbsOutlinePicker",
      container,
      config.delegate,
      config.renderers,
      config.treeDataSource,
      {
        ...config.options,
        sorter: this._instantiationService.createInstance(OutlineTreeSorter, config.comparator, void 0),
        collapseByDefault: true,
        expandOnlyOnTwistieClick: true,
        multipleSelectionSupport: false,
        showNotFoundMessage: false
      }
    );
  }
  _setInput(input) {
    const viewState = input.outline.captureViewState();
    this.restoreViewState = () => {
      viewState.dispose();
    };
    const tree = this._tree;
    tree.setInput(input.outline);
    if (input.element !== input.outline) {
      tree.reveal(input.element, 0.5);
      tree.setFocus([input.element], this._fakeEvent);
    }
    tree.domFocus();
    return Promise.resolve();
  }
  _previewElement(element) {
    const outline = this._tree.getInput();
    return outline.preview(element);
  }
  async _revealElement(element, options, sideBySide) {
    this._onWillPickElement.fire();
    const outline = this._tree.getInput();
    await outline.reveal(element, options, sideBySide, false);
    return true;
  }
}
export {
  BreadcrumbsFilePicker,
  BreadcrumbsOutlinePicker,
  BreadcrumbsPicker,
  FileSorter
};
//# sourceMappingURL=breadcrumbsPicker.js.map
