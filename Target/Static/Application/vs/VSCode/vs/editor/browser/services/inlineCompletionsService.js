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
var InlineCompletionsService_1;
import { TimeoutTimer } from "../../../base/common/async.js";
import { BugIndicatingError } from "../../../base/common/errors.js";
import { Emitter } from "../../../base/common/event.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import { localize, localize2 } from "../../../nls.js";
import { Action2 } from "../../../platform/actions/common/actions.js";
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "../../../platform/contextkey/common/contextkey.js";
import { registerSingleton } from "../../../platform/instantiation/common/extensions.js";
import { createDecorator } from "../../../platform/instantiation/common/instantiation.js";
import { IQuickInputService } from "../../../platform/quickinput/common/quickInput.js";
import { IStorageService } from "../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../platform/telemetry/common/telemetry.js";
const IInlineCompletionsService = createDecorator("IInlineCompletionsService");
const InlineCompletionsSnoozing = new RawContextKey("inlineCompletions.snoozed", false, localize("inlineCompletions.snoozed", "Whether inline completions are currently snoozed"));
let InlineCompletionsService = class InlineCompletionsService2 extends Disposable {
  static {
    __name(this, "InlineCompletionsService");
  }
  static {
    InlineCompletionsService_1 = this;
  }
  static {
    this.SNOOZE_DURATION = 3e5;
  }
  // 5 minutes
  get snoozeTimeLeft() {
    if (this._snoozeTimeEnd === void 0) {
      return 0;
    }
    return Math.max(0, this._snoozeTimeEnd - Date.now());
  }
  constructor(_contextKeyService, _telemetryService) {
    super();
    this._contextKeyService = _contextKeyService;
    this._telemetryService = _telemetryService;
    this._onDidChangeIsSnoozing = this._register(new Emitter());
    this.onDidChangeIsSnoozing = this._onDidChangeIsSnoozing.event;
    this._snoozeTimeEnd = void 0;
    this._recentCompletionIds = [];
    this._timer = this._register(new TimeoutTimer());
    const inlineCompletionsSnoozing = InlineCompletionsSnoozing.bindTo(this._contextKeyService);
    this._register(this.onDidChangeIsSnoozing(() => inlineCompletionsSnoozing.set(this.isSnoozing())));
  }
  snooze(durationMs = InlineCompletionsService_1.SNOOZE_DURATION) {
    this.setSnoozeDuration(durationMs + this.snoozeTimeLeft);
  }
  setSnoozeDuration(durationMs) {
    if (durationMs < 0) {
      throw new BugIndicatingError(`Invalid snooze duration: ${durationMs}. Duration must be non-negative.`);
    }
    if (durationMs === 0) {
      this.cancelSnooze();
      return;
    }
    const wasSnoozing = this.isSnoozing();
    const timeLeft = this.snoozeTimeLeft;
    this._snoozeTimeEnd = Date.now() + durationMs;
    if (!wasSnoozing) {
      this._onDidChangeIsSnoozing.fire(true);
    }
    this._timer.cancelAndSet(() => {
      if (!this.isSnoozing()) {
        this._onDidChangeIsSnoozing.fire(false);
      } else {
        throw new BugIndicatingError("Snooze timer did not fire as expected");
      }
    }, this.snoozeTimeLeft + 1);
    this._reportSnooze(durationMs - timeLeft, durationMs);
  }
  isSnoozing() {
    return this.snoozeTimeLeft > 0;
  }
  cancelSnooze() {
    if (this.isSnoozing()) {
      this._reportSnooze(-this.snoozeTimeLeft, 0);
      this._snoozeTimeEnd = void 0;
      this._timer.cancel();
      this._onDidChangeIsSnoozing.fire(false);
    }
  }
  reportNewCompletion(requestUuid) {
    this._lastCompletionId = requestUuid;
    this._recentCompletionIds.unshift(requestUuid);
    if (this._recentCompletionIds.length > 5) {
      this._recentCompletionIds.pop();
    }
  }
  _reportSnooze(deltaMs, totalMs) {
    const deltaSeconds = Math.round(deltaMs / 1e3);
    const totalSeconds = Math.round(totalMs / 1e3);
    this._telemetryService.publicLog2("inlineCompletions.snooze", {
      deltaSeconds,
      totalSeconds,
      lastCompletionId: this._lastCompletionId,
      recentCompletionIds: this._recentCompletionIds
    });
  }
};
InlineCompletionsService = InlineCompletionsService_1 = __decorate([
  __param(0, IContextKeyService),
  __param(1, ITelemetryService)
], InlineCompletionsService);
registerSingleton(
  IInlineCompletionsService,
  InlineCompletionsService,
  1
  /* InstantiationType.Delayed */
);
const snoozeInlineSuggestId = "editor.action.inlineSuggest.snooze";
const cancelSnoozeInlineSuggestId = "editor.action.inlineSuggest.cancelSnooze";
const LAST_SNOOZE_DURATION_KEY = "inlineCompletions.lastSnoozeDuration";
class SnoozeInlineCompletion extends Action2 {
  static {
    __name(this, "SnoozeInlineCompletion");
  }
  static {
    this.ID = snoozeInlineSuggestId;
  }
  constructor() {
    super({
      id: SnoozeInlineCompletion.ID,
      title: localize2("action.inlineSuggest.snooze", "Snooze Inline Suggestions"),
      precondition: ContextKeyExpr.true(),
      f1: true
    });
  }
  async run(accessor, ...args) {
    const quickInputService = accessor.get(IQuickInputService);
    const inlineCompletionsService = accessor.get(IInlineCompletionsService);
    const storageService = accessor.get(IStorageService);
    let durationMs;
    if (args.length > 0 && typeof args[0] === "number") {
      durationMs = args[0] * 6e4;
    }
    if (!durationMs) {
      durationMs = await this.getDurationFromUser(quickInputService, storageService);
    }
    if (durationMs) {
      inlineCompletionsService.setSnoozeDuration(durationMs);
    }
  }
  async getDurationFromUser(quickInputService, storageService) {
    const lastSelectedDuration = storageService.getNumber(LAST_SNOOZE_DURATION_KEY, 0, 3e5);
    const items = [
      { label: "1 minute", id: "1", value: 6e4 },
      { label: "5 minutes", id: "5", value: 3e5 },
      { label: "10 minutes", id: "10", value: 6e5 },
      { label: "15 minutes", id: "15", value: 9e5 },
      { label: "30 minutes", id: "30", value: 18e5 },
      { label: "60 minutes", id: "60", value: 36e5 }
    ];
    const picked = await quickInputService.pick(items, {
      placeHolder: localize("snooze.placeholder", "Select snooze duration for Inline Suggestions"),
      activeItem: items.find((item) => item.value === lastSelectedDuration)
    });
    if (picked) {
      storageService.store(
        LAST_SNOOZE_DURATION_KEY,
        picked.value,
        0,
        0
        /* StorageTarget.USER */
      );
      return picked.value;
    }
    return void 0;
  }
}
class CancelSnoozeInlineCompletion extends Action2 {
  static {
    __name(this, "CancelSnoozeInlineCompletion");
  }
  static {
    this.ID = cancelSnoozeInlineSuggestId;
  }
  constructor() {
    super({
      id: CancelSnoozeInlineCompletion.ID,
      title: localize2("action.inlineSuggest.cancelSnooze", "Cancel Snooze Inline Suggestions"),
      precondition: InlineCompletionsSnoozing,
      f1: true
    });
  }
  async run(accessor) {
    accessor.get(IInlineCompletionsService).cancelSnooze();
  }
}
export {
  CancelSnoozeInlineCompletion,
  IInlineCompletionsService,
  InlineCompletionsService,
  SnoozeInlineCompletion
};
//# sourceMappingURL=inlineCompletionsService.js.map
