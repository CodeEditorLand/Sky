var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as dom from "../../../../base/browser/dom.js";
import { StandardKeyboardEvent } from "../../../../base/browser/keyboardEvent.js";
import { getDefaultHoverDelegate } from "../../../../base/browser/ui/hover/hoverDelegateFactory.js";
import { renderIcon } from "../../../../base/browser/ui/iconLabel/iconLabels.js";
import { Disposable, DisposableStore, toDisposable } from "../../../../base/common/lifecycle.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import * as platform from "../../../../base/common/platform.js";
import { URI } from "../../../../base/common/uri.js";
import { localize } from "../../../../nls.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { verifiedPublisherIcon } from "../../../services/extensionManagement/common/extensionsIcons.js";
import { installCountIcon, starEmptyIcon, starFullIcon, starHalfIcon } from "../../extensions/browser/extensionsIcons.js";
import { mcpServerIcon } from "../common/mcpTypes.js";
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
var InstallCountWidget_1;
class McpServerWidget extends Disposable {
  static {
    __name(this, "McpServerWidget");
  }
  constructor() {
    super(...arguments);
    this._mcpServer = null;
  }
  get mcpServer() {
    return this._mcpServer;
  }
  set mcpServer(mcpServer) {
    this._mcpServer = mcpServer;
    this.update();
  }
  update() {
    this.render();
  }
}
function onClick(element, callback) {
  const disposables = new DisposableStore();
  disposables.add(dom.addDisposableListener(element, dom.EventType.CLICK, dom.finalHandler(callback)));
  disposables.add(dom.addDisposableListener(element, dom.EventType.KEY_UP, (e) => {
    const keyboardEvent = new StandardKeyboardEvent(e);
    if (keyboardEvent.equals(
      10
      /* KeyCode.Space */
    ) || keyboardEvent.equals(
      3
      /* KeyCode.Enter */
    )) {
      e.preventDefault();
      e.stopPropagation();
      callback();
    }
  }));
  return disposables;
}
__name(onClick, "onClick");
class McpServerIconWidget extends McpServerWidget {
  static {
    __name(this, "McpServerIconWidget");
  }
  constructor(container) {
    super();
    this.disposables = this._register(new DisposableStore());
    this.element = dom.append(container, dom.$(".extension-icon"));
    this.iconElement = dom.append(this.element, dom.$("img.icon", { alt: "" }));
    this.iconElement.style.display = "none";
    this.defaultIconElement = dom.append(this.element, dom.$(ThemeIcon.asCSSSelector(mcpServerIcon)));
    this.defaultIconElement.style.display = "none";
    this.render();
    this._register(toDisposable(() => this.clear()));
  }
  clear() {
    this.iconUrl = void 0;
    this.iconElement.src = "";
    this.iconElement.style.display = "none";
    this.defaultIconElement.style.display = "none";
    this.disposables.clear();
  }
  render() {
    if (!this.mcpServer) {
      this.clear();
      return;
    }
    if (this.mcpServer.iconUrl) {
      this.iconElement.style.display = "inherit";
      this.defaultIconElement.style.display = "none";
      if (this.iconUrl !== this.mcpServer.iconUrl) {
        this.iconUrl = this.mcpServer.iconUrl;
        this.disposables.add(dom.addDisposableListener(this.iconElement, "error", () => {
          this.iconElement.style.display = "none";
          this.defaultIconElement.style.display = "inherit";
        }, { once: true }));
        this.iconElement.src = this.iconUrl;
        if (!this.iconElement.complete) {
          this.iconElement.style.visibility = "hidden";
          this.iconElement.onload = () => this.iconElement.style.visibility = "inherit";
        } else {
          this.iconElement.style.visibility = "inherit";
        }
      }
    } else {
      this.iconUrl = void 0;
      this.iconElement.style.display = "none";
      this.iconElement.src = "";
      this.defaultIconElement.style.display = "inherit";
    }
  }
}
let PublisherWidget = class PublisherWidget2 extends McpServerWidget {
  static {
    __name(this, "PublisherWidget");
  }
  constructor(container, small, hoverService, openerService) {
    super();
    this.container = container;
    this.small = small;
    this.hoverService = hoverService;
    this.openerService = openerService;
    this.disposables = this._register(new DisposableStore());
    this.render();
    this._register(toDisposable(() => this.clear()));
  }
  clear() {
    this.element?.remove();
    this.disposables.clear();
  }
  render() {
    this.clear();
    if (!this.mcpServer?.publisherDisplayName) {
      return;
    }
    this.element = dom.append(this.container, dom.$(".publisher"));
    const publisherDisplayName = dom.$(".publisher-name.ellipsis");
    publisherDisplayName.textContent = this.mcpServer.publisherDisplayName;
    const verifiedPublisher = dom.$(".verified-publisher");
    dom.append(verifiedPublisher, dom.$("span.extension-verified-publisher.clickable"), renderIcon(verifiedPublisherIcon));
    if (this.small) {
      if (this.mcpServer.gallery?.publisherDomain?.verified) {
        dom.append(this.element, verifiedPublisher);
      }
      dom.append(this.element, publisherDisplayName);
    } else {
      this.element.setAttribute("role", "button");
      this.element.tabIndex = 0;
      this.containerHover = this.disposables.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), this.element, localize("publisher", "Publisher ({0})", this.mcpServer.publisherDisplayName)));
      dom.append(this.element, publisherDisplayName);
      if (this.mcpServer.gallery?.publisherDomain?.verified) {
        dom.append(this.element, verifiedPublisher);
        const publisherDomainLink = URI.parse(this.mcpServer.gallery?.publisherDomain.link);
        verifiedPublisher.tabIndex = 0;
        verifiedPublisher.setAttribute("role", "button");
        this.containerHover.update(localize("verified publisher", "This publisher has verified ownership of {0}", this.mcpServer.gallery?.publisherDomain.link));
        verifiedPublisher.setAttribute("role", "link");
        dom.append(verifiedPublisher, dom.$("span.extension-verified-publisher-domain", void 0, publisherDomainLink.authority.startsWith("www.") ? publisherDomainLink.authority.substring(4) : publisherDomainLink.authority));
        this.disposables.add(onClick(verifiedPublisher, () => this.openerService.open(publisherDomainLink)));
      }
    }
  }
};
PublisherWidget = __decorate([
  __param(2, IHoverService),
  __param(3, IOpenerService)
], PublisherWidget);
let InstallCountWidget = InstallCountWidget_1 = class InstallCountWidget2 extends McpServerWidget {
  static {
    __name(this, "InstallCountWidget");
  }
  constructor(container, small, hoverService) {
    super();
    this.container = container;
    this.small = small;
    this.hoverService = hoverService;
    this.disposables = this._register(new DisposableStore());
    this.render();
    this._register(toDisposable(() => this.clear()));
  }
  clear() {
    this.container.innerText = "";
    this.disposables.clear();
  }
  render() {
    this.clear();
    if (!this.mcpServer?.installCount) {
      return;
    }
    const installLabel = InstallCountWidget_1.getInstallLabel(this.mcpServer, this.small);
    if (!installLabel) {
      return;
    }
    const parent = this.small ? this.container : dom.append(this.container, dom.$("span.install", { tabIndex: 0 }));
    dom.append(parent, dom.$("span" + ThemeIcon.asCSSSelector(installCountIcon)));
    const count = dom.append(parent, dom.$("span.count"));
    count.textContent = installLabel;
    if (!this.small) {
      this.disposables.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), this.container, localize("install count", "Install count")));
    }
  }
  static getInstallLabel(extension, small) {
    const installCount = extension.installCount;
    if (!installCount) {
      return void 0;
    }
    let installLabel;
    if (small) {
      if (installCount > 1e6) {
        installLabel = `${Math.floor(installCount / 1e5) / 10}M`;
      } else if (installCount > 1e3) {
        installLabel = `${Math.floor(installCount / 1e3)}K`;
      } else {
        installLabel = String(installCount);
      }
    } else {
      installLabel = installCount.toLocaleString(platform.language);
    }
    return installLabel;
  }
};
InstallCountWidget = InstallCountWidget_1 = __decorate([
  __param(2, IHoverService)
], InstallCountWidget);
let RatingsWidget = class RatingsWidget2 extends McpServerWidget {
  static {
    __name(this, "RatingsWidget");
  }
  constructor(container, small, hoverService) {
    super();
    this.container = container;
    this.small = small;
    this.hoverService = hoverService;
    this.disposables = this._register(new DisposableStore());
    container.classList.add("extension-ratings");
    if (this.small) {
      container.classList.add("small");
    }
    this.render();
    this._register(toDisposable(() => this.clear()));
  }
  clear() {
    this.container.innerText = "";
    this.disposables.clear();
  }
  render() {
    this.clear();
    if (!this.mcpServer) {
      return;
    }
    if (this.mcpServer.rating === void 0) {
      return;
    }
    if (this.small && !this.mcpServer.ratingCount) {
      return;
    }
    if (!this.mcpServer.url) {
      return;
    }
    const rating = Math.round(this.mcpServer.rating * 2) / 2;
    if (this.small) {
      dom.append(this.container, dom.$("span" + ThemeIcon.asCSSSelector(starFullIcon)));
      const count = dom.append(this.container, dom.$("span.count"));
      count.textContent = String(rating);
    } else {
      const element = dom.append(this.container, dom.$("span.rating.clickable", { tabIndex: 0 }));
      for (let i = 1; i <= 5; i++) {
        if (rating >= i) {
          dom.append(element, dom.$("span" + ThemeIcon.asCSSSelector(starFullIcon)));
        } else if (rating >= i - 0.5) {
          dom.append(element, dom.$("span" + ThemeIcon.asCSSSelector(starHalfIcon)));
        } else {
          dom.append(element, dom.$("span" + ThemeIcon.asCSSSelector(starEmptyIcon)));
        }
      }
      if (this.mcpServer.ratingCount) {
        const ratingCountElement = dom.append(element, dom.$("span", void 0, ` (${this.mcpServer.ratingCount})`));
        ratingCountElement.style.paddingLeft = "1px";
      }
      this.containerHover = this._register(this.hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), element, ""));
      this.containerHover.update(localize("ratedLabel", "Average rating: {0} out of 5", rating));
      element.setAttribute("role", "link");
    }
  }
};
RatingsWidget = __decorate([
  __param(2, IHoverService)
], RatingsWidget);
export {
  InstallCountWidget,
  McpServerIconWidget,
  McpServerWidget,
  PublisherWidget,
  RatingsWidget,
  onClick
};
//# sourceMappingURL=mcpServerWidgets.js.map
