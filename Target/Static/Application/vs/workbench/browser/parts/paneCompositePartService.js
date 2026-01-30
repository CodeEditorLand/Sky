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
import { Event } from "../../../base/common/event.js";
import { assertReturnsDefined } from "../../../base/common/types.js";
import { registerSingleton } from "../../../platform/instantiation/common/extensions.js";
import { IInstantiationService } from "../../../platform/instantiation/common/instantiation.js";
import { AuxiliaryBarPart } from "./auxiliarybar/auxiliaryBarPart.js";
import { PanelPart } from "./panel/panelPart.js";
import { SidebarPart } from "./sidebar/sidebarPart.js";
import { ViewContainerLocations } from "../../common/views.js";
import { IPaneCompositePartService } from "../../services/panecomposite/browser/panecomposite.js";
import { Disposable, DisposableStore } from "../../../base/common/lifecycle.js";
let PaneCompositePartService = class PaneCompositePartService2 extends Disposable {
  static {
    __name(this, "PaneCompositePartService");
  }
  constructor(instantiationService) {
    super();
    this.paneCompositeParts = /* @__PURE__ */ new Map();
    const panelPart = instantiationService.createInstance(PanelPart);
    const sideBarPart = instantiationService.createInstance(SidebarPart);
    const auxiliaryBarPart = instantiationService.createInstance(AuxiliaryBarPart);
    this.paneCompositeParts.set(1, panelPart);
    this.paneCompositeParts.set(0, sideBarPart);
    this.paneCompositeParts.set(2, auxiliaryBarPart);
    const eventDisposables = this._register(new DisposableStore());
    this.onDidPaneCompositeOpen = Event.any(...ViewContainerLocations.map((loc) => Event.map(this.paneCompositeParts.get(loc).onDidPaneCompositeOpen, (composite) => {
      return { composite, viewContainerLocation: loc };
    }, eventDisposables)));
    this.onDidPaneCompositeClose = Event.any(...ViewContainerLocations.map((loc) => Event.map(this.paneCompositeParts.get(loc).onDidPaneCompositeClose, (composite) => {
      return { composite, viewContainerLocation: loc };
    }, eventDisposables)));
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
PaneCompositePartService = __decorate([
  __param(0, IInstantiationService)
], PaneCompositePartService);
registerSingleton(
  IPaneCompositePartService,
  PaneCompositePartService,
  1
  /* InstantiationType.Delayed */
);
export {
  PaneCompositePartService
};
//# sourceMappingURL=paneCompositePartService.js.map
