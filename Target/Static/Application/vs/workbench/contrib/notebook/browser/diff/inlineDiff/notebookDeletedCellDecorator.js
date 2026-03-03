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
import { createTrustedTypesPolicy } from "../../../../../../base/browser/trustedTypes.js";
import { Disposable, DisposableStore, dispose, toDisposable } from "../../../../../../base/common/lifecycle.js";
import { splitLines } from "../../../../../../base/common/strings.js";
import { ILanguageService } from "../../../../../../editor/common/languages/language.js";
import { tokenizeToString } from "../../../../../../editor/common/languages/textToHtmlTokenizer.js";
import { DefaultLineHeight } from "../diffElementViewModel.js";
import { NotebookOverviewRulerLane } from "../../notebookBrowser.js";
import * as DOM from "../../../../../../base/browser/dom.js";
import { MenuWorkbenchToolBar } from "../../../../../../platform/actions/browser/toolbar.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
import { ServiceCollection } from "../../../../../../platform/instantiation/common/serviceCollection.js";
import { IContextKeyService } from "../../../../../../platform/contextkey/common/contextkey.js";
import { overviewRulerDeletedForeground } from "../../../../scm/common/quickDiff.js";
const ttPolicy = createTrustedTypesPolicy("notebookRenderer", { createHTML: /* @__PURE__ */ __name((value) => value, "createHTML") });
let NotebookDeletedCellDecorator = class NotebookDeletedCellDecorator2 extends Disposable {
  static {
    __name(this, "NotebookDeletedCellDecorator");
  }
  constructor(_notebookEditor, toolbar, languageService, instantiationService) {
    super();
    this._notebookEditor = _notebookEditor;
    this.toolbar = toolbar;
    this.languageService = languageService;
    this.instantiationService = instantiationService;
    this.zoneRemover = this._register(new DisposableStore());
    this.createdViewZones = /* @__PURE__ */ new Map();
    this.deletedCellInfos = /* @__PURE__ */ new Map();
  }
  getTop(deletedIndex) {
    const info = this.deletedCellInfos.get(deletedIndex);
    if (!info) {
      return;
    }
    if (info.previousIndex === -1) {
      return 0;
    }
    const cells = this._notebookEditor.getCellsInRange({ start: info.previousIndex, end: info.previousIndex + 1 });
    if (!cells.length) {
      return this._notebookEditor.getLayoutInfo().height + info.offset;
    }
    const cell = cells[0];
    const cellHeight = this._notebookEditor.getHeightOfElement(cell);
    const top = this._notebookEditor.getAbsoluteTopOfElement(cell);
    return top + cellHeight + info.offset;
  }
  reveal(deletedIndex) {
    const top = this.getTop(deletedIndex);
    if (typeof top === "number") {
      this._notebookEditor.focusContainer();
      this._notebookEditor.revealOffsetInCenterIfOutsideViewport(top);
      const info = this.deletedCellInfos.get(deletedIndex);
      if (info) {
        const prevIndex = info.previousIndex === -1 ? 0 : info.previousIndex;
        this._notebookEditor.setFocus({ start: prevIndex, end: prevIndex });
        this._notebookEditor.setSelections([{ start: prevIndex, end: prevIndex }]);
      }
    }
  }
  apply(diffInfo, original) {
    this.clear();
    let currentIndex = -1;
    const deletedCellsToRender = { cells: [], index: 0 };
    diffInfo.forEach((diff) => {
      if (diff.type === "delete") {
        const deletedCell = original.cells[diff.originalCellIndex];
        if (deletedCell) {
          deletedCellsToRender.cells.push({ cell: deletedCell, originalIndex: diff.originalCellIndex, previousIndex: currentIndex });
          deletedCellsToRender.index = currentIndex;
        }
      } else {
        if (deletedCellsToRender.cells.length) {
          this._createWidget(deletedCellsToRender.index + 1, deletedCellsToRender.cells);
          deletedCellsToRender.cells.length = 0;
        }
        currentIndex = diff.modifiedCellIndex;
      }
    });
    if (deletedCellsToRender.cells.length) {
      this._createWidget(deletedCellsToRender.index + 1, deletedCellsToRender.cells);
    }
  }
  clear() {
    this.deletedCellInfos.clear();
    this.zoneRemover.clear();
  }
  _createWidget(index, cells) {
    this._createWidgetImpl(index, cells);
  }
  async _createWidgetImpl(index, cells) {
    const rootContainer = document.createElement("div");
    const widgets = [];
    const heights = await Promise.all(cells.map(async (cell) => {
      const widget = new NotebookDeletedCellWidget(this._notebookEditor, this.toolbar, cell.cell.getValue(), cell.cell.language, rootContainer, cell.originalIndex, this.languageService, this.instantiationService);
      widgets.push(widget);
      const height = await widget.render();
      this.deletedCellInfos.set(cell.originalIndex, { height, previousIndex: cell.previousIndex, offset: 0 });
      return height;
    }));
    Array.from(this.deletedCellInfos.keys()).sort((a, b) => a - b).forEach((originalIndex) => {
      const previousDeletedCell = this.deletedCellInfos.get(originalIndex - 1);
      if (previousDeletedCell) {
        const deletedCell = this.deletedCellInfos.get(originalIndex);
        if (deletedCell) {
          deletedCell.offset = previousDeletedCell.height + previousDeletedCell.offset;
        }
      }
    });
    const totalHeight = heights.reduce((prev, curr) => prev + curr, 0);
    this._notebookEditor.changeViewZones((accessor) => {
      const notebookViewZone = {
        afterModelPosition: index,
        heightInPx: totalHeight + 4,
        domNode: rootContainer
      };
      const id = accessor.addZone(notebookViewZone);
      accessor.layoutZone(id);
      this.createdViewZones.set(index, id);
      const deletedCellOverviewRulereDecorationIds = this._notebookEditor.deltaCellDecorations([], [{
        viewZoneId: id,
        options: {
          overviewRuler: {
            color: overviewRulerDeletedForeground,
            position: NotebookOverviewRulerLane.Center
          }
        }
      }]);
      this.zoneRemover.add(toDisposable(() => {
        if (this.createdViewZones.get(index) === id) {
          this.createdViewZones.delete(index);
        }
        if (!this._notebookEditor.isDisposed) {
          this._notebookEditor.changeViewZones((accessor2) => {
            accessor2.removeZone(id);
            dispose(widgets);
          });
          this._notebookEditor.deltaCellDecorations(deletedCellOverviewRulereDecorationIds, []);
        }
      }));
    });
  }
};
NotebookDeletedCellDecorator = __decorate([
  __param(2, ILanguageService),
  __param(3, IInstantiationService)
], NotebookDeletedCellDecorator);
let NotebookDeletedCellWidget = class NotebookDeletedCellWidget2 extends Disposable {
  static {
    __name(this, "NotebookDeletedCellWidget");
  }
  // private readonly toolbar: HTMLElement;
  constructor(_notebookEditor, _toolbarOptions, code, language, container, _originalIndex, languageService, instantiationService) {
    super();
    this._notebookEditor = _notebookEditor;
    this._toolbarOptions = _toolbarOptions;
    this.code = code;
    this.language = language;
    this._originalIndex = _originalIndex;
    this.languageService = languageService;
    this.instantiationService = instantiationService;
    this.container = DOM.append(container, document.createElement("div"));
    this._register(toDisposable(() => {
      container.removeChild(this.container);
    }));
  }
  async render() {
    const code = this.code;
    const languageId = this.language;
    const codeHtml = await tokenizeToString(this.languageService, code, languageId);
    const fontInfo = this._notebookEditor.getBaseCellEditorOptions(languageId).value;
    const fontFamilyVar = "--notebook-editor-font-family";
    const fontSizeVar = "--notebook-editor-font-size";
    const fontWeightVar = "--notebook-editor-font-weight";
    const editor = this._notebookEditor.codeEditors.map((c) => c[1]).find((c) => c);
    const layoutInfo = editor?.getOptions().get(
      165
      /* EditorOption.layoutInfo */
    );
    const style = `font-family: var(${fontFamilyVar});font-weight: var(${fontWeightVar});font-size: var(${fontSizeVar});` + fontInfo.lineHeight ? `line-height: ${fontInfo.lineHeight}px;` : "" + layoutInfo?.contentLeft ? `margin-left: ${layoutInfo}px;` : `white-space: pre;`;
    const rootContainer = this.container;
    rootContainer.classList.add("code-cell-row");
    if (this._toolbarOptions) {
      const toolbar = document.createElement("div");
      toolbar.className = this._toolbarOptions.className;
      rootContainer.appendChild(toolbar);
      const scopedInstaService = this._register(this.instantiationService.createChild(new ServiceCollection([IContextKeyService, this._notebookEditor.scopedContextKeyService])));
      const toolbarWidget = scopedInstaService.createInstance(MenuWorkbenchToolBar, toolbar, this._toolbarOptions.menuId, {
        telemetrySource: this._toolbarOptions.telemetrySource,
        hiddenItemStrategy: -1,
        toolbarOptions: { primaryGroup: /* @__PURE__ */ __name(() => true, "primaryGroup") },
        menuOptions: {
          renderShortTitle: true,
          arg: this._toolbarOptions.argFactory(this._originalIndex)
        },
        actionViewItemProvider: this._toolbarOptions.actionViewItemProvider
      });
      this._store.add(toolbarWidget);
      toolbar.style.position = "absolute";
      toolbar.style.right = "40px";
      toolbar.style.zIndex = "10";
      toolbar.classList.add("hover");
    }
    const container = DOM.append(rootContainer, DOM.$(".cell-inner-container"));
    container.style.position = "relative";
    const focusIndicatorLeft = DOM.append(container, DOM.$(".cell-focus-indicator.cell-focus-indicator-side.cell-focus-indicator-left"));
    const cellContainer = DOM.append(container, DOM.$(".cell.code"));
    DOM.append(focusIndicatorLeft, DOM.$("div.execution-count-label"));
    const editorPart = DOM.append(cellContainer, DOM.$(".cell-editor-part"));
    let editorContainer = DOM.append(editorPart, DOM.$(".cell-editor-container"));
    editorContainer = DOM.append(editorContainer, DOM.$(".code", { style }));
    if (fontInfo.fontFamily) {
      editorContainer.style.setProperty(fontFamilyVar, fontInfo.fontFamily);
    }
    if (fontInfo.fontSize) {
      editorContainer.style.setProperty(fontSizeVar, `${fontInfo.fontSize}px`);
    }
    if (fontInfo.fontWeight) {
      editorContainer.style.setProperty(fontWeightVar, fontInfo.fontWeight);
    }
    editorContainer.innerHTML = ttPolicy?.createHTML(codeHtml) || codeHtml;
    const lineCount = splitLines(code).length;
    const height = lineCount * (fontInfo.lineHeight || DefaultLineHeight) + 12 + 12;
    const totalHeight = height + 16 + 16;
    return totalHeight;
  }
};
NotebookDeletedCellWidget = __decorate([
  __param(6, ILanguageService),
  __param(7, IInstantiationService)
], NotebookDeletedCellWidget);
export {
  NotebookDeletedCellDecorator,
  NotebookDeletedCellWidget
};
//# sourceMappingURL=notebookDeletedCellDecorator.js.map
