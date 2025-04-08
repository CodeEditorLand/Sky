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
import { CachedFunction } from "../../../base/common/cache.js";
import { getStructuralKey } from "../../../base/common/equals.js";
import { Event, IValueWithChangeEvent } from "../../../base/common/event.js";
import { Disposable, IDisposable, toDisposable } from "../../../base/common/lifecycle.js";
import { FileAccess } from "../../../base/common/network.js";
import { derived, observableFromEvent, ValueWithChangeEventFromObservable } from "../../../base/common/observable.js";
import { localize } from "../../../nls.js";
import { IAccessibilityService } from "../../accessibility/common/accessibility.js";
import { IConfigurationService } from "../../configuration/common/configuration.js";
import { createDecorator } from "../../instantiation/common/instantiation.js";
import { observableConfigValue } from "../../observable/common/platformObservableUtils.js";
import { ITelemetryService } from "../../telemetry/common/telemetry.js";
const IAccessibilitySignalService = createDecorator("accessibilitySignalService");
const AcknowledgeDocCommentsToken = Symbol("AcknowledgeDocCommentsToken");
let AccessibilitySignalService = class extends Disposable {
  constructor(configurationService, accessibilityService, telemetryService) {
    super();
    this.configurationService = configurationService;
    this.accessibilityService = accessibilityService;
    this.telemetryService = telemetryService;
  }
  static {
    __name(this, "AccessibilitySignalService");
  }
  _serviceBrand;
  sounds = /* @__PURE__ */ new Map();
  screenReaderAttached = observableFromEvent(
    this,
    this.accessibilityService.onDidChangeScreenReaderOptimized,
    () => (
      /** @description accessibilityService.onDidChangeScreenReaderOptimized */
      this.accessibilityService.isScreenReaderOptimized()
    )
  );
  sentTelemetry = /* @__PURE__ */ new Set();
  getEnabledState(signal, userGesture, modality) {
    return new ValueWithChangeEventFromObservable(this._signalEnabledState.get({ signal, userGesture, modality }));
  }
  async playSignal(signal, options = {}) {
    const shouldPlayAnnouncement = options.modality === "announcement" || options.modality === void 0;
    const announcementMessage = signal.announcementMessage;
    if (shouldPlayAnnouncement && this.isAnnouncementEnabled(signal, options.userGesture) && announcementMessage) {
      this.accessibilityService.status(announcementMessage);
    }
    const shouldPlaySound = options.modality === "sound" || options.modality === void 0;
    if (shouldPlaySound && this.isSoundEnabled(signal, options.userGesture)) {
      this.sendSignalTelemetry(signal, options.source);
      await this.playSound(signal.sound.getSound(), options.allowManyInParallel);
    }
  }
  async playSignals(signals) {
    for (const signal of signals) {
      this.sendSignalTelemetry("signal" in signal ? signal.signal : signal, "source" in signal ? signal.source : void 0);
    }
    const signalArray = signals.map((s) => "signal" in s ? s.signal : s);
    const announcements = signalArray.filter((signal) => this.isAnnouncementEnabled(signal)).map((s) => s.announcementMessage);
    if (announcements.length) {
      this.accessibilityService.status(announcements.join(", "));
    }
    const sounds = new Set(signalArray.filter((signal) => this.isSoundEnabled(signal)).map((signal) => signal.sound.getSound()));
    await Promise.all(Array.from(sounds).map((sound) => this.playSound(sound, true)));
  }
  sendSignalTelemetry(signal, source) {
    const isScreenReaderOptimized = this.accessibilityService.isScreenReaderOptimized();
    const key = signal.name + (source ? `::${source}` : "") + (isScreenReaderOptimized ? "{screenReaderOptimized}" : "");
    if (this.sentTelemetry.has(key) || this.getVolumeInPercent() === 0) {
      return;
    }
    this.sentTelemetry.add(key);
    this.telemetryService.publicLog2("signal.played", {
      signal: signal.name,
      source: source ?? "",
      isScreenReaderOptimized
    });
  }
  getVolumeInPercent() {
    const volume = this.configurationService.getValue("accessibility.signalOptions.volume");
    if (typeof volume !== "number") {
      return 50;
    }
    return Math.max(Math.min(volume, 100), 0);
  }
  playingSounds = /* @__PURE__ */ new Set();
  async playSound(sound, allowManyInParallel = false) {
    if (!allowManyInParallel && this.playingSounds.has(sound)) {
      return;
    }
    this.playingSounds.add(sound);
    const url = FileAccess.asBrowserUri(`vs/platform/accessibilitySignal/browser/media/${sound.fileName}`).toString(true);
    try {
      const sound2 = this.sounds.get(url);
      if (sound2) {
        sound2.volume = this.getVolumeInPercent() / 100;
        sound2.currentTime = 0;
        await sound2.play();
      } else {
        const playedSound = await playAudio(url, this.getVolumeInPercent() / 100);
        this.sounds.set(url, playedSound);
      }
    } catch (e) {
      if (!e.message.includes("play() can only be initiated by a user gesture")) {
        console.error("Error while playing sound", e);
      }
    } finally {
      this.playingSounds.delete(sound);
    }
  }
  playSignalLoop(signal, milliseconds) {
    let playing = true;
    const playSound = /* @__PURE__ */ __name(() => {
      if (playing) {
        this.playSignal(signal, { allowManyInParallel: true }).finally(() => {
          setTimeout(() => {
            if (playing) {
              playSound();
            }
          }, milliseconds);
        });
      }
    }, "playSound");
    playSound();
    return toDisposable(() => playing = false);
  }
  _signalConfigValue = new CachedFunction((signal) => observableConfigValue(signal.settingsKey, { sound: "off", announcement: "off" }, this.configurationService));
  _signalEnabledState = new CachedFunction(
    { getCacheKey: getStructuralKey },
    (arg) => {
      return derived((reader) => {
        const setting = this._signalConfigValue.get(arg.signal).read(reader);
        if (arg.modality === "sound" || arg.modality === void 0) {
          if (checkEnabledState(setting.sound, () => this.screenReaderAttached.read(reader), arg.userGesture)) {
            return true;
          }
        }
        if (arg.modality === "announcement" || arg.modality === void 0) {
          if (checkEnabledState(setting.announcement, () => this.screenReaderAttached.read(reader), arg.userGesture)) {
            return true;
          }
        }
        return false;
      }).recomputeInitiallyAndOnChange(this._store);
    }
  );
  isAnnouncementEnabled(signal, userGesture) {
    if (!signal.announcementMessage) {
      return false;
    }
    return this._signalEnabledState.get({ signal, userGesture: !!userGesture, modality: "announcement" }).get();
  }
  isSoundEnabled(signal, userGesture) {
    return this._signalEnabledState.get({ signal, userGesture: !!userGesture, modality: "sound" }).get();
  }
  onSoundEnabledChanged(signal) {
    return this.getEnabledState(signal, false).onDidChange;
  }
  getDelayMs(signal, modality, mode) {
    if (!this.configurationService.getValue("accessibility.signalOptions.debouncePositionChanges")) {
      return 0;
    }
    let value;
    if (signal.name === AccessibilitySignal.errorAtPosition.name && mode === "positional") {
      value = this.configurationService.getValue("accessibility.signalOptions.experimental.delays.errorAtPosition");
    } else if (signal.name === AccessibilitySignal.warningAtPosition.name && mode === "positional") {
      value = this.configurationService.getValue("accessibility.signalOptions.experimental.delays.warningAtPosition");
    } else {
      value = this.configurationService.getValue("accessibility.signalOptions.experimental.delays.general");
    }
    return modality === "sound" ? value.sound : value.announcement;
  }
};
AccessibilitySignalService = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, IAccessibilityService),
  __decorateParam(2, ITelemetryService)
], AccessibilitySignalService);
function checkEnabledState(state, getScreenReaderAttached, isTriggeredByUserGesture) {
  return state === "on" || state === "always" || state === "auto" && getScreenReaderAttached() || state === "userGesture" && isTriggeredByUserGesture;
}
__name(checkEnabledState, "checkEnabledState");
function playAudio(url, volume) {
  return new Promise((resolve, reject) => {
    const audio = new Audio(url);
    audio.volume = volume;
    audio.addEventListener("ended", () => {
      resolve(audio);
    });
    audio.addEventListener("error", (e) => {
      reject(e.error);
    });
    audio.play().catch((e) => {
      reject(e);
    });
  });
}
__name(playAudio, "playAudio");
class Sound {
  constructor(fileName) {
    this.fileName = fileName;
  }
  static {
    __name(this, "Sound");
  }
  static register(options) {
    const sound = new Sound(options.fileName);
    return sound;
  }
  static error = Sound.register({ fileName: "error.mp3" });
  static warning = Sound.register({ fileName: "warning.mp3" });
  static success = Sound.register({ fileName: "success.mp3" });
  static foldedArea = Sound.register({ fileName: "foldedAreas.mp3" });
  static break = Sound.register({ fileName: "break.mp3" });
  static quickFixes = Sound.register({ fileName: "quickFixes.mp3" });
  static taskCompleted = Sound.register({ fileName: "taskCompleted.mp3" });
  static taskFailed = Sound.register({ fileName: "taskFailed.mp3" });
  static terminalBell = Sound.register({ fileName: "terminalBell.mp3" });
  static diffLineInserted = Sound.register({ fileName: "diffLineInserted.mp3" });
  static diffLineDeleted = Sound.register({ fileName: "diffLineDeleted.mp3" });
  static diffLineModified = Sound.register({ fileName: "diffLineModified.mp3" });
  static requestSent = Sound.register({ fileName: "requestSent.mp3" });
  static responseReceived1 = Sound.register({ fileName: "responseReceived1.mp3" });
  static responseReceived2 = Sound.register({ fileName: "responseReceived2.mp3" });
  static responseReceived3 = Sound.register({ fileName: "responseReceived3.mp3" });
  static responseReceived4 = Sound.register({ fileName: "responseReceived4.mp3" });
  static clear = Sound.register({ fileName: "clear.mp3" });
  static save = Sound.register({ fileName: "save.mp3" });
  static format = Sound.register({ fileName: "format.mp3" });
  static voiceRecordingStarted = Sound.register({ fileName: "voiceRecordingStarted.mp3" });
  static voiceRecordingStopped = Sound.register({ fileName: "voiceRecordingStopped.mp3" });
  static progress = Sound.register({ fileName: "progress.mp3" });
  static chatEditModifiedFile = Sound.register({ fileName: "chatEditModifiedFile.mp3" });
  static editsKept = Sound.register({ fileName: "editsKept.mp3" });
  static editsUndone = Sound.register({ fileName: "editsUndone.mp3" });
}
class SoundSource {
  constructor(randomOneOf) {
    this.randomOneOf = randomOneOf;
  }
  static {
    __name(this, "SoundSource");
  }
  getSound(deterministic = false) {
    if (deterministic || this.randomOneOf.length === 1) {
      return this.randomOneOf[0];
    } else {
      const index = Math.floor(Math.random() * this.randomOneOf.length);
      return this.randomOneOf[index];
    }
  }
}
class AccessibilitySignal {
  constructor(sound, name, legacySoundSettingsKey, settingsKey, legacyAnnouncementSettingsKey, announcementMessage) {
    this.sound = sound;
    this.name = name;
    this.legacySoundSettingsKey = legacySoundSettingsKey;
    this.settingsKey = settingsKey;
    this.legacyAnnouncementSettingsKey = legacyAnnouncementSettingsKey;
    this.announcementMessage = announcementMessage;
  }
  static {
    __name(this, "AccessibilitySignal");
  }
  static _signals = /* @__PURE__ */ new Set();
  static register(options) {
    const soundSource = new SoundSource("randomOneOf" in options.sound ? options.sound.randomOneOf : [options.sound]);
    const signal = new AccessibilitySignal(
      soundSource,
      options.name,
      options.legacySoundSettingsKey,
      options.settingsKey,
      options.legacyAnnouncementSettingsKey,
      options.announcementMessage
    );
    AccessibilitySignal._signals.add(signal);
    return signal;
  }
  static get allAccessibilitySignals() {
    return [...this._signals];
  }
  static errorAtPosition = AccessibilitySignal.register({
    name: localize("accessibilitySignals.positionHasError.name", "Error at Position"),
    sound: Sound.error,
    announcementMessage: localize("accessibility.signals.positionHasError", "Error"),
    settingsKey: "accessibility.signals.positionHasError",
    delaySettingsKey: "accessibility.signalOptions.delays.errorAtPosition"
  });
  static warningAtPosition = AccessibilitySignal.register({
    name: localize("accessibilitySignals.positionHasWarning.name", "Warning at Position"),
    sound: Sound.warning,
    announcementMessage: localize("accessibility.signals.positionHasWarning", "Warning"),
    settingsKey: "accessibility.signals.positionHasWarning",
    delaySettingsKey: "accessibility.signalOptions.delays.warningAtPosition"
  });
  static errorOnLine = AccessibilitySignal.register({
    name: localize("accessibilitySignals.lineHasError.name", "Error on Line"),
    sound: Sound.error,
    legacySoundSettingsKey: "audioCues.lineHasError",
    legacyAnnouncementSettingsKey: "accessibility.alert.error",
    announcementMessage: localize("accessibility.signals.lineHasError", "Error on Line"),
    settingsKey: "accessibility.signals.lineHasError"
  });
  static warningOnLine = AccessibilitySignal.register({
    name: localize("accessibilitySignals.lineHasWarning.name", "Warning on Line"),
    sound: Sound.warning,
    legacySoundSettingsKey: "audioCues.lineHasWarning",
    legacyAnnouncementSettingsKey: "accessibility.alert.warning",
    announcementMessage: localize("accessibility.signals.lineHasWarning", "Warning on Line"),
    settingsKey: "accessibility.signals.lineHasWarning"
  });
  static foldedArea = AccessibilitySignal.register({
    name: localize("accessibilitySignals.lineHasFoldedArea.name", "Folded Area on Line"),
    sound: Sound.foldedArea,
    legacySoundSettingsKey: "audioCues.lineHasFoldedArea",
    legacyAnnouncementSettingsKey: "accessibility.alert.foldedArea",
    announcementMessage: localize("accessibility.signals.lineHasFoldedArea", "Folded"),
    settingsKey: "accessibility.signals.lineHasFoldedArea"
  });
  static break = AccessibilitySignal.register({
    name: localize("accessibilitySignals.lineHasBreakpoint.name", "Breakpoint on Line"),
    sound: Sound.break,
    legacySoundSettingsKey: "audioCues.lineHasBreakpoint",
    legacyAnnouncementSettingsKey: "accessibility.alert.breakpoint",
    announcementMessage: localize("accessibility.signals.lineHasBreakpoint", "Breakpoint"),
    settingsKey: "accessibility.signals.lineHasBreakpoint"
  });
  static inlineSuggestion = AccessibilitySignal.register({
    name: localize("accessibilitySignals.lineHasInlineSuggestion.name", "Inline Suggestion on Line"),
    sound: Sound.quickFixes,
    legacySoundSettingsKey: "audioCues.lineHasInlineSuggestion",
    settingsKey: "accessibility.signals.lineHasInlineSuggestion"
  });
  static terminalQuickFix = AccessibilitySignal.register({
    name: localize("accessibilitySignals.terminalQuickFix.name", "Terminal Quick Fix"),
    sound: Sound.quickFixes,
    legacySoundSettingsKey: "audioCues.terminalQuickFix",
    legacyAnnouncementSettingsKey: "accessibility.alert.terminalQuickFix",
    announcementMessage: localize("accessibility.signals.terminalQuickFix", "Quick Fix"),
    settingsKey: "accessibility.signals.terminalQuickFix"
  });
  static onDebugBreak = AccessibilitySignal.register({
    name: localize("accessibilitySignals.onDebugBreak.name", "Debugger Stopped on Breakpoint"),
    sound: Sound.break,
    legacySoundSettingsKey: "audioCues.onDebugBreak",
    legacyAnnouncementSettingsKey: "accessibility.alert.onDebugBreak",
    announcementMessage: localize("accessibility.signals.onDebugBreak", "Breakpoint"),
    settingsKey: "accessibility.signals.onDebugBreak"
  });
  static noInlayHints = AccessibilitySignal.register({
    name: localize("accessibilitySignals.noInlayHints", "No Inlay Hints on Line"),
    sound: Sound.error,
    legacySoundSettingsKey: "audioCues.noInlayHints",
    legacyAnnouncementSettingsKey: "accessibility.alert.noInlayHints",
    announcementMessage: localize("accessibility.signals.noInlayHints", "No Inlay Hints"),
    settingsKey: "accessibility.signals.noInlayHints"
  });
  static taskCompleted = AccessibilitySignal.register({
    name: localize("accessibilitySignals.taskCompleted", "Task Completed"),
    sound: Sound.taskCompleted,
    legacySoundSettingsKey: "audioCues.taskCompleted",
    legacyAnnouncementSettingsKey: "accessibility.alert.taskCompleted",
    announcementMessage: localize("accessibility.signals.taskCompleted", "Task Completed"),
    settingsKey: "accessibility.signals.taskCompleted"
  });
  static taskFailed = AccessibilitySignal.register({
    name: localize("accessibilitySignals.taskFailed", "Task Failed"),
    sound: Sound.taskFailed,
    legacySoundSettingsKey: "audioCues.taskFailed",
    legacyAnnouncementSettingsKey: "accessibility.alert.taskFailed",
    announcementMessage: localize("accessibility.signals.taskFailed", "Task Failed"),
    settingsKey: "accessibility.signals.taskFailed"
  });
  static terminalCommandFailed = AccessibilitySignal.register({
    name: localize("accessibilitySignals.terminalCommandFailed", "Terminal Command Failed"),
    sound: Sound.error,
    legacySoundSettingsKey: "audioCues.terminalCommandFailed",
    legacyAnnouncementSettingsKey: "accessibility.alert.terminalCommandFailed",
    announcementMessage: localize("accessibility.signals.terminalCommandFailed", "Command Failed"),
    settingsKey: "accessibility.signals.terminalCommandFailed"
  });
  static terminalCommandSucceeded = AccessibilitySignal.register({
    name: localize("accessibilitySignals.terminalCommandSucceeded", "Terminal Command Succeeded"),
    sound: Sound.success,
    announcementMessage: localize("accessibility.signals.terminalCommandSucceeded", "Command Succeeded"),
    settingsKey: "accessibility.signals.terminalCommandSucceeded"
  });
  static terminalBell = AccessibilitySignal.register({
    name: localize("accessibilitySignals.terminalBell", "Terminal Bell"),
    sound: Sound.terminalBell,
    legacySoundSettingsKey: "audioCues.terminalBell",
    legacyAnnouncementSettingsKey: "accessibility.alert.terminalBell",
    announcementMessage: localize("accessibility.signals.terminalBell", "Terminal Bell"),
    settingsKey: "accessibility.signals.terminalBell"
  });
  static notebookCellCompleted = AccessibilitySignal.register({
    name: localize("accessibilitySignals.notebookCellCompleted", "Notebook Cell Completed"),
    sound: Sound.taskCompleted,
    legacySoundSettingsKey: "audioCues.notebookCellCompleted",
    legacyAnnouncementSettingsKey: "accessibility.alert.notebookCellCompleted",
    announcementMessage: localize("accessibility.signals.notebookCellCompleted", "Notebook Cell Completed"),
    settingsKey: "accessibility.signals.notebookCellCompleted"
  });
  static notebookCellFailed = AccessibilitySignal.register({
    name: localize("accessibilitySignals.notebookCellFailed", "Notebook Cell Failed"),
    sound: Sound.taskFailed,
    legacySoundSettingsKey: "audioCues.notebookCellFailed",
    legacyAnnouncementSettingsKey: "accessibility.alert.notebookCellFailed",
    announcementMessage: localize("accessibility.signals.notebookCellFailed", "Notebook Cell Failed"),
    settingsKey: "accessibility.signals.notebookCellFailed"
  });
  static diffLineInserted = AccessibilitySignal.register({
    name: localize("accessibilitySignals.diffLineInserted", "Diff Line Inserted"),
    sound: Sound.diffLineInserted,
    legacySoundSettingsKey: "audioCues.diffLineInserted",
    settingsKey: "accessibility.signals.diffLineInserted"
  });
  static diffLineDeleted = AccessibilitySignal.register({
    name: localize("accessibilitySignals.diffLineDeleted", "Diff Line Deleted"),
    sound: Sound.diffLineDeleted,
    legacySoundSettingsKey: "audioCues.diffLineDeleted",
    settingsKey: "accessibility.signals.diffLineDeleted"
  });
  static diffLineModified = AccessibilitySignal.register({
    name: localize("accessibilitySignals.diffLineModified", "Diff Line Modified"),
    sound: Sound.diffLineModified,
    legacySoundSettingsKey: "audioCues.diffLineModified",
    settingsKey: "accessibility.signals.diffLineModified"
  });
  static chatEditModifiedFile = AccessibilitySignal.register({
    name: localize("accessibilitySignals.chatEditModifiedFile", "Chat Edit Modified File"),
    sound: Sound.chatEditModifiedFile,
    announcementMessage: localize("accessibility.signals.chatEditModifiedFile", "File Modified from Chat Edits"),
    settingsKey: "accessibility.signals.chatEditModifiedFile"
  });
  static chatRequestSent = AccessibilitySignal.register({
    name: localize("accessibilitySignals.chatRequestSent", "Chat Request Sent"),
    sound: Sound.requestSent,
    legacySoundSettingsKey: "audioCues.chatRequestSent",
    legacyAnnouncementSettingsKey: "accessibility.alert.chatRequestSent",
    announcementMessage: localize("accessibility.signals.chatRequestSent", "Chat Request Sent"),
    settingsKey: "accessibility.signals.chatRequestSent"
  });
  static chatResponseReceived = AccessibilitySignal.register({
    name: localize("accessibilitySignals.chatResponseReceived", "Chat Response Received"),
    legacySoundSettingsKey: "audioCues.chatResponseReceived",
    sound: {
      randomOneOf: [
        Sound.responseReceived1,
        Sound.responseReceived2,
        Sound.responseReceived3,
        Sound.responseReceived4
      ]
    },
    settingsKey: "accessibility.signals.chatResponseReceived"
  });
  static codeActionTriggered = AccessibilitySignal.register({
    name: localize("accessibilitySignals.codeActionRequestTriggered", "Code Action Request Triggered"),
    sound: Sound.voiceRecordingStarted,
    legacySoundSettingsKey: "audioCues.codeActionRequestTriggered",
    legacyAnnouncementSettingsKey: "accessibility.alert.codeActionRequestTriggered",
    announcementMessage: localize("accessibility.signals.codeActionRequestTriggered", "Code Action Request Triggered"),
    settingsKey: "accessibility.signals.codeActionTriggered"
  });
  static codeActionApplied = AccessibilitySignal.register({
    name: localize("accessibilitySignals.codeActionApplied", "Code Action Applied"),
    legacySoundSettingsKey: "audioCues.codeActionApplied",
    sound: Sound.voiceRecordingStopped,
    settingsKey: "accessibility.signals.codeActionApplied"
  });
  static progress = AccessibilitySignal.register({
    name: localize("accessibilitySignals.progress", "Progress"),
    sound: Sound.progress,
    legacySoundSettingsKey: "audioCues.chatResponsePending",
    legacyAnnouncementSettingsKey: "accessibility.alert.progress",
    announcementMessage: localize("accessibility.signals.progress", "Progress"),
    settingsKey: "accessibility.signals.progress"
  });
  static clear = AccessibilitySignal.register({
    name: localize("accessibilitySignals.clear", "Clear"),
    sound: Sound.clear,
    legacySoundSettingsKey: "audioCues.clear",
    legacyAnnouncementSettingsKey: "accessibility.alert.clear",
    announcementMessage: localize("accessibility.signals.clear", "Clear"),
    settingsKey: "accessibility.signals.clear"
  });
  static save = AccessibilitySignal.register({
    name: localize("accessibilitySignals.save", "Save"),
    sound: Sound.save,
    legacySoundSettingsKey: "audioCues.save",
    legacyAnnouncementSettingsKey: "accessibility.alert.save",
    announcementMessage: localize("accessibility.signals.save", "Save"),
    settingsKey: "accessibility.signals.save"
  });
  static format = AccessibilitySignal.register({
    name: localize("accessibilitySignals.format", "Format"),
    sound: Sound.format,
    legacySoundSettingsKey: "audioCues.format",
    legacyAnnouncementSettingsKey: "accessibility.alert.format",
    announcementMessage: localize("accessibility.signals.format", "Format"),
    settingsKey: "accessibility.signals.format"
  });
  static voiceRecordingStarted = AccessibilitySignal.register({
    name: localize("accessibilitySignals.voiceRecordingStarted", "Voice Recording Started"),
    sound: Sound.voiceRecordingStarted,
    legacySoundSettingsKey: "audioCues.voiceRecordingStarted",
    settingsKey: "accessibility.signals.voiceRecordingStarted"
  });
  static voiceRecordingStopped = AccessibilitySignal.register({
    name: localize("accessibilitySignals.voiceRecordingStopped", "Voice Recording Stopped"),
    sound: Sound.voiceRecordingStopped,
    legacySoundSettingsKey: "audioCues.voiceRecordingStopped",
    settingsKey: "accessibility.signals.voiceRecordingStopped"
  });
  static editsKept = AccessibilitySignal.register({
    name: localize("accessibilitySignals.editsKept", "Edits Kept"),
    sound: Sound.editsKept,
    announcementMessage: localize("accessibility.signals.editsKept", "Edits Kept"),
    settingsKey: "accessibility.signals.editsKept"
  });
  static editsUndone = AccessibilitySignal.register({
    name: localize("accessibilitySignals.editsUndone", "Undo Edits"),
    sound: Sound.editsUndone,
    announcementMessage: localize("accessibility.signals.editsUndone", "Edits Undone"),
    settingsKey: "accessibility.signals.editsUndone"
  });
}
export {
  AccessibilitySignal,
  AccessibilitySignalService,
  AcknowledgeDocCommentsToken,
  IAccessibilitySignalService,
  Sound,
  SoundSource
};
//# sourceMappingURL=accessibilitySignalService.js.map
