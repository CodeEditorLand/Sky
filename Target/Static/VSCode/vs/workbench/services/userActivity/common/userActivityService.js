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
import { disposableTimeout, RunOnceScheduler, runWhenGlobalIdle } from "../../../../base/common/async.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { Disposable, DisposableStore, IDisposable, toDisposable } from "../../../../base/common/lifecycle.js";
import { InstantiationType, registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { IInstantiationService, createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { userActivityRegistry } from "./userActivityRegistry.js";
const MARK_INACTIVE_DEBOUNCE = 1e4;
const IUserActivityService = createDecorator("IUserActivityService");
let UserActivityService = class extends Disposable {
  static {
    __name(this, "UserActivityService");
  }
  markInactive = this._register(new RunOnceScheduler(() => {
    this.isActive = false;
    this.changeEmitter.fire(false);
  }, MARK_INACTIVE_DEBOUNCE));
  changeEmitter = this._register(new Emitter());
  active = 0;
  /**
   * @inheritdoc
   *
   * Note: initialized to true, since the user just did something to open the
   * window. The bundled DomActivityTracker will initially assume activity
   * as well in order to unset this if the window gets abandoned.
   */
  isActive = true;
  /** @inheritdoc */
  onDidChangeIsActive = this.changeEmitter.event;
  constructor(instantiationService) {
    super();
    this._register(runWhenGlobalIdle(() => userActivityRegistry.take(this, instantiationService)));
  }
  /** @inheritdoc */
  markActive(opts) {
    if (opts?.whenHeldFor) {
      const store = new DisposableStore();
      store.add(disposableTimeout(() => store.add(this.markActive()), opts.whenHeldFor));
      return store;
    }
    if (++this.active === 1) {
      this.isActive = true;
      this.changeEmitter.fire(true);
      this.markInactive.cancel();
    }
    return toDisposable(() => {
      if (--this.active === 0) {
        this.markInactive.schedule();
      }
    });
  }
};
UserActivityService = __decorateClass([
  __decorateParam(0, IInstantiationService)
], UserActivityService);
registerSingleton(IUserActivityService, UserActivityService, InstantiationType.Delayed);
export {
  IUserActivityService,
  UserActivityService
};
//# sourceMappingURL=userActivityService.js.map
