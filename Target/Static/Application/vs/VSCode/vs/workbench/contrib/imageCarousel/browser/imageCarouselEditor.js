var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
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
var ImageCarouselEditor_1;
import { addDisposableListener, clearNode, EventType, h } from "../../../../base/browser/dom.js";
import { StandardKeyboardEvent } from "../../../../base/browser/keyboardEvent.js";
import { DisposableStore } from "../../../../base/common/lifecycle.js";
import { localize } from "../../../../nls.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { EditorPane } from "../../../browser/parts/editor/editorPane.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
let ImageCarouselEditor = class ImageCarouselEditor2 extends EditorPane {
  static {
    __name(this, "ImageCarouselEditor");
  }
  static {
    ImageCarouselEditor_1 = this;
  }
  static {
    this.ID = "workbench.editor.imageCarousel";
  }
  constructor(group, telemetryService, themeService, storageService) {
    super(ImageCarouselEditor_1.ID, group, telemetryService, themeService, storageService);
    this._currentIndex = 0;
    this._images = [];
    this._contentDisposables = this._register(new DisposableStore());
    this._imageDisposables = this._register(new DisposableStore());
    this._thumbnailElements = [];
  }
  createEditor(parent) {
    this._container = h("div.image-carousel-editor").root;
    parent.appendChild(this._container);
  }
  async setInput(input, options, context, token) {
    await super.setInput(input, options, context, token);
    this._images = input.collection.images;
    this._currentIndex = Math.min(input.startIndex, Math.max(0, input.collection.images.length - 1));
    this.buildSlideshow();
  }
  clearInput() {
    this._contentDisposables.clear();
    this._imageDisposables.clear();
    if (this._container) {
      clearNode(this._container);
    }
    this._elements = void 0;
    this._thumbnailElements = [];
    super.clearInput();
  }
  /**
   * Build the full DOM skeleton. Called once per setInput.
   */
  buildSlideshow() {
    if (!this._container) {
      return;
    }
    this._contentDisposables.clear();
    this._imageDisposables.clear();
    clearNode(this._container);
    if (this._images.length === 0) {
      const empty = h("div.empty-message");
      empty.root.textContent = localize("imageCarousel.noImages", "No images to display");
      this._container.appendChild(empty.root);
      return;
    }
    const elements = h("div.slideshow-container", [
      h("div.image-area@imageArea", [
        h("div.main-image-container", [
          h("img.main-image@mainImage")
        ]),
        h("button.nav-arrow.prev-arrow@prevBtn", { ariaLabel: localize("imageCarousel.previousImage", "Previous image") }, [
          h("span.codicon.codicon-chevron-left")
        ]),
        h("button.nav-arrow.next-arrow@nextBtn", { ariaLabel: localize("imageCarousel.nextImage", "Next image") }, [
          h("span.codicon.codicon-chevron-right")
        ])
      ]),
      h("div.image-counter@counter"),
      h("div.thumbnails-container@thumbnails")
    ]);
    this._elements = {
      root: elements.root,
      mainImage: elements.mainImage,
      prevBtn: elements.prevBtn,
      nextBtn: elements.nextBtn,
      counter: elements.counter,
      thumbnails: elements.thumbnails
    };
    this._contentDisposables.add(addDisposableListener(this._elements.prevBtn, "click", () => {
      if (this._currentIndex > 0) {
        this._currentIndex--;
        this.updateCurrentImage();
      }
    }));
    this._contentDisposables.add(addDisposableListener(this._elements.nextBtn, "click", () => {
      if (this._currentIndex < this._images.length - 1) {
        this._currentIndex++;
        this.updateCurrentImage();
      }
    }));
    this._contentDisposables.add(addDisposableListener(elements.root, EventType.KEY_DOWN, (e) => {
      const event = new StandardKeyboardEvent(e);
      if (event.keyCode === 15) {
        this.previous();
        event.stopPropagation();
        event.preventDefault();
      } else if (event.keyCode === 17) {
        this.next();
        event.stopPropagation();
        event.preventDefault();
      }
    }));
    elements.root.tabIndex = 0;
    this._thumbnailElements = [];
    for (let i = 0; i < this._images.length; i++) {
      const image = this._images[i];
      const thumbnail = h("button.thumbnail@root", [
        h("img.thumbnail-image@img")
      ]);
      const btn = thumbnail.root;
      btn.ariaLabel = localize("imageCarousel.thumbnailLabel", "Image {0} of {1}", i + 1, this._images.length);
      const img = thumbnail.img;
      const blob = new Blob([image.data.buffer.slice(0)], { type: image.mimeType });
      const url = URL.createObjectURL(blob);
      img.src = url;
      img.alt = image.name;
      this._contentDisposables.add({ dispose: /* @__PURE__ */ __name(() => URL.revokeObjectURL(url), "dispose") });
      this._contentDisposables.add(addDisposableListener(btn, "click", () => {
        this._currentIndex = i;
        this.updateCurrentImage();
      }));
      this._elements.thumbnails.appendChild(btn);
      this._thumbnailElements.push(btn);
    }
    this._container.appendChild(elements.root);
    this.updateCurrentImage();
  }
  /**
   * Update only the changing parts: main image src, counter, button states, thumbnail selection.
   * No DOM teardown/rebuild — eliminates the blank flash.
   */
  updateCurrentImage() {
    if (!this._elements) {
      return;
    }
    this._imageDisposables.clear();
    const currentImage = this._images[this._currentIndex];
    const blob = new Blob([currentImage.data.buffer.slice(0)], { type: currentImage.mimeType });
    const url = URL.createObjectURL(blob);
    this._elements.mainImage.src = url;
    this._elements.mainImage.alt = currentImage.name;
    this._imageDisposables.add({ dispose: /* @__PURE__ */ __name(() => URL.revokeObjectURL(url), "dispose") });
    this._elements.prevBtn.disabled = this._currentIndex === 0;
    this._elements.nextBtn.disabled = this._currentIndex === this._images.length - 1;
    this._elements.counter.textContent = localize("imageCarousel.counter", "{0} / {1}", this._currentIndex + 1, this._images.length);
    for (let i = 0; i < this._thumbnailElements.length; i++) {
      const isActive = i === this._currentIndex;
      const thumbnail = this._thumbnailElements[i];
      thumbnail.classList.toggle("active", isActive);
      if (isActive) {
        thumbnail.setAttribute("aria-current", "page");
      } else {
        thumbnail.removeAttribute("aria-current");
      }
    }
  }
  previous() {
    if (this._currentIndex > 0) {
      this._currentIndex--;
      this.updateCurrentImage();
    }
  }
  next() {
    if (this._currentIndex < this._images.length - 1) {
      this._currentIndex++;
      this.updateCurrentImage();
    }
  }
  focus() {
    super.focus();
    this._elements?.root.focus();
  }
  layout(dimension) {
    if (this._container) {
      this._container.style.width = `${dimension.width}px`;
      this._container.style.height = `${dimension.height}px`;
    }
  }
};
ImageCarouselEditor = ImageCarouselEditor_1 = __decorate([
  __param(1, ITelemetryService),
  __param(2, IThemeService),
  __param(3, IStorageService)
], ImageCarouselEditor);
export {
  ImageCarouselEditor
};
//# sourceMappingURL=imageCarouselEditor.js.map
