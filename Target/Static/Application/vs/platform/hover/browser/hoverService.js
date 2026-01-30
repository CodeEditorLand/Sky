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
import { registerSingleton } from "../../instantiation/common/extensions.js";
import { registerThemingParticipant } from "../../theme/common/themeService.js";
import { editorHoverBorder } from "../../theme/common/colorRegistry.js";
import { IHoverService } from "./hover.js";
import { IContextMenuService } from "../../contextview/browser/contextView.js";
import { IInstantiationService } from "../../instantiation/common/instantiation.js";
import { HoverWidget } from "./hoverWidget.js";
import { Disposable, DisposableStore, toDisposable } from "../../../base/common/lifecycle.js";
import { addDisposableListener, EventType, getActiveElement, isAncestorOfActiveElement, isAncestor, getWindow, isHTMLElement, isEditableElement } from "../../../base/browser/dom.js";
import { IKeybindingService } from "../../keybinding/common/keybinding.js";
import { StandardKeyboardEvent } from "../../../base/browser/keyboardEvent.js";
import { IAccessibilityService } from "../../accessibility/common/accessibility.js";
import { ILayoutService } from "../../layout/browser/layoutService.js";
import { mainWindow } from "../../../base/browser/window.js";
import { ContextViewHandler } from "../../contextview/browser/contextViewService.js";
import { isManagedHoverTooltipMarkdownString } from "../../../base/browser/ui/hover/hover.js";
import { ManagedHoverWidget } from "./updatableHoverWidget.js";
import { timeout, TimeoutTimer } from "../../../base/common/async.js";
import { IConfigurationService } from "../../configuration/common/configuration.js";
import { isNumber, isString } from "../../../base/common/types.js";
import { KeyChord } from "../../../base/common/keyCodes.js";
import { KeybindingsRegistry } from "../../keybinding/common/keybindingsRegistry.js";
import { stripIcons } from "../../../base/common/iconLabels.js";
let HoverService = class HoverService2 extends Disposable {
  static {
    __name(this, "HoverService");
  }
  constructor(_instantiationService, _configurationService, contextMenuService, _keybindingService, _layoutService, _accessibilityService) {
    super();
    this._instantiationService = _instantiationService;
    this._configurationService = _configurationService;
    this._keybindingService = _keybindingService;
    this._layoutService = _layoutService;
    this._accessibilityService = _accessibilityService;
    this._currentDelayedHoverWasShown = false;
    this._delayedHovers = /* @__PURE__ */ new Map();
    this._managedHovers = /* @__PURE__ */ new Map();
    this._register(contextMenuService.onDidShowContextMenu(() => this.hideHover()));
    this._contextViewHandler = this._register(new ContextViewHandler(this._layoutService));
    this._register(KeybindingsRegistry.registerCommandAndKeybindingRule({
      id: "workbench.action.showHover",
      weight: 0,
      primary: KeyChord(
        2048 | 41,
        2048 | 39
        /* KeyCode.KeyI */
      ),
      handler: /* @__PURE__ */ __name(() => {
        this._showAndFocusHoverForActiveElement();
      }, "handler")
    }));
  }
  showInstantHover(options, focus, skipLastFocusedUpdate, dontShow) {
    const hover = this._createHover(options, skipLastFocusedUpdate);
    if (!hover) {
      return void 0;
    }
    this._showHover(hover, options, focus);
    return hover;
  }
  showDelayedHover(options, lifecycleOptions) {
    if (options.id === void 0) {
      options.id = getHoverIdFromContent(options.content);
    }
    if (!this._currentDelayedHover || this._currentDelayedHoverWasShown) {
      if (this._currentHover?.isLocked) {
        return void 0;
      }
      if (getHoverOptionsIdentity(this._currentHoverOptions) === getHoverOptionsIdentity(options)) {
        return this._currentHover;
      }
      if (this._currentHover && !this._currentHover.isDisposed && this._currentDelayedHoverGroupId !== void 0 && this._currentDelayedHoverGroupId === lifecycleOptions?.groupId) {
        return this.showInstantHover({
          ...options,
          appearance: {
            ...options.appearance,
            skipFadeInAnimation: true
          }
        });
      }
    } else if (this._currentDelayedHover && getHoverOptionsIdentity(this._currentHoverOptions) === getHoverOptionsIdentity(options)) {
      return this._currentDelayedHover;
    }
    const hover = this._createHover(options, void 0);
    if (!hover) {
      this._currentDelayedHover = void 0;
      this._currentDelayedHoverWasShown = false;
      this._currentDelayedHoverGroupId = void 0;
      return void 0;
    }
    this._currentDelayedHover = hover;
    this._currentDelayedHoverWasShown = false;
    this._currentDelayedHoverGroupId = lifecycleOptions?.groupId;
    timeout(this._configurationService.getValue("workbench.hover.delay")).then(() => {
      if (hover && !hover.isDisposed) {
        this._currentDelayedHoverWasShown = true;
        this._showHover(hover, options);
      }
    });
    return hover;
  }
  setupDelayedHover(target, options, lifecycleOptions) {
    const resolveHoverOptions = /* @__PURE__ */ __name((e) => {
      const resolved = {
        ...typeof options === "function" ? options() : options,
        target
      };
      if (resolved.style === 2 && e) {
        resolved.target = resolveMouseStyleHoverTarget(target, e);
      }
      return resolved;
    }, "resolveHoverOptions");
    return this._setupDelayedHover(target, resolveHoverOptions, lifecycleOptions);
  }
  setupDelayedHoverAtMouse(target, options, lifecycleOptions) {
    const resolveHoverOptions = /* @__PURE__ */ __name((e) => ({
      ...typeof options === "function" ? options() : options,
      target: e ? resolveMouseStyleHoverTarget(target, e) : target
    }), "resolveHoverOptions");
    return this._setupDelayedHover(target, resolveHoverOptions, lifecycleOptions);
  }
  _setupDelayedHover(target, resolveHoverOptions, lifecycleOptions) {
    const store = new DisposableStore();
    store.add(addDisposableListener(target, EventType.MOUSE_OVER, (e) => {
      this.showDelayedHover(resolveHoverOptions(e), {
        groupId: lifecycleOptions?.groupId
      });
    }));
    if (lifecycleOptions?.setupKeyboardEvents) {
      store.add(addDisposableListener(target, EventType.KEY_DOWN, (e) => {
        const evt = new StandardKeyboardEvent(e);
        if (evt.equals(
          10
          /* KeyCode.Space */
        ) || evt.equals(
          3
          /* KeyCode.Enter */
        )) {
          this.showInstantHover(resolveHoverOptions(), true);
        }
      }));
    }
    this._delayedHovers.set(target, { show: /* @__PURE__ */ __name((focus) => {
      this.showInstantHover(resolveHoverOptions(), focus);
    }, "show") });
    store.add(toDisposable(() => this._delayedHovers.delete(target)));
    return store;
  }
  _createHover(options, skipLastFocusedUpdate) {
    this._currentDelayedHover = void 0;
    if (options.content === "") {
      return void 0;
    }
    if (this._currentHover?.isLocked) {
      return void 0;
    }
    if (options.id === void 0) {
      options.id = getHoverIdFromContent(options.content);
    }
    if (getHoverOptionsIdentity(this._currentHoverOptions) === getHoverOptionsIdentity(options)) {
      return void 0;
    }
    this._currentHoverOptions = options;
    this._lastHoverOptions = options;
    const trapFocus = options.trapFocus || this._accessibilityService.isScreenReaderOptimized();
    const activeElement = getActiveElement();
    if (!skipLastFocusedUpdate) {
      if (trapFocus && activeElement) {
        if (!activeElement.classList.contains("monaco-hover")) {
          this._lastFocusedElementBeforeOpen = activeElement;
        }
      } else {
        this._lastFocusedElementBeforeOpen = void 0;
      }
    }
    const hoverDisposables = new DisposableStore();
    const hover = this._instantiationService.createInstance(HoverWidget, options);
    if (options.persistence?.sticky) {
      hover.isLocked = true;
    }
    if (options.position?.hoverPosition && !isNumber(options.position.hoverPosition)) {
      options.target = {
        targetElements: isHTMLElement(options.target) ? [options.target] : options.target.targetElements,
        x: options.position.hoverPosition.x + 10
      };
    }
    hover.onDispose(() => {
      const hoverWasFocused = this._currentHover?.domNode && isAncestorOfActiveElement(this._currentHover.domNode);
      if (hoverWasFocused) {
        this._lastFocusedElementBeforeOpen?.focus();
      }
      if (getHoverOptionsIdentity(this._currentHoverOptions) === getHoverOptionsIdentity(options)) {
        this.doHideHover();
      }
      hoverDisposables.dispose();
    }, void 0, hoverDisposables);
    if (!options.container) {
      const targetElement = isHTMLElement(options.target) ? options.target : options.target.targetElements[0];
      options.container = this._layoutService.getContainer(getWindow(targetElement));
    }
    hover.onRequestLayout(() => this._contextViewHandler.layout(), void 0, hoverDisposables);
    if (options.persistence?.sticky) {
      hoverDisposables.add(addDisposableListener(getWindow(options.container).document, EventType.MOUSE_DOWN, (e) => {
        if (!isAncestor(e.target, hover.domNode)) {
          this.doHideHover();
        }
      }));
    } else {
      if ("targetElements" in options.target) {
        for (const element of options.target.targetElements) {
          hoverDisposables.add(addDisposableListener(element, EventType.CLICK, () => this.hideHover()));
        }
      } else {
        hoverDisposables.add(addDisposableListener(options.target, EventType.CLICK, () => this.hideHover()));
      }
      const focusedElement = getActiveElement();
      if (focusedElement) {
        const focusedElementDocument = getWindow(focusedElement).document;
        hoverDisposables.add(addDisposableListener(focusedElement, EventType.KEY_DOWN, (e) => this._keyDown(e, hover, !!options.persistence?.hideOnKeyDown)));
        hoverDisposables.add(addDisposableListener(focusedElementDocument, EventType.KEY_DOWN, (e) => this._keyDown(e, hover, !!options.persistence?.hideOnKeyDown)));
        hoverDisposables.add(addDisposableListener(focusedElement, EventType.KEY_UP, (e) => this._keyUp(e, hover)));
        hoverDisposables.add(addDisposableListener(focusedElementDocument, EventType.KEY_UP, (e) => this._keyUp(e, hover)));
      }
    }
    if ("IntersectionObserver" in mainWindow) {
      const observer = new IntersectionObserver((e) => this._intersectionChange(e, hover), { threshold: 0 });
      const firstTargetElement = "targetElements" in options.target ? options.target.targetElements[0] : options.target;
      observer.observe(firstTargetElement);
      hoverDisposables.add(toDisposable(() => observer.disconnect()));
    }
    this._currentHover = hover;
    return hover;
  }
  _showHover(hover, options, focus) {
    this._contextViewHandler.showContextView(new HoverContextViewDelegate(hover, focus), options.container);
  }
  hideHover(force) {
    if (!force && this._currentHover?.isLocked || !this._currentHoverOptions) {
      return;
    }
    this.doHideHover();
  }
  doHideHover() {
    this._currentHover = void 0;
    this._currentHoverOptions = void 0;
    this._contextViewHandler.hideContextView();
  }
  _intersectionChange(entries, hover) {
    const entry = entries[entries.length - 1];
    if (!entry.isIntersecting) {
      hover.dispose();
    }
  }
  showAndFocusLastHover() {
    if (!this._lastHoverOptions) {
      return;
    }
    this.showInstantHover(this._lastHoverOptions, true, true);
  }
  _showAndFocusHoverForActiveElement() {
    let activeElement = getActiveElement();
    while (activeElement) {
      const hover = this._delayedHovers.get(activeElement) ?? this._managedHovers.get(activeElement);
      if (hover) {
        hover.show(true);
        return;
      }
      activeElement = activeElement.parentElement;
    }
  }
  _keyDown(e, hover, hideOnKeyDown) {
    if (e.key === "Alt") {
      hover.isLocked = true;
      return;
    }
    const event = new StandardKeyboardEvent(e);
    const keybinding = this._keybindingService.resolveKeyboardEvent(event);
    if (keybinding.getSingleModifierDispatchChords().some((value) => !!value) || this._keybindingService.softDispatch(event, event.target).kind !== 0) {
      return;
    }
    if (hideOnKeyDown && (!this._currentHoverOptions?.trapFocus || e.key !== "Tab")) {
      this.hideHover();
      this._lastFocusedElementBeforeOpen?.focus();
    }
  }
  _keyUp(e, hover) {
    if (e.key === "Alt") {
      hover.isLocked = false;
      if (!hover.isMouseIn) {
        this.hideHover();
        this._lastFocusedElementBeforeOpen?.focus();
      }
    }
  }
  // TODO: Investigate performance of this function. There seems to be a lot of content created
  //       and thrown away on start up
  setupManagedHover(hoverDelegate, targetElement, content, options) {
    if (hoverDelegate.showNativeHover) {
      return setupNativeHover(targetElement, content);
    }
    targetElement.setAttribute("custom-hover", "true");
    if (targetElement.title !== "") {
      console.warn("HTML element already has a title attribute, which will conflict with the custom hover. Please remove the title attribute.");
      console.trace("Stack trace:", targetElement.title);
      targetElement.title = "";
    }
    let hoverPreparation;
    let hoverWidget;
    const hideHover = /* @__PURE__ */ __name((disposeWidget, disposePreparation) => {
      const hadHover = hoverWidget !== void 0;
      if (disposeWidget) {
        hoverWidget?.dispose();
        hoverWidget = void 0;
      }
      if (disposePreparation) {
        hoverPreparation?.dispose();
        hoverPreparation = void 0;
      }
      if (hadHover) {
        hoverDelegate.onDidHideHover?.();
        hoverWidget = void 0;
      }
    }, "hideHover");
    const triggerShowHover = /* @__PURE__ */ __name((delay, focus, target, trapFocus) => {
      return new TimeoutTimer(async () => {
        if (!hoverWidget || hoverWidget.isDisposed) {
          hoverWidget = new ManagedHoverWidget(hoverDelegate, target || targetElement, delay > 0);
          await hoverWidget.update(typeof content === "function" ? content() : content, focus, { ...options, trapFocus });
        }
      }, delay);
    }, "triggerShowHover");
    const store = new DisposableStore();
    let isMouseDown = false;
    store.add(addDisposableListener(targetElement, EventType.MOUSE_DOWN, () => {
      isMouseDown = true;
      hideHover(true, true);
    }, true));
    store.add(addDisposableListener(targetElement, EventType.MOUSE_UP, () => {
      isMouseDown = false;
    }, true));
    store.add(addDisposableListener(targetElement, EventType.MOUSE_LEAVE, (e) => {
      isMouseDown = false;
      hideHover(false, e.fromElement === targetElement);
    }, true));
    store.add(addDisposableListener(targetElement, EventType.MOUSE_OVER, (e) => {
      if (hoverPreparation) {
        return;
      }
      const mouseOverStore = new DisposableStore();
      const target = {
        targetElements: [targetElement],
        dispose: /* @__PURE__ */ __name(() => {
        }, "dispose")
      };
      if (hoverDelegate.placement === void 0 || hoverDelegate.placement === "mouse") {
        const onMouseMove = /* @__PURE__ */ __name((e2) => {
          target.x = e2.x + 10;
          if (!eventIsRelatedToTarget(e2, targetElement)) {
            hideHover(true, true);
          }
        }, "onMouseMove");
        mouseOverStore.add(addDisposableListener(targetElement, EventType.MOUSE_MOVE, onMouseMove, true));
      }
      hoverPreparation = mouseOverStore;
      if (!eventIsRelatedToTarget(e, targetElement)) {
        return;
      }
      mouseOverStore.add(triggerShowHover(typeof hoverDelegate.delay === "function" ? hoverDelegate.delay(content) : hoverDelegate.delay, false, target));
    }, true));
    const onFocus = /* @__PURE__ */ __name((e) => {
      if (isMouseDown || hoverPreparation) {
        return;
      }
      if (!eventIsRelatedToTarget(e, targetElement)) {
        return;
      }
      const target = {
        targetElements: [targetElement],
        dispose: /* @__PURE__ */ __name(() => {
        }, "dispose")
      };
      const toDispose = new DisposableStore();
      const onBlur = /* @__PURE__ */ __name(() => hideHover(true, true), "onBlur");
      toDispose.add(addDisposableListener(targetElement, EventType.BLUR, onBlur, true));
      toDispose.add(triggerShowHover(typeof hoverDelegate.delay === "function" ? hoverDelegate.delay(content) : hoverDelegate.delay, false, target));
      hoverPreparation = toDispose;
    }, "onFocus");
    if (!isEditableElement(targetElement)) {
      store.add(addDisposableListener(targetElement, EventType.FOCUS, onFocus, true));
    }
    const hover = {
      show: /* @__PURE__ */ __name((focus) => {
        hideHover(false, true);
        triggerShowHover(0, focus, void 0, focus);
      }, "show"),
      hide: /* @__PURE__ */ __name(() => {
        hideHover(true, true);
      }, "hide"),
      update: /* @__PURE__ */ __name(async (newContent, hoverOptions) => {
        content = newContent;
        await hoverWidget?.update(content, void 0, hoverOptions);
      }, "update"),
      dispose: /* @__PURE__ */ __name(() => {
        this._managedHovers.delete(targetElement);
        store.dispose();
        hideHover(true, true);
      }, "dispose")
    };
    this._managedHovers.set(targetElement, hover);
    return hover;
  }
  showManagedHover(target) {
    const hover = this._managedHovers.get(target);
    if (hover) {
      hover.show(true);
    }
  }
  dispose() {
    this._managedHovers.forEach((hover) => hover.dispose());
    super.dispose();
  }
};
HoverService = __decorate([
  __param(0, IInstantiationService),
  __param(1, IConfigurationService),
  __param(2, IContextMenuService),
  __param(3, IKeybindingService),
  __param(4, ILayoutService),
  __param(5, IAccessibilityService)
], HoverService);
function getHoverOptionsIdentity(options) {
  if (options === void 0) {
    return void 0;
  }
  return options?.id ?? options;
}
__name(getHoverOptionsIdentity, "getHoverOptionsIdentity");
function getHoverIdFromContent(content) {
  if (isHTMLElement(content)) {
    return void 0;
  }
  if (typeof content === "string") {
    return content.toString();
  }
  return content.value;
}
__name(getHoverIdFromContent, "getHoverIdFromContent");
function getStringContent(contentOrFactory) {
  const content = typeof contentOrFactory === "function" ? contentOrFactory() : contentOrFactory;
  if (isString(content)) {
    return stripIcons(content);
  }
  if (isManagedHoverTooltipMarkdownString(content)) {
    return content.markdownNotSupportedFallback;
  }
  return void 0;
}
__name(getStringContent, "getStringContent");
function setupNativeHover(targetElement, content) {
  function updateTitle(title) {
    if (title) {
      targetElement.setAttribute("title", title);
    } else {
      targetElement.removeAttribute("title");
    }
  }
  __name(updateTitle, "updateTitle");
  updateTitle(getStringContent(content));
  return {
    update: /* @__PURE__ */ __name((content2) => updateTitle(getStringContent(content2)), "update"),
    show: /* @__PURE__ */ __name(() => {
    }, "show"),
    hide: /* @__PURE__ */ __name(() => {
    }, "hide"),
    dispose: /* @__PURE__ */ __name(() => updateTitle(void 0), "dispose")
  };
}
__name(setupNativeHover, "setupNativeHover");
class HoverContextViewDelegate {
  static {
    __name(this, "HoverContextViewDelegate");
  }
  get anchorPosition() {
    return this._hover.anchor;
  }
  constructor(_hover, _focus = false) {
    this._hover = _hover;
    this._focus = _focus;
    this.layer = 1;
  }
  render(container) {
    this._hover.render(container);
    if (this._focus) {
      this._hover.focus();
    }
    return this._hover;
  }
  getAnchor() {
    return {
      x: this._hover.x,
      y: this._hover.y
    };
  }
  layout() {
    this._hover.layout();
  }
}
function eventIsRelatedToTarget(event, target) {
  return isHTMLElement(event.target) && getHoverTargetElement(event.target, target) === target;
}
__name(eventIsRelatedToTarget, "eventIsRelatedToTarget");
function getHoverTargetElement(element, stopElement) {
  stopElement = stopElement ?? getWindow(element).document.body;
  while (!element.hasAttribute("custom-hover") && element !== stopElement) {
    element = element.parentElement;
  }
  return element;
}
__name(getHoverTargetElement, "getHoverTargetElement");
function resolveMouseStyleHoverTarget(target, e) {
  return {
    targetElements: [target],
    x: e.x + 10
  };
}
__name(resolveMouseStyleHoverTarget, "resolveMouseStyleHoverTarget");
registerSingleton(
  IHoverService,
  HoverService,
  1
  /* InstantiationType.Delayed */
);
registerThemingParticipant((theme, collector) => {
  const hoverBorder = theme.getColor(editorHoverBorder);
  if (hoverBorder) {
    collector.addRule(`.monaco-hover.workbench-hover .hover-row:not(:first-child):not(:empty) { border-top: 1px solid ${hoverBorder.transparent(0.5)}; }`);
    collector.addRule(`.monaco-hover.workbench-hover hr { border-top: 1px solid ${hoverBorder.transparent(0.5)}; }`);
  }
});
export {
  HoverService
};
//# sourceMappingURL=hoverService.js.map
