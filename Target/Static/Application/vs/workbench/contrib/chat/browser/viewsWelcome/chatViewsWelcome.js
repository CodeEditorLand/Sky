var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter } from "../../../../../base/common/event.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { Registry } from "../../../../../platform/registry/common/platform.js";
var ChatViewsWelcomeExtensions;
(function(ChatViewsWelcomeExtensions2) {
  ChatViewsWelcomeExtensions2["ChatViewsWelcomeRegistry"] = "workbench.registry.chat.viewsWelcome";
})(ChatViewsWelcomeExtensions || (ChatViewsWelcomeExtensions = {}));
class ChatViewsWelcomeContributionRegistry extends Disposable {
  static {
    __name(this, "ChatViewsWelcomeContributionRegistry");
  }
  constructor() {
    super(...arguments);
    this.descriptors = [];
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
  }
  register(descriptor) {
    this.descriptors.push(descriptor);
    this._onDidChange.fire();
  }
  get() {
    return this.descriptors;
  }
}
const chatViewsWelcomeRegistry = new ChatViewsWelcomeContributionRegistry();
Registry.add("workbench.registry.chat.viewsWelcome", chatViewsWelcomeRegistry);
export {
  ChatViewsWelcomeExtensions,
  chatViewsWelcomeRegistry
};
//# sourceMappingURL=chatViewsWelcome.js.map
