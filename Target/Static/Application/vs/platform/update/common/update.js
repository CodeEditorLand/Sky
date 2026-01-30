var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { upcast } from "../../../base/common/types.js";
import { createDecorator } from "../../instantiation/common/instantiation.js";
var StateType;
(function(StateType2) {
  StateType2["Uninitialized"] = "uninitialized";
  StateType2["Idle"] = "idle";
  StateType2["Disabled"] = "disabled";
  StateType2["CheckingForUpdates"] = "checking for updates";
  StateType2["AvailableForDownload"] = "available for download";
  StateType2["Downloading"] = "downloading";
  StateType2["Downloaded"] = "downloaded";
  StateType2["Updating"] = "updating";
  StateType2["Ready"] = "ready";
})(StateType || (StateType = {}));
var UpdateType;
(function(UpdateType2) {
  UpdateType2[UpdateType2["Setup"] = 0] = "Setup";
  UpdateType2[UpdateType2["Archive"] = 1] = "Archive";
  UpdateType2[UpdateType2["Snap"] = 2] = "Snap";
})(UpdateType || (UpdateType = {}));
var DisablementReason;
(function(DisablementReason2) {
  DisablementReason2[DisablementReason2["NotBuilt"] = 0] = "NotBuilt";
  DisablementReason2[DisablementReason2["DisabledByEnvironment"] = 1] = "DisabledByEnvironment";
  DisablementReason2[DisablementReason2["ManuallyDisabled"] = 2] = "ManuallyDisabled";
  DisablementReason2[DisablementReason2["MissingConfiguration"] = 3] = "MissingConfiguration";
  DisablementReason2[DisablementReason2["InvalidConfiguration"] = 4] = "InvalidConfiguration";
  DisablementReason2[DisablementReason2["RunningAsAdmin"] = 5] = "RunningAsAdmin";
})(DisablementReason || (DisablementReason = {}));
const State = {
  Uninitialized: upcast({
    type: "uninitialized"
    /* StateType.Uninitialized */
  }),
  Disabled: /* @__PURE__ */ __name((reason) => ({ type: "disabled", reason }), "Disabled"),
  Idle: /* @__PURE__ */ __name((updateType, error) => ({ type: "idle", updateType, error }), "Idle"),
  CheckingForUpdates: /* @__PURE__ */ __name((explicit) => ({ type: "checking for updates", explicit }), "CheckingForUpdates"),
  AvailableForDownload: /* @__PURE__ */ __name((update) => ({ type: "available for download", update }), "AvailableForDownload"),
  Downloading: upcast({
    type: "downloading"
    /* StateType.Downloading */
  }),
  Downloaded: /* @__PURE__ */ __name((update) => ({ type: "downloaded", update }), "Downloaded"),
  Updating: /* @__PURE__ */ __name((update) => ({ type: "updating", update }), "Updating"),
  Ready: /* @__PURE__ */ __name((update) => ({ type: "ready", update }), "Ready")
};
const IUpdateService = createDecorator("updateService");
export {
  DisablementReason,
  IUpdateService,
  State,
  StateType,
  UpdateType
};
//# sourceMappingURL=update.js.map
