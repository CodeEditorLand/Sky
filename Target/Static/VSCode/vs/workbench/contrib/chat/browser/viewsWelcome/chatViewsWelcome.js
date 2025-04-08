var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter, Event } from "../../../../../base/common/event.js";
import { IMarkdownString } from "../../../../../base/common/htmlContent.js";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { ThemeIcon } from "../../../../../base/common/themables.js";
import { ContextKeyExpression } from "../../../../../platform/contextkey/common/contextkey.js";
import { Registry } from "../../../../../platform/registry/common/platform.js";
var ChatViewsWelcomeExtensions = /* @__PURE__ */ ((ChatViewsWelcomeExtensions2) => {
  ChatViewsWelcomeExtensions2["ChatViewsWelcomeRegistry"] = "workbench.registry.chat.viewsWelcome";
  return ChatViewsWelcomeExtensions2;
})(ChatViewsWelcomeExtensions || {});
class ChatViewsWelcomeContributionRegistry {
  static {
    __name(this, "ChatViewsWelcomeContributionRegistry");
  }
  descriptors = [];
  _onDidChange = new Emitter();
  onDidChange = this._onDidChange.event;
  register(descriptor) {
    this.descriptors.push(descriptor);
    this._onDidChange.fire();
  }
  get() {
    return this.descriptors;
  }
}
const chatViewsWelcomeRegistry = new ChatViewsWelcomeContributionRegistry();
Registry.add("workbench.registry.chat.viewsWelcome" /* ChatViewsWelcomeRegistry */, chatViewsWelcomeRegistry);
export {
  ChatViewsWelcomeExtensions,
  chatViewsWelcomeRegistry
};
//# sourceMappingURL=chatViewsWelcome.js.map
