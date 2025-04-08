var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import "./bannerController.css";
import { localize } from "../../../../nls.js";
import { $, append, clearNode } from "../../../../base/browser/dom.js";
import { ActionBar } from "../../../../base/browser/ui/actionbar/actionbar.js";
import { Action } from "../../../../base/common/actions.js";
import { MarkdownString } from "../../../../base/common/htmlContent.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { MarkdownRenderer } from "../../../browser/widget/markdownRenderer/browser/markdownRenderer.js";
import { ICodeEditor } from "../../../browser/editorBrowser.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ILinkDescriptor, Link } from "../../../../platform/opener/browser/link.js";
import { widgetClose } from "../../../../platform/theme/common/iconRegistry.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
const BANNER_ELEMENT_HEIGHT = 26;
let BannerController = class extends Disposable {
  constructor(_editor, instantiationService) {
    super();
    this._editor = _editor;
    this.instantiationService = instantiationService;
    this.banner = this._register(this.instantiationService.createInstance(Banner));
  }
  static {
    __name(this, "BannerController");
  }
  banner;
  hide() {
    this._editor.setBanner(null, 0);
    this.banner.clear();
  }
  show(item) {
    this.banner.show({
      ...item,
      onClose: /* @__PURE__ */ __name(() => {
        this.hide();
        item.onClose?.();
      }, "onClose")
    });
    this._editor.setBanner(this.banner.element, BANNER_ELEMENT_HEIGHT);
  }
};
BannerController = __decorateClass([
  __decorateParam(1, IInstantiationService)
], BannerController);
let Banner = class extends Disposable {
  constructor(instantiationService) {
    super();
    this.instantiationService = instantiationService;
    this.markdownRenderer = this.instantiationService.createInstance(MarkdownRenderer, {});
    this.element = $("div.editor-banner");
    this.element.tabIndex = 0;
  }
  static {
    __name(this, "Banner");
  }
  element;
  markdownRenderer;
  messageActionsContainer;
  actionBar;
  getAriaLabel(item) {
    if (item.ariaLabel) {
      return item.ariaLabel;
    }
    if (typeof item.message === "string") {
      return item.message;
    }
    return void 0;
  }
  getBannerMessage(message) {
    if (typeof message === "string") {
      const element = $("span");
      element.innerText = message;
      return element;
    }
    return this.markdownRenderer.render(message).element;
  }
  clear() {
    clearNode(this.element);
  }
  show(item) {
    clearNode(this.element);
    const ariaLabel = this.getAriaLabel(item);
    if (ariaLabel) {
      this.element.setAttribute("aria-label", ariaLabel);
    }
    const iconContainer = append(this.element, $("div.icon-container"));
    iconContainer.setAttribute("aria-hidden", "true");
    if (item.icon) {
      iconContainer.appendChild($(`div${ThemeIcon.asCSSSelector(item.icon)}`));
    }
    const messageContainer = append(this.element, $("div.message-container"));
    messageContainer.setAttribute("aria-hidden", "true");
    messageContainer.appendChild(this.getBannerMessage(item.message));
    this.messageActionsContainer = append(this.element, $("div.message-actions-container"));
    if (item.actions) {
      for (const action of item.actions) {
        this._register(this.instantiationService.createInstance(Link, this.messageActionsContainer, { ...action, tabIndex: -1 }, {}));
      }
    }
    const actionBarContainer = append(this.element, $("div.action-container"));
    this.actionBar = this._register(new ActionBar(actionBarContainer));
    this.actionBar.push(this._register(
      new Action(
        "banner.close",
        localize("closeBanner", "Close Banner"),
        ThemeIcon.asClassName(widgetClose),
        true,
        () => {
          if (typeof item.onClose === "function") {
            item.onClose();
          }
        }
      )
    ), { icon: true, label: false });
    this.actionBar.setFocusable(false);
  }
};
Banner = __decorateClass([
  __decorateParam(0, IInstantiationService)
], Banner);
export {
  BannerController
};
//# sourceMappingURL=bannerController.js.map
