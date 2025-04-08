var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import "./media/part.css";
import { Component } from "../common/component.js";
import { IThemeService, IColorTheme } from "../../platform/theme/common/themeService.js";
import { Dimension, size, IDimension, getActiveDocument, prepend, IDomPosition } from "../../base/browser/dom.js";
import { IStorageService } from "../../platform/storage/common/storage.js";
import { ISerializableView, IViewSize } from "../../base/browser/ui/grid/grid.js";
import { Event, Emitter } from "../../base/common/event.js";
import { IWorkbenchLayoutService } from "../services/layout/browser/layoutService.js";
import { assertIsDefined } from "../../base/common/types.js";
import { IDisposable, toDisposable } from "../../base/common/lifecycle.js";
class Part extends Component {
  constructor(id, options, themeService, storageService, layoutService) {
    super(id, themeService, storageService);
    this.options = options;
    this.layoutService = layoutService;
    this._register(layoutService.registerPart(this));
  }
  static {
    __name(this, "Part");
  }
  _dimension;
  get dimension() {
    return this._dimension;
  }
  _contentPosition;
  get contentPosition() {
    return this._contentPosition;
  }
  _onDidVisibilityChange = this._register(new Emitter());
  onDidVisibilityChange = this._onDidVisibilityChange.event;
  parent;
  headerArea;
  titleArea;
  contentArea;
  footerArea;
  partLayout;
  onThemeChange(theme) {
    if (this.parent) {
      super.onThemeChange(theme);
    }
  }
  /**
   * Note: Clients should not call this method, the workbench calls this
   * method. Calling it otherwise may result in unexpected behavior.
   *
   * Called to create title and content area of the part.
   */
  create(parent, options) {
    this.parent = parent;
    this.titleArea = this.createTitleArea(parent, options);
    this.contentArea = this.createContentArea(parent, options);
    this.partLayout = new PartLayout(this.options, this.contentArea);
    this.updateStyles();
  }
  /**
   * Returns the overall part container.
   */
  getContainer() {
    return this.parent;
  }
  /**
   * Subclasses override to provide a title area implementation.
   */
  createTitleArea(parent, options) {
    return void 0;
  }
  /**
   * Returns the title area container.
   */
  getTitleArea() {
    return this.titleArea;
  }
  /**
   * Subclasses override to provide a content area implementation.
   */
  createContentArea(parent, options) {
    return void 0;
  }
  /**
   * Returns the content area container.
   */
  getContentArea() {
    return this.contentArea;
  }
  /**
   * Sets the header area
   */
  setHeaderArea(headerContainer) {
    if (this.headerArea) {
      throw new Error("Header already exists");
    }
    if (!this.parent || !this.titleArea) {
      return;
    }
    prepend(this.parent, headerContainer);
    headerContainer.classList.add("header-or-footer");
    headerContainer.classList.add("header");
    this.headerArea = headerContainer;
    this.partLayout?.setHeaderVisibility(true);
    this.relayout();
  }
  /**
   * Sets the footer area
   */
  setFooterArea(footerContainer) {
    if (this.footerArea) {
      throw new Error("Footer already exists");
    }
    if (!this.parent || !this.titleArea) {
      return;
    }
    this.parent.appendChild(footerContainer);
    footerContainer.classList.add("header-or-footer");
    footerContainer.classList.add("footer");
    this.footerArea = footerContainer;
    this.partLayout?.setFooterVisibility(true);
    this.relayout();
  }
  /**
   * removes the header area
   */
  removeHeaderArea() {
    if (this.headerArea) {
      this.headerArea.remove();
      this.headerArea = void 0;
      this.partLayout?.setHeaderVisibility(false);
      this.relayout();
    }
  }
  /**
   * removes the footer area
   */
  removeFooterArea() {
    if (this.footerArea) {
      this.footerArea.remove();
      this.footerArea = void 0;
      this.partLayout?.setFooterVisibility(false);
      this.relayout();
    }
  }
  relayout() {
    if (this.dimension && this.contentPosition) {
      this.layout(this.dimension.width, this.dimension.height, this.contentPosition.top, this.contentPosition.left);
    }
  }
  /**
   * Layout title and content area in the given dimension.
   */
  layoutContents(width, height) {
    const partLayout = assertIsDefined(this.partLayout);
    return partLayout.layout(width, height);
  }
  //#region ISerializableView
  _onDidChange = this._register(new Emitter());
  get onDidChange() {
    return this._onDidChange.event;
  }
  element;
  layout(width, height, top, left) {
    this._dimension = new Dimension(width, height);
    this._contentPosition = { top, left };
  }
  setVisible(visible) {
    this._onDidVisibilityChange.fire(visible);
  }
  //#endregion
}
class PartLayout {
  constructor(options, contentArea) {
    this.options = options;
    this.contentArea = contentArea;
  }
  static {
    __name(this, "PartLayout");
  }
  static HEADER_HEIGHT = 35;
  static TITLE_HEIGHT = 35;
  static Footer_HEIGHT = 35;
  headerVisible = false;
  footerVisible = false;
  layout(width, height) {
    let titleSize;
    if (this.options.hasTitle) {
      titleSize = new Dimension(width, Math.min(height, PartLayout.TITLE_HEIGHT));
    } else {
      titleSize = Dimension.None;
    }
    let headerSize;
    if (this.headerVisible) {
      headerSize = new Dimension(width, Math.min(height, PartLayout.HEADER_HEIGHT));
    } else {
      headerSize = Dimension.None;
    }
    let footerSize;
    if (this.footerVisible) {
      footerSize = new Dimension(width, Math.min(height, PartLayout.Footer_HEIGHT));
    } else {
      footerSize = Dimension.None;
    }
    let contentWidth = width;
    if (this.options && typeof this.options.borderWidth === "function") {
      contentWidth -= this.options.borderWidth();
    }
    const contentSize = new Dimension(contentWidth, height - titleSize.height - headerSize.height - footerSize.height);
    if (this.contentArea) {
      size(this.contentArea, contentSize.width, contentSize.height);
    }
    return { headerSize, titleSize, contentSize, footerSize };
  }
  setFooterVisibility(visible) {
    this.footerVisible = visible;
  }
  setHeaderVisibility(visible) {
    this.headerVisible = visible;
  }
}
class MultiWindowParts extends Component {
  static {
    __name(this, "MultiWindowParts");
  }
  _parts = /* @__PURE__ */ new Set();
  get parts() {
    return Array.from(this._parts);
  }
  registerPart(part) {
    this._parts.add(part);
    return toDisposable(() => this.unregisterPart(part));
  }
  unregisterPart(part) {
    this._parts.delete(part);
  }
  getPart(container) {
    return this.getPartByDocument(container.ownerDocument);
  }
  getPartByDocument(document) {
    if (this._parts.size > 1) {
      for (const part of this._parts) {
        if (part.element?.ownerDocument === document) {
          return part;
        }
      }
    }
    return this.mainPart;
  }
  get activePart() {
    return this.getPartByDocument(getActiveDocument());
  }
}
export {
  MultiWindowParts,
  Part
};
//# sourceMappingURL=part.js.map
