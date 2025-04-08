var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ViewEventHandler } from "./viewEventHandler.js";
import { ViewEvent } from "./viewEvents.js";
import { IContentSizeChangedEvent } from "./editorCommon.js";
import { Emitter } from "../../base/common/event.js";
import { Selection } from "./core/selection.js";
import { Disposable } from "../../base/common/lifecycle.js";
import { CursorChangeReason } from "./cursorEvents.js";
import { IModelContentChangedEvent, IModelDecorationsChangedEvent, IModelLanguageChangedEvent, IModelLanguageConfigurationChangedEvent, IModelOptionsChangedEvent, IModelTokensChangedEvent } from "./textModelEvents.js";
class ViewModelEventDispatcher extends Disposable {
  static {
    __name(this, "ViewModelEventDispatcher");
  }
  _onEvent = this._register(new Emitter());
  onEvent = this._onEvent.event;
  _eventHandlers;
  _viewEventQueue;
  _isConsumingViewEventQueue;
  _collector;
  _collectorCnt;
  _outgoingEvents;
  constructor() {
    super();
    this._eventHandlers = [];
    this._viewEventQueue = null;
    this._isConsumingViewEventQueue = false;
    this._collector = null;
    this._collectorCnt = 0;
    this._outgoingEvents = [];
  }
  emitOutgoingEvent(e) {
    this._addOutgoingEvent(e);
    this._emitOutgoingEvents();
  }
  _addOutgoingEvent(e) {
    for (let i = 0, len = this._outgoingEvents.length; i < len; i++) {
      const mergeResult = this._outgoingEvents[i].kind === e.kind ? this._outgoingEvents[i].attemptToMerge(e) : null;
      if (mergeResult) {
        this._outgoingEvents[i] = mergeResult;
        return;
      }
    }
    this._outgoingEvents.push(e);
  }
  _emitOutgoingEvents() {
    while (this._outgoingEvents.length > 0) {
      if (this._collector || this._isConsumingViewEventQueue) {
        return;
      }
      const event = this._outgoingEvents.shift();
      if (event.isNoOp()) {
        continue;
      }
      this._onEvent.fire(event);
    }
  }
  addViewEventHandler(eventHandler) {
    for (let i = 0, len = this._eventHandlers.length; i < len; i++) {
      if (this._eventHandlers[i] === eventHandler) {
        console.warn("Detected duplicate listener in ViewEventDispatcher", eventHandler);
      }
    }
    this._eventHandlers.push(eventHandler);
  }
  removeViewEventHandler(eventHandler) {
    for (let i = 0; i < this._eventHandlers.length; i++) {
      if (this._eventHandlers[i] === eventHandler) {
        this._eventHandlers.splice(i, 1);
        break;
      }
    }
  }
  beginEmitViewEvents() {
    this._collectorCnt++;
    if (this._collectorCnt === 1) {
      this._collector = new ViewModelEventsCollector();
    }
    return this._collector;
  }
  endEmitViewEvents() {
    this._collectorCnt--;
    if (this._collectorCnt === 0) {
      const outgoingEvents = this._collector.outgoingEvents;
      const viewEvents = this._collector.viewEvents;
      this._collector = null;
      for (const outgoingEvent of outgoingEvents) {
        this._addOutgoingEvent(outgoingEvent);
      }
      if (viewEvents.length > 0) {
        this._emitMany(viewEvents);
      }
    }
    this._emitOutgoingEvents();
  }
  emitSingleViewEvent(event) {
    try {
      const eventsCollector = this.beginEmitViewEvents();
      eventsCollector.emitViewEvent(event);
    } finally {
      this.endEmitViewEvents();
    }
  }
  _emitMany(events) {
    if (this._viewEventQueue) {
      this._viewEventQueue = this._viewEventQueue.concat(events);
    } else {
      this._viewEventQueue = events;
    }
    if (!this._isConsumingViewEventQueue) {
      this._consumeViewEventQueue();
    }
  }
  _consumeViewEventQueue() {
    try {
      this._isConsumingViewEventQueue = true;
      this._doConsumeQueue();
    } finally {
      this._isConsumingViewEventQueue = false;
    }
  }
  _doConsumeQueue() {
    while (this._viewEventQueue) {
      const events = this._viewEventQueue;
      this._viewEventQueue = null;
      const eventHandlers = this._eventHandlers.slice(0);
      for (const eventHandler of eventHandlers) {
        eventHandler.handleEvents(events);
      }
    }
  }
}
class ViewModelEventsCollector {
  static {
    __name(this, "ViewModelEventsCollector");
  }
  viewEvents;
  outgoingEvents;
  constructor() {
    this.viewEvents = [];
    this.outgoingEvents = [];
  }
  emitViewEvent(event) {
    this.viewEvents.push(event);
  }
  emitOutgoingEvent(e) {
    this.outgoingEvents.push(e);
  }
}
var OutgoingViewModelEventKind = /* @__PURE__ */ ((OutgoingViewModelEventKind2) => {
  OutgoingViewModelEventKind2[OutgoingViewModelEventKind2["ContentSizeChanged"] = 0] = "ContentSizeChanged";
  OutgoingViewModelEventKind2[OutgoingViewModelEventKind2["FocusChanged"] = 1] = "FocusChanged";
  OutgoingViewModelEventKind2[OutgoingViewModelEventKind2["WidgetFocusChanged"] = 2] = "WidgetFocusChanged";
  OutgoingViewModelEventKind2[OutgoingViewModelEventKind2["ScrollChanged"] = 3] = "ScrollChanged";
  OutgoingViewModelEventKind2[OutgoingViewModelEventKind2["ViewZonesChanged"] = 4] = "ViewZonesChanged";
  OutgoingViewModelEventKind2[OutgoingViewModelEventKind2["HiddenAreasChanged"] = 5] = "HiddenAreasChanged";
  OutgoingViewModelEventKind2[OutgoingViewModelEventKind2["ReadOnlyEditAttempt"] = 6] = "ReadOnlyEditAttempt";
  OutgoingViewModelEventKind2[OutgoingViewModelEventKind2["CursorStateChanged"] = 7] = "CursorStateChanged";
  OutgoingViewModelEventKind2[OutgoingViewModelEventKind2["ModelDecorationsChanged"] = 8] = "ModelDecorationsChanged";
  OutgoingViewModelEventKind2[OutgoingViewModelEventKind2["ModelLanguageChanged"] = 9] = "ModelLanguageChanged";
  OutgoingViewModelEventKind2[OutgoingViewModelEventKind2["ModelLanguageConfigurationChanged"] = 10] = "ModelLanguageConfigurationChanged";
  OutgoingViewModelEventKind2[OutgoingViewModelEventKind2["ModelContentChanged"] = 11] = "ModelContentChanged";
  OutgoingViewModelEventKind2[OutgoingViewModelEventKind2["ModelOptionsChanged"] = 12] = "ModelOptionsChanged";
  OutgoingViewModelEventKind2[OutgoingViewModelEventKind2["ModelTokensChanged"] = 13] = "ModelTokensChanged";
  return OutgoingViewModelEventKind2;
})(OutgoingViewModelEventKind || {});
class ContentSizeChangedEvent {
  static {
    __name(this, "ContentSizeChangedEvent");
  }
  kind = 0 /* ContentSizeChanged */;
  _oldContentWidth;
  _oldContentHeight;
  contentWidth;
  contentHeight;
  contentWidthChanged;
  contentHeightChanged;
  constructor(oldContentWidth, oldContentHeight, contentWidth, contentHeight) {
    this._oldContentWidth = oldContentWidth;
    this._oldContentHeight = oldContentHeight;
    this.contentWidth = contentWidth;
    this.contentHeight = contentHeight;
    this.contentWidthChanged = this._oldContentWidth !== this.contentWidth;
    this.contentHeightChanged = this._oldContentHeight !== this.contentHeight;
  }
  isNoOp() {
    return !this.contentWidthChanged && !this.contentHeightChanged;
  }
  attemptToMerge(other) {
    if (other.kind !== this.kind) {
      return null;
    }
    return new ContentSizeChangedEvent(this._oldContentWidth, this._oldContentHeight, other.contentWidth, other.contentHeight);
  }
}
class FocusChangedEvent {
  static {
    __name(this, "FocusChangedEvent");
  }
  kind = 1 /* FocusChanged */;
  oldHasFocus;
  hasFocus;
  constructor(oldHasFocus, hasFocus) {
    this.oldHasFocus = oldHasFocus;
    this.hasFocus = hasFocus;
  }
  isNoOp() {
    return this.oldHasFocus === this.hasFocus;
  }
  attemptToMerge(other) {
    if (other.kind !== this.kind) {
      return null;
    }
    return new FocusChangedEvent(this.oldHasFocus, other.hasFocus);
  }
}
class WidgetFocusChangedEvent {
  static {
    __name(this, "WidgetFocusChangedEvent");
  }
  kind = 2 /* WidgetFocusChanged */;
  oldHasFocus;
  hasFocus;
  constructor(oldHasFocus, hasFocus) {
    this.oldHasFocus = oldHasFocus;
    this.hasFocus = hasFocus;
  }
  isNoOp() {
    return this.oldHasFocus === this.hasFocus;
  }
  attemptToMerge(other) {
    if (other.kind !== this.kind) {
      return null;
    }
    return new FocusChangedEvent(this.oldHasFocus, other.hasFocus);
  }
}
class ScrollChangedEvent {
  static {
    __name(this, "ScrollChangedEvent");
  }
  kind = 3 /* ScrollChanged */;
  _oldScrollWidth;
  _oldScrollLeft;
  _oldScrollHeight;
  _oldScrollTop;
  scrollWidth;
  scrollLeft;
  scrollHeight;
  scrollTop;
  scrollWidthChanged;
  scrollLeftChanged;
  scrollHeightChanged;
  scrollTopChanged;
  constructor(oldScrollWidth, oldScrollLeft, oldScrollHeight, oldScrollTop, scrollWidth, scrollLeft, scrollHeight, scrollTop) {
    this._oldScrollWidth = oldScrollWidth;
    this._oldScrollLeft = oldScrollLeft;
    this._oldScrollHeight = oldScrollHeight;
    this._oldScrollTop = oldScrollTop;
    this.scrollWidth = scrollWidth;
    this.scrollLeft = scrollLeft;
    this.scrollHeight = scrollHeight;
    this.scrollTop = scrollTop;
    this.scrollWidthChanged = this._oldScrollWidth !== this.scrollWidth;
    this.scrollLeftChanged = this._oldScrollLeft !== this.scrollLeft;
    this.scrollHeightChanged = this._oldScrollHeight !== this.scrollHeight;
    this.scrollTopChanged = this._oldScrollTop !== this.scrollTop;
  }
  isNoOp() {
    return !this.scrollWidthChanged && !this.scrollLeftChanged && !this.scrollHeightChanged && !this.scrollTopChanged;
  }
  attemptToMerge(other) {
    if (other.kind !== this.kind) {
      return null;
    }
    return new ScrollChangedEvent(
      this._oldScrollWidth,
      this._oldScrollLeft,
      this._oldScrollHeight,
      this._oldScrollTop,
      other.scrollWidth,
      other.scrollLeft,
      other.scrollHeight,
      other.scrollTop
    );
  }
}
class ViewZonesChangedEvent {
  static {
    __name(this, "ViewZonesChangedEvent");
  }
  kind = 4 /* ViewZonesChanged */;
  constructor() {
  }
  isNoOp() {
    return false;
  }
  attemptToMerge(other) {
    if (other.kind !== this.kind) {
      return null;
    }
    return this;
  }
}
class HiddenAreasChangedEvent {
  static {
    __name(this, "HiddenAreasChangedEvent");
  }
  kind = 5 /* HiddenAreasChanged */;
  constructor() {
  }
  isNoOp() {
    return false;
  }
  attemptToMerge(other) {
    if (other.kind !== this.kind) {
      return null;
    }
    return this;
  }
}
class CursorStateChangedEvent {
  static {
    __name(this, "CursorStateChangedEvent");
  }
  kind = 7 /* CursorStateChanged */;
  oldSelections;
  selections;
  oldModelVersionId;
  modelVersionId;
  source;
  reason;
  reachedMaxCursorCount;
  constructor(oldSelections, selections, oldModelVersionId, modelVersionId, source, reason, reachedMaxCursorCount) {
    this.oldSelections = oldSelections;
    this.selections = selections;
    this.oldModelVersionId = oldModelVersionId;
    this.modelVersionId = modelVersionId;
    this.source = source;
    this.reason = reason;
    this.reachedMaxCursorCount = reachedMaxCursorCount;
  }
  static _selectionsAreEqual(a, b) {
    if (!a && !b) {
      return true;
    }
    if (!a || !b) {
      return false;
    }
    const aLen = a.length;
    const bLen = b.length;
    if (aLen !== bLen) {
      return false;
    }
    for (let i = 0; i < aLen; i++) {
      if (!a[i].equalsSelection(b[i])) {
        return false;
      }
    }
    return true;
  }
  isNoOp() {
    return CursorStateChangedEvent._selectionsAreEqual(this.oldSelections, this.selections) && this.oldModelVersionId === this.modelVersionId;
  }
  attemptToMerge(other) {
    if (other.kind !== this.kind) {
      return null;
    }
    return new CursorStateChangedEvent(
      this.oldSelections,
      other.selections,
      this.oldModelVersionId,
      other.modelVersionId,
      other.source,
      other.reason,
      this.reachedMaxCursorCount || other.reachedMaxCursorCount
    );
  }
}
class ReadOnlyEditAttemptEvent {
  static {
    __name(this, "ReadOnlyEditAttemptEvent");
  }
  kind = 6 /* ReadOnlyEditAttempt */;
  constructor() {
  }
  isNoOp() {
    return false;
  }
  attemptToMerge(other) {
    if (other.kind !== this.kind) {
      return null;
    }
    return this;
  }
}
class ModelDecorationsChangedEvent {
  constructor(event) {
    this.event = event;
  }
  static {
    __name(this, "ModelDecorationsChangedEvent");
  }
  kind = 8 /* ModelDecorationsChanged */;
  isNoOp() {
    return false;
  }
  attemptToMerge(other) {
    return null;
  }
}
class ModelLanguageChangedEvent {
  constructor(event) {
    this.event = event;
  }
  static {
    __name(this, "ModelLanguageChangedEvent");
  }
  kind = 9 /* ModelLanguageChanged */;
  isNoOp() {
    return false;
  }
  attemptToMerge(other) {
    return null;
  }
}
class ModelLanguageConfigurationChangedEvent {
  constructor(event) {
    this.event = event;
  }
  static {
    __name(this, "ModelLanguageConfigurationChangedEvent");
  }
  kind = 10 /* ModelLanguageConfigurationChanged */;
  isNoOp() {
    return false;
  }
  attemptToMerge(other) {
    return null;
  }
}
class ModelContentChangedEvent {
  constructor(event) {
    this.event = event;
  }
  static {
    __name(this, "ModelContentChangedEvent");
  }
  kind = 11 /* ModelContentChanged */;
  isNoOp() {
    return false;
  }
  attemptToMerge(other) {
    return null;
  }
}
class ModelOptionsChangedEvent {
  constructor(event) {
    this.event = event;
  }
  static {
    __name(this, "ModelOptionsChangedEvent");
  }
  kind = 12 /* ModelOptionsChanged */;
  isNoOp() {
    return false;
  }
  attemptToMerge(other) {
    return null;
  }
}
class ModelTokensChangedEvent {
  constructor(event) {
    this.event = event;
  }
  static {
    __name(this, "ModelTokensChangedEvent");
  }
  kind = 13 /* ModelTokensChanged */;
  isNoOp() {
    return false;
  }
  attemptToMerge(other) {
    return null;
  }
}
export {
  ContentSizeChangedEvent,
  CursorStateChangedEvent,
  FocusChangedEvent,
  HiddenAreasChangedEvent,
  ModelContentChangedEvent,
  ModelDecorationsChangedEvent,
  ModelLanguageChangedEvent,
  ModelLanguageConfigurationChangedEvent,
  ModelOptionsChangedEvent,
  ModelTokensChangedEvent,
  OutgoingViewModelEventKind,
  ReadOnlyEditAttemptEvent,
  ScrollChangedEvent,
  ViewModelEventDispatcher,
  ViewModelEventsCollector,
  ViewZonesChangedEvent,
  WidgetFocusChangedEvent
};
//# sourceMappingURL=viewModelEventDispatcher.js.map
