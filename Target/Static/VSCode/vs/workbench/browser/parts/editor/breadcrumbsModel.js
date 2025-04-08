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
import { CancellationTokenSource } from "../../../../base/common/cancellation.js";
import { onUnexpectedError } from "../../../../base/common/errors.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { DisposableStore, MutableDisposable, toDisposable } from "../../../../base/common/lifecycle.js";
import { Schemas, matchesSomeScheme } from "../../../../base/common/network.js";
import { dirname, isEqual } from "../../../../base/common/resources.js";
import { URI } from "../../../../base/common/uri.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { FileKind } from "../../../../platform/files/common/files.js";
import { IWorkspaceContextService, IWorkspaceFolder, WorkbenchState } from "../../../../platform/workspace/common/workspace.js";
import { BreadcrumbsConfig } from "./breadcrumbs.js";
import { IEditorPane } from "../../../common/editor.js";
import { IOutline, IOutlineService, OutlineTarget } from "../../../services/outline/browser/outline.js";
class FileElement {
  constructor(uri, kind) {
    this.uri = uri;
    this.kind = kind;
  }
  static {
    __name(this, "FileElement");
  }
}
class OutlineElement2 {
  constructor(element, outline) {
    this.element = element;
    this.outline = outline;
  }
  static {
    __name(this, "OutlineElement2");
  }
}
let BreadcrumbsModel = class {
  constructor(resource, editor, configurationService, _workspaceService, _outlineService) {
    this.resource = resource;
    this.editor = editor;
    this._workspaceService = _workspaceService;
    this._outlineService = _outlineService;
    this._cfgFilePath = BreadcrumbsConfig.FilePath.bindTo(configurationService);
    this._cfgSymbolPath = BreadcrumbsConfig.SymbolPath.bindTo(configurationService);
    this._disposables.add(this._cfgFilePath.onDidChange((_) => this._onDidUpdate.fire(this)));
    this._disposables.add(this._cfgSymbolPath.onDidChange((_) => this._onDidUpdate.fire(this)));
    this._workspaceService.onDidChangeWorkspaceFolders(this._onDidChangeWorkspaceFolders, this, this._disposables);
    this._fileInfo = this._initFilePathInfo(resource);
    if (editor) {
      this._bindToEditor(editor);
      this._disposables.add(_outlineService.onDidChange(() => this._bindToEditor(editor)));
      this._disposables.add(editor.onDidChangeControl(() => this._bindToEditor(editor)));
    }
    this._onDidUpdate.fire(this);
  }
  static {
    __name(this, "BreadcrumbsModel");
  }
  _disposables = new DisposableStore();
  _fileInfo;
  _cfgFilePath;
  _cfgSymbolPath;
  _currentOutline = new MutableDisposable();
  _outlineDisposables = new DisposableStore();
  _onDidUpdate = new Emitter();
  onDidUpdate = this._onDidUpdate.event;
  dispose() {
    this._disposables.dispose();
    this._cfgFilePath.dispose();
    this._cfgSymbolPath.dispose();
    this._currentOutline.dispose();
    this._outlineDisposables.dispose();
    this._onDidUpdate.dispose();
  }
  isRelative() {
    return Boolean(this._fileInfo.folder);
  }
  getElements() {
    let result = [];
    if (this._cfgFilePath.getValue() === "on") {
      result = result.concat(this._fileInfo.path);
    } else if (this._cfgFilePath.getValue() === "last" && this._fileInfo.path.length > 0) {
      result = result.concat(this._fileInfo.path.slice(-1));
    }
    if (this._cfgSymbolPath.getValue() === "off") {
      return result;
    }
    if (!this._currentOutline.value) {
      return result;
    }
    const breadcrumbsElements = this._currentOutline.value.config.breadcrumbsDataSource.getBreadcrumbElements();
    for (let i = this._cfgSymbolPath.getValue() === "last" && breadcrumbsElements.length > 0 ? breadcrumbsElements.length - 1 : 0; i < breadcrumbsElements.length; i++) {
      result.push(new OutlineElement2(breadcrumbsElements[i], this._currentOutline.value));
    }
    if (breadcrumbsElements.length === 0 && !this._currentOutline.value.isEmpty) {
      result.push(new OutlineElement2(this._currentOutline.value, this._currentOutline.value));
    }
    return result;
  }
  _initFilePathInfo(uri) {
    if (matchesSomeScheme(uri, Schemas.untitled, Schemas.data)) {
      return {
        folder: void 0,
        path: []
      };
    }
    const info = {
      folder: this._workspaceService.getWorkspaceFolder(uri) ?? void 0,
      path: []
    };
    let uriPrefix = uri;
    while (uriPrefix && uriPrefix.path !== "/") {
      if (info.folder && isEqual(info.folder.uri, uriPrefix)) {
        break;
      }
      info.path.unshift(new FileElement(uriPrefix, info.path.length === 0 ? FileKind.FILE : FileKind.FOLDER));
      const prevPathLength = uriPrefix.path.length;
      uriPrefix = dirname(uriPrefix);
      if (uriPrefix.path.length === prevPathLength) {
        break;
      }
    }
    if (info.folder && this._workspaceService.getWorkbenchState() === WorkbenchState.WORKSPACE) {
      info.path.unshift(new FileElement(info.folder.uri, FileKind.ROOT_FOLDER));
    }
    return info;
  }
  _onDidChangeWorkspaceFolders() {
    this._fileInfo = this._initFilePathInfo(this.resource);
    this._onDidUpdate.fire(this);
  }
  _bindToEditor(editor) {
    const newCts = new CancellationTokenSource();
    this._currentOutline.clear();
    this._outlineDisposables.clear();
    this._outlineDisposables.add(toDisposable(() => newCts.dispose(true)));
    this._outlineService.createOutline(editor, OutlineTarget.Breadcrumbs, newCts.token).then((outline) => {
      if (newCts.token.isCancellationRequested) {
        outline?.dispose();
        outline = void 0;
      }
      this._currentOutline.value = outline;
      this._onDidUpdate.fire(this);
      if (outline) {
        this._outlineDisposables.add(outline.onDidChange(() => this._onDidUpdate.fire(this)));
      }
    }).catch((err) => {
      this._onDidUpdate.fire(this);
      onUnexpectedError(err);
    });
  }
};
BreadcrumbsModel = __decorateClass([
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IWorkspaceContextService),
  __decorateParam(4, IOutlineService)
], BreadcrumbsModel);
export {
  BreadcrumbsModel,
  FileElement,
  OutlineElement2
};
//# sourceMappingURL=breadcrumbsModel.js.map
