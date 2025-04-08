var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as nls from "../../../../nls.js";
import { Disposable, IDisposable } from "../../../../base/common/lifecycle.js";
import { ContextKeyExpr } from "../../../../platform/contextkey/common/contextkey.js";
import { IWorkbenchContribution } from "../../../common/contributions.js";
import { IExtensionPoint, IExtensionPointUser } from "../../../services/extensions/common/extensionsRegistry.js";
import { ViewsWelcomeExtensionPoint, ViewWelcome, ViewIdentifierMap } from "./viewsWelcomeExtensionPoint.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { Extensions as ViewContainerExtensions, IViewContentDescriptor, IViewsRegistry } from "../../../common/views.js";
import { isProposedApiEnabled } from "../../../services/extensions/common/extensions.js";
const viewsRegistry = Registry.as(ViewContainerExtensions.ViewsRegistry);
class ViewsWelcomeContribution extends Disposable {
  static {
    __name(this, "ViewsWelcomeContribution");
  }
  viewWelcomeContents = /* @__PURE__ */ new Map();
  constructor(extensionPoint) {
    super();
    extensionPoint.setHandler((_, { added, removed }) => {
      for (const contribution of removed) {
        for (const welcome of contribution.value) {
          const disposable = this.viewWelcomeContents.get(welcome);
          disposable?.dispose();
        }
      }
      const welcomesByViewId = /* @__PURE__ */ new Map();
      for (const contribution of added) {
        for (const welcome of contribution.value) {
          const { group, order } = parseGroupAndOrder(welcome, contribution);
          const precondition = ContextKeyExpr.deserialize(welcome.enablement);
          const id = ViewIdentifierMap[welcome.view] ?? welcome.view;
          let viewContentMap = welcomesByViewId.get(id);
          if (!viewContentMap) {
            viewContentMap = /* @__PURE__ */ new Map();
            welcomesByViewId.set(id, viewContentMap);
          }
          viewContentMap.set(welcome, {
            content: welcome.contents,
            when: ContextKeyExpr.deserialize(welcome.when),
            precondition,
            group,
            order
          });
        }
      }
      for (const [id, viewContentMap] of welcomesByViewId) {
        const disposables = viewsRegistry.registerViewWelcomeContent2(id, viewContentMap);
        for (const [welcome, disposable] of disposables) {
          this.viewWelcomeContents.set(welcome, disposable);
        }
      }
    });
  }
}
function parseGroupAndOrder(welcome, contribution) {
  let group;
  let order;
  if (welcome.group) {
    if (!isProposedApiEnabled(contribution.description, "contribViewsWelcome")) {
      contribution.collector.warn(nls.localize("ViewsWelcomeExtensionPoint.proposedAPI", `The viewsWelcome contribution in '{0}' requires 'enabledApiProposals: ["contribViewsWelcome"]' in order to use the 'group' proposed property.`, contribution.description.identifier.value));
      return { group, order };
    }
    const idx = welcome.group.lastIndexOf("@");
    if (idx > 0) {
      group = welcome.group.substr(0, idx);
      order = Number(welcome.group.substr(idx + 1)) || void 0;
    } else {
      group = welcome.group;
    }
  }
  return { group, order };
}
__name(parseGroupAndOrder, "parseGroupAndOrder");
export {
  ViewsWelcomeContribution
};
//# sourceMappingURL=viewsWelcomeContribution.js.map
