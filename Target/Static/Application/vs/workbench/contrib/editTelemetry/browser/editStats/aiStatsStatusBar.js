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
import { n } from "../../../../../base/browser/dom.js";
import { ActionBar } from "../../../../../base/browser/ui/actionbar/actionbar.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { createHotClass } from "../../../../../base/common/hotReloadHelpers.js";
import { Disposable, DisposableStore } from "../../../../../base/common/lifecycle.js";
import { autorun, derived, observableValue } from "../../../../../base/common/observable.js";
import { ThemeIcon } from "../../../../../base/common/themables.js";
import { localize } from "../../../../../nls.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.js";
import { nativeHoverDelegate } from "../../../../../platform/hover/browser/hover.js";
import { ITelemetryService } from "../../../../../platform/telemetry/common/telemetry.js";
import { IStatusbarService } from "../../../../services/statusbar/browser/statusbar.js";
import { AI_STATS_SETTING_ID } from "../settingIds.js";
import { createAiStatsChart } from "./aiStatsChart.js";
import "./media.css";
let AiStatsStatusBar = class AiStatsStatusBar2 extends Disposable {
  static {
    __name(this, "AiStatsStatusBar");
  }
  static {
    this.hot = createHotClass(this);
  }
  constructor(_aiStatsFeature, _statusbarService, _commandService, _telemetryService) {
    super();
    this._aiStatsFeature = _aiStatsFeature;
    this._statusbarService = _statusbarService;
    this._commandService = _commandService;
    this._telemetryService = _telemetryService;
    this._chartViewMode = observableValue(this, "days");
    this._register(autorun((reader) => {
      const statusBarItem = this._createStatusBar().keepUpdated(reader.store);
      const store = this._register(new DisposableStore());
      reader.store.add(this._statusbarService.addEntry({
        name: localize("inlineSuggestions", "Inline Suggestions"),
        ariaLabel: localize("inlineSuggestionsStatusBar", "Inline suggestions status bar"),
        text: "",
        tooltip: {
          element: /* @__PURE__ */ __name(async (_token) => {
            this._sendHoverTelemetry();
            store.clear();
            const elem = this._createStatusBarHover();
            return elem.keepUpdated(store).element;
          }, "element"),
          markdownNotSupportedFallback: void 0
        },
        content: statusBarItem.element
      }, "aiStatsStatusBar", 1, 100));
    }));
  }
  _sendHoverTelemetry() {
    this._telemetryService.publicLog2("aiStatsStatusBar.hover", {
      aiRate: this._aiStatsFeature.aiRate.get()
    });
  }
  _createStatusBar() {
    return n.div({
      style: {
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginLeft: "3px",
        marginRight: "3px"
      }
    }, [
      n.div({
        class: "ai-stats-status-bar",
        style: {
          display: "flex",
          flexDirection: "column",
          width: 50,
          height: 6,
          borderRadius: 6,
          borderWidth: "1px",
          borderStyle: "solid"
        }
      }, [
        n.div({
          style: {
            flex: 1,
            display: "flex",
            overflow: "hidden",
            borderRadius: 6,
            border: "1px solid transparent"
          }
        }, [
          n.div({
            style: {
              width: this._aiStatsFeature.aiRate.map((v) => `${v * 100}%`),
              backgroundColor: "currentColor"
            }
          })
        ])
      ])
    ]);
  }
  _createStatusBarHover() {
    const aiRatePercent = this._aiStatsFeature.aiRate.map((r) => `${Math.round(r * 100)}%`);
    return n.div({
      class: "ai-stats-status-bar"
    }, [
      n.div({
        class: "header",
        style: {
          minWidth: "280px"
        }
      }, [
        n.div({ style: { flex: 1 } }, [localize("aiStatsStatusBarHeader", "AI Usage Statistics")]),
        n.div({ style: { marginLeft: "auto" } }, actionBar([
          {
            action: {
              id: "aiStats.statusBar.settings",
              label: "",
              enabled: true,
              run: /* @__PURE__ */ __name(() => openSettingsCommand({ ids: [AI_STATS_SETTING_ID] }).run(this._commandService), "run"),
              class: ThemeIcon.asClassName(Codicon.gear),
              tooltip: localize("aiStats.statusBar.configure", "Configure")
            },
            options: { icon: true, label: false, hoverDelegate: nativeHoverDelegate }
          }
        ]))
      ]),
      n.div({ style: { display: "flex" } }, [
        n.div({ style: { flex: 1, paddingRight: "4px" } }, [
          localize("text1", "AI vs Typing Average: {0}", aiRatePercent.get())
        ])
      ]),
      n.div({ style: { flex: 1, paddingRight: "4px" } }, [
        localize("text2", "Accepted inline suggestions today: {0}", this._aiStatsFeature.acceptedInlineSuggestionsToday.get())
      ]),
      // Chart section
      n.div({
        style: {
          marginTop: "8px",
          borderTop: "1px solid var(--vscode-widget-border)",
          paddingTop: "8px"
        }
      }, [
        // Chart header with toggle
        n.div({
          class: "header",
          style: {
            display: "flex",
            alignItems: "center",
            marginBottom: "4px"
          }
        }, [
          n.div({ style: { flex: 1 } }, [
            this._chartViewMode.map((mode) => mode === "days" ? localize("chartHeaderDays", "AI Rate by Day") : localize("chartHeaderSessions", "AI Rate by Session"))
          ]),
          n.div({
            class: "chart-view-toggle",
            style: { marginLeft: "auto", display: "flex", gap: "2px" }
          }, [
            this._createToggleButton("days", localize("viewByDays", "Days"), Codicon.calendar),
            this._createToggleButton("sessions", localize("viewBySessions", "Sessions"), Codicon.listFlat)
          ])
        ]),
        // Chart container
        derived((reader) => {
          const sessions = this._aiStatsFeature.sessions.read(reader);
          const viewMode = this._chartViewMode.read(reader);
          return n.div({
            ref: /* @__PURE__ */ __name((container) => {
              const chart = createAiStatsChart({
                sessions,
                viewMode
              });
              container.appendChild(chart);
            }, "ref")
          });
        })
      ])
    ]);
  }
  _createToggleButton(mode, tooltip, icon) {
    return derived((reader) => {
      const currentMode = this._chartViewMode.read(reader);
      const isActive = currentMode === mode;
      return n.div({
        class: ["chart-toggle-button", isActive ? "active" : ""],
        style: {
          padding: "2px 4px",
          borderRadius: "3px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        },
        onclick: /* @__PURE__ */ __name(() => {
          this._chartViewMode.set(mode, void 0);
        }, "onclick"),
        title: tooltip
      }, [
        n.div({
          class: ThemeIcon.asClassName(icon),
          style: { fontSize: "14px" }
        })
      ]);
    });
  }
};
AiStatsStatusBar = __decorate([
  __param(1, IStatusbarService),
  __param(2, ICommandService),
  __param(3, ITelemetryService)
], AiStatsStatusBar);
function actionBar(actions, options) {
  return derived((_reader) => n.div({
    class: [],
    style: {},
    ref: /* @__PURE__ */ __name((elem) => {
      const actionBar2 = _reader.store.add(new ActionBar(elem, options));
      for (const { action, options: options2 } of actions) {
        actionBar2.push(action, options2);
      }
    }, "ref")
  }));
}
__name(actionBar, "actionBar");
class CommandWithArgs {
  static {
    __name(this, "CommandWithArgs");
  }
  constructor(commandId, args = []) {
    this.commandId = commandId;
    this.args = args;
  }
  run(commandService) {
    commandService.executeCommand(this.commandId, ...this.args);
  }
}
function openSettingsCommand(options = {}) {
  return new CommandWithArgs("workbench.action.openSettings", [{
    query: options.ids ? options.ids.map((id) => `@id:${id}`).join(" ") : void 0
  }]);
}
__name(openSettingsCommand, "openSettingsCommand");
export {
  AiStatsStatusBar
};
//# sourceMappingURL=aiStatsStatusBar.js.map
