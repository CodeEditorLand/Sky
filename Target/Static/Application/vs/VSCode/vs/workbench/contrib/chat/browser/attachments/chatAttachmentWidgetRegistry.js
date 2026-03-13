var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { createDecorator } from "../../../../../platform/instantiation/common/instantiation.js";
const IChatAttachmentWidgetRegistry = createDecorator("chatAttachmentWidgetRegistry");
class ChatAttachmentWidgetRegistry {
  static {
    __name(this, "ChatAttachmentWidgetRegistry");
  }
  constructor() {
    this._factories = /* @__PURE__ */ new Map();
  }
  registerFactory(kind, factory) {
    this._factories.set(kind, factory);
    return {
      dispose: /* @__PURE__ */ __name(() => {
        if (this._factories.get(kind) === factory) {
          this._factories.delete(kind);
        }
      }, "dispose")
    };
  }
  createWidget(attachment, options, container) {
    const factory = this._factories.get(attachment.kind);
    if (!factory) {
      return void 0;
    }
    return factory(attachment, options, container);
  }
}
export {
  ChatAttachmentWidgetRegistry,
  IChatAttachmentWidgetRegistry
};
//# sourceMappingURL=chatAttachmentWidgetRegistry.js.map
