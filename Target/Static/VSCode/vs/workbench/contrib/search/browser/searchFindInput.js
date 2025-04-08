var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IContextViewProvider } from "../../../../base/browser/ui/contextview/contextview.js";
import { IFindInputOptions } from "../../../../base/browser/ui/findinput/findInput.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { ContextScopedFindInput } from "../../../../platform/history/browser/contextScopedHistoryWidget.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { NotebookFindFilters } from "../../notebook/browser/contrib/find/findFilters.js";
import { NotebookFindInputFilterButton } from "../../notebook/browser/contrib/find/notebookFindReplaceWidget.js";
import * as nls from "../../../../nls.js";
import { Emitter } from "../../../../base/common/event.js";
class SearchFindInput extends ContextScopedFindInput {
  constructor(container, contextViewProvider, options, contextKeyService, contextMenuService, instantiationService, filters, filterStartVisiblitity) {
    super(container, contextViewProvider, options, contextKeyService);
    this.contextMenuService = contextMenuService;
    this.instantiationService = instantiationService;
    this.filters = filters;
    this._findFilter = this._register(
      new NotebookFindInputFilterButton(
        filters,
        contextMenuService,
        instantiationService,
        options,
        nls.localize("searchFindInputNotebookFilter.label", "Notebook Find Filters")
      )
    );
    this._updatePadding();
    this.controls.appendChild(this._findFilter.container);
    this._findFilter.container.classList.add("monaco-custom-toggle");
    this.filterVisible = filterStartVisiblitity;
  }
  static {
    __name(this, "SearchFindInput");
  }
  _findFilter;
  _filterChecked = false;
  _onDidChangeAIToggle = this._register(new Emitter());
  onDidChangeAIToggle = this._onDidChangeAIToggle.event;
  _updatePadding() {
    this.inputBox.paddingRight = (this.caseSensitive?.visible ? this.caseSensitive.width() : 0) + (this.wholeWords?.visible ? this.wholeWords.width() : 0) + (this.regex?.visible ? this.regex.width() : 0) + (this._findFilter.visible ? this._findFilter.width() : 0);
  }
  set filterVisible(visible) {
    this._findFilter.visible = visible;
    this.updateFilterStyles();
    this._updatePadding();
  }
  setEnabled(enabled) {
    super.setEnabled(enabled);
    if (enabled && (!this._filterChecked || !this._findFilter.visible)) {
      this.regex?.enable();
    } else {
      this.regex?.disable();
    }
  }
  updateFilterStyles() {
    this._filterChecked = !this.filters.markupInput || !this.filters.markupPreview || !this.filters.codeInput || !this.filters.codeOutput;
    this._findFilter.applyStyles(this._filterChecked);
  }
}
export {
  SearchFindInput
};
//# sourceMappingURL=searchFindInput.js.map
