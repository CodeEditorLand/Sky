var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { BugIndicatingError } from "../errors.js";
import { IObservableWithChange, IReader } from "./base.js";
function recordChanges(obs) {
  return {
    createChangeSummary: /* @__PURE__ */ __name((_previousChangeSummary) => {
      return {
        changes: []
      };
    }, "createChangeSummary"),
    handleChange(ctx, changeSummary) {
      for (const key in obs) {
        if (ctx.didChange(obs[key])) {
          changeSummary.changes.push({ key, change: ctx.change });
        }
      }
      return true;
    },
    beforeUpdate(reader, changeSummary) {
      for (const key in obs) {
        if (key === "changes") {
          throw new BugIndicatingError('property name "changes" is reserved for change tracking');
        }
        changeSummary[key] = obs[key].read(reader);
      }
    }
  };
}
__name(recordChanges, "recordChanges");
export {
  recordChanges
};
//# sourceMappingURL=changeTracker.js.map
