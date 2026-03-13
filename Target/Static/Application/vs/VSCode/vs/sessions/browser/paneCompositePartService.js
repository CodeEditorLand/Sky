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
import { Emitter } from "../../base/common/event.js";
import { assertReturnsDefined } from "../../base/common/types.js";
import { IInstantiationService } from "../../platform/instantiation/common/instantiation.js";
import { IPaneCompositePartService } from "../../workbench/services/panecomposite/browser/panecomposite.js";
import { Disposable } from "../../base/common/lifecycle.js";
import { PanelPart } from "./parts/panelPart.js";
import { SidebarPart } from "./parts/sidebarPart.js";
import { AuxiliaryBarPart } from "./parts/auxiliaryBarPart.js";
import { ChatBarPart } from "./parts/chatBarPart.js";
import { registerSingleton } from "../../platform/instantiation/common/extensions.js";
let AgenticPaneCompositePartService = class AgenticPaneCompositePartService2 extends Disposable {
  static {
    __name(this, "AgenticPaneCompositePartService");
  }
  constructor(instantiationService) {
    super();
    this._onDidPaneCompositeOpen = this._register(new Emitter());
    this.onDidPaneCompositeOpen = this._onDidPaneCompositeOpen.event;
    this._onDidPaneCompositeClose = this._register(new Emitter());
    this.onDidPaneCompositeClose = this._onDidPaneCompositeClose.event;
    this.paneCompositeParts = /* @__PURE__ */ new Map();
    this.registerPart(1, instantiationService.createInstance(PanelPart));
    this.registerPart(0, instantiationService.createInstance(SidebarPart));
    this.registerPart(2, instantiationService.createInstance(AuxiliaryBarPart));
    this.registerPart(3, instantiationService.createInstance(ChatBarPart));
  }
  registerPart(location, part) {
    this.paneCompositeParts.set(location, part);
    this._register(part.onDidPaneCompositeOpen((composite) => this._onDidPaneCompositeOpen.fire({ composite, viewContainerLocation: location })));
    this._register(part.onDidPaneCompositeClose((composite) => this._onDidPaneCompositeClose.fire({ composite, viewContainerLocation: location })));
  }
  getRegistryId(viewContainerLocation) {
    return this.getPartByLocation(viewContainerLocation).registryId;
  }
  getPartId(viewContainerLocation) {
    return this.getPartByLocation(viewContainerLocation).partId;
  }
  openPaneComposite(id, viewContainerLocation, focus) {
    return this.getPartByLocation(viewContainerLocation).openPaneComposite(id, focus);
  }
  getActivePaneComposite(viewContainerLocation) {
    return this.getPartByLocation(viewContainerLocation).getActivePaneComposite();
  }
  getPaneComposite(id, viewContainerLocation) {
    return this.getPartByLocation(viewContainerLocation).getPaneComposite(id);
  }
  getPaneComposites(viewContainerLocation) {
    return this.getPartByLocation(viewContainerLocation).getPaneComposites();
  }
  getPinnedPaneCompositeIds(viewContainerLocation) {
    return this.getPartByLocation(viewContainerLocation).getPinnedPaneCompositeIds();
  }
  getVisiblePaneCompositeIds(viewContainerLocation) {
    return this.getPartByLocation(viewContainerLocation).getVisiblePaneCompositeIds();
  }
  getPaneCompositeIds(viewContainerLocation) {
    return this.getPartByLocation(viewContainerLocation).getPaneCompositeIds();
  }
  getProgressIndicator(id, viewContainerLocation) {
    return this.getPartByLocation(viewContainerLocation).getProgressIndicator(id);
  }
  hideActivePaneComposite(viewContainerLocation) {
    this.getPartByLocation(viewContainerLocation).hideActivePaneComposite();
  }
  getLastActivePaneCompositeId(viewContainerLocation) {
    return this.getPartByLocation(viewContainerLocation).getLastActivePaneCompositeId();
  }
  getPartByLocation(viewContainerLocation) {
    return assertReturnsDefined(this.paneCompositeParts.get(viewContainerLocation));
  }
};
AgenticPaneCompositePartService = __decorate([
  __param(0, IInstantiationService)
], AgenticPaneCompositePartService);
registerSingleton(
  IPaneCompositePartService,
  AgenticPaneCompositePartService,
  1
  /* InstantiationType.Delayed */
);
export {
  AgenticPaneCompositePartService
};
//# sourceMappingURL=paneCompositePartService.js.map
