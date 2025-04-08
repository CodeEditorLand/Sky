var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { getActiveWindow } from "../../../../../base/browser/dom.js";
import { ISettableObservable, observableValue, ITransaction, IReader, observableSignal } from "../../../../../base/common/observable.js";
class AnimatedValue {
  constructor(startValue, endValue, durationMs, _interpolationFunction = easeOutExpo) {
    this.startValue = startValue;
    this.endValue = endValue;
    this.durationMs = durationMs;
    this._interpolationFunction = _interpolationFunction;
    if (startValue === endValue) {
      this.durationMs = 0;
    }
  }
  static {
    __name(this, "AnimatedValue");
  }
  static const(value) {
    return new AnimatedValue(value, value, 0);
  }
  startTimeMs = Date.now();
  isFinished() {
    return Date.now() >= this.startTimeMs + this.durationMs;
  }
  getValue() {
    const timePassed = Date.now() - this.startTimeMs;
    if (timePassed >= this.durationMs) {
      return this.endValue;
    }
    const value = this._interpolationFunction(timePassed, this.startValue, this.endValue - this.startValue, this.durationMs);
    return value;
  }
}
function easeOutExpo(passedTime, start, length, totalDuration) {
  return passedTime === totalDuration ? start + length : length * (-Math.pow(2, -10 * passedTime / totalDuration) + 1) + start;
}
__name(easeOutExpo, "easeOutExpo");
function easeOutCubic(passedTime, start, length, totalDuration) {
  return length * ((passedTime = passedTime / totalDuration - 1) * passedTime * passedTime + 1) + start;
}
__name(easeOutCubic, "easeOutCubic");
function linear(passedTime, start, length, totalDuration) {
  return length * passedTime / totalDuration + start;
}
__name(linear, "linear");
class ObservableAnimatedValue {
  static {
    __name(this, "ObservableAnimatedValue");
  }
  static const(value) {
    return new ObservableAnimatedValue(AnimatedValue.const(value));
  }
  _value;
  constructor(initialValue) {
    this._value = observableValue(this, initialValue);
  }
  setAnimation(value, tx) {
    this._value.set(value, tx);
  }
  changeAnimation(fn, tx) {
    const value = fn(this._value.get());
    this._value.set(value, tx);
  }
  getValue(reader) {
    const value = this._value.read(reader);
    if (!value.isFinished()) {
      Scheduler.instance.invalidateOnNextAnimationFrame(reader);
    }
    return value.getValue();
  }
}
class Scheduler {
  static {
    __name(this, "Scheduler");
  }
  static instance = new Scheduler();
  _counter = observableSignal(this);
  _isScheduled = false;
  invalidateOnNextAnimationFrame(reader) {
    this._counter.read(reader);
    if (!this._isScheduled) {
      this._isScheduled = true;
      getActiveWindow().requestAnimationFrame(() => {
        this._isScheduled = false;
        this._update();
      });
    }
  }
  _update() {
    this._counter.trigger(void 0);
  }
}
export {
  AnimatedValue,
  ObservableAnimatedValue,
  easeOutCubic,
  easeOutExpo,
  linear
};
//# sourceMappingURL=animation.js.map
