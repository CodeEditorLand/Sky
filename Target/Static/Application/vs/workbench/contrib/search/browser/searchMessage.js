var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as nls from "../../../../nls.js";
import * as dom from "../../../../base/browser/dom.js";
import { parseLinkedText } from "../../../../base/common/linkedText.js";
import Severity from "../../../../base/common/severity.js";
import { SeverityIcon } from "../../../../base/browser/ui/severityIcon/severityIcon.js";
import { TextSearchCompleteMessageType } from "../../../services/search/common/searchExtTypes.js";
import { Schemas } from "../../../../base/common/network.js";
import { Link } from "../../../../platform/opener/browser/link.js";
import { URI } from "../../../../base/common/uri.js";
const renderSearchMessage = /* @__PURE__ */ __name((message, instantiationService, notificationService, openerService, commandService, disposableStore, triggerSearch) => {
  const div = dom.$("div.providerMessage");
  const linkedText = parseLinkedText(message.text);
  dom.append(div, dom.$("." + SeverityIcon.className(message.type === TextSearchCompleteMessageType.Information ? Severity.Info : Severity.Warning).split(" ").join(".")));
  for (const node of linkedText.nodes) {
    if (typeof node === "string") {
      dom.append(div, document.createTextNode(node));
    } else {
      const link = instantiationService.createInstance(Link, div, node, {
        opener: /* @__PURE__ */ __name(async (href) => {
          if (!message.trusted) {
            return;
          }
          const parsed = URI.parse(href, true);
          if (parsed.scheme === Schemas.command && message.trusted) {
            const result = await commandService.executeCommand(parsed.path);
            if (result?.triggerSearch) {
              triggerSearch();
            }
          } else if (parsed.scheme === Schemas.https) {
            openerService.open(parsed);
          } else {
            if (parsed.scheme === Schemas.command && !message.trusted) {
              notificationService.error(nls.localize("unable to open trust", "Unable to open command link from untrusted source: {0}", href));
            } else {
              notificationService.error(nls.localize("unable to open", "Unable to open unknown link: {0}", href));
            }
          }
        }, "opener")
      });
      disposableStore.add(link);
    }
  }
  return div;
}, "renderSearchMessage");
export {
  renderSearchMessage
};
//# sourceMappingURL=searchMessage.js.map
