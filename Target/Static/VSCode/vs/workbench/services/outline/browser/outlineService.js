var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { IDisposable, toDisposable } from "../../../../base/common/lifecycle.js";
import { LinkedList } from "../../../../base/common/linkedList.js";
import { InstantiationType, registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { IEditorPane } from "../../../common/editor.js";
import { IOutline, IOutlineCreator, IOutlineService, OutlineTarget } from "./outline.js";
import { Event, Emitter } from "../../../../base/common/event.js";
class OutlineService {
  static {
    __name(this, "OutlineService");
  }
  _factories = new LinkedList();
  _onDidChange = new Emitter();
  onDidChange = this._onDidChange.event;
  canCreateOutline(pane) {
    for (const factory of this._factories) {
      if (factory.matches(pane)) {
        return true;
      }
    }
    return false;
  }
  async createOutline(pane, target, token) {
    for (const factory of this._factories) {
      if (factory.matches(pane)) {
        return await factory.createOutline(pane, target, token);
      }
    }
    return void 0;
  }
  registerOutlineCreator(creator) {
    const rm = this._factories.push(creator);
    this._onDidChange.fire();
    return toDisposable(() => {
      rm();
      this._onDidChange.fire();
    });
  }
}
registerSingleton(IOutlineService, OutlineService, InstantiationType.Delayed);
//# sourceMappingURL=outlineService.js.map
