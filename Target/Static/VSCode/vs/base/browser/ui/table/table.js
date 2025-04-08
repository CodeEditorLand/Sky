var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IListContextMenuEvent, IListEvent, IListGestureEvent, IListMouseEvent, IListRenderer, IListTouchEvent } from "../list/list.js";
import { Event } from "../../../common/event.js";
class TableError extends Error {
  static {
    __name(this, "TableError");
  }
  constructor(user, message) {
    super(`TableError [${user}] ${message}`);
  }
}
export {
  TableError
};
//# sourceMappingURL=table.js.map
