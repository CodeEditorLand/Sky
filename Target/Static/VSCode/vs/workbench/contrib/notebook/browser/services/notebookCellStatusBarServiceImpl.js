var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CancellationToken } from "../../../../../base/common/cancellation.js";
import { onUnexpectedExternalError } from "../../../../../base/common/errors.js";
import { Emitter, Event } from "../../../../../base/common/event.js";
import { Disposable, IDisposable, toDisposable } from "../../../../../base/common/lifecycle.js";
import { URI } from "../../../../../base/common/uri.js";
import { INotebookCellStatusBarService } from "../../common/notebookCellStatusBarService.js";
import { INotebookCellStatusBarItemList, INotebookCellStatusBarItemProvider } from "../../common/notebookCommon.js";
class NotebookCellStatusBarService extends Disposable {
  static {
    __name(this, "NotebookCellStatusBarService");
  }
  _serviceBrand;
  _onDidChangeProviders = this._register(new Emitter());
  onDidChangeProviders = this._onDidChangeProviders.event;
  _onDidChangeItems = this._register(new Emitter());
  onDidChangeItems = this._onDidChangeItems.event;
  _providers = [];
  registerCellStatusBarItemProvider(provider) {
    this._providers.push(provider);
    let changeListener;
    if (provider.onDidChangeStatusBarItems) {
      changeListener = provider.onDidChangeStatusBarItems(() => this._onDidChangeItems.fire());
    }
    this._onDidChangeProviders.fire();
    return toDisposable(() => {
      changeListener?.dispose();
      const idx = this._providers.findIndex((p) => p === provider);
      this._providers.splice(idx, 1);
    });
  }
  async getStatusBarItemsForCell(docUri, cellIndex, viewType, token) {
    const providers = this._providers.filter((p) => p.viewType === viewType || p.viewType === "*");
    return await Promise.all(providers.map(async (p) => {
      try {
        return await p.provideCellStatusBarItems(docUri, cellIndex, token) ?? { items: [] };
      } catch (e) {
        onUnexpectedExternalError(e);
        return { items: [] };
      }
    }));
  }
}
export {
  NotebookCellStatusBarService
};
//# sourceMappingURL=notebookCellStatusBarServiceImpl.js.map
