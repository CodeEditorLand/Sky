var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { EditOperation } from "../../../../editor/common/core/editOperation.js";
import { IRange } from "../../../../editor/common/core/range.js";
import { IIdentifiedSingleEditOperation, ITextModel, IValidEditOperation, TrackedRangeStickiness } from "../../../../editor/common/model.js";
import { IEditObserver } from "./inlineChatStrategies.js";
import { IProgress } from "../../../../platform/progress/common/progress.js";
import { IntervalTimer, AsyncIterableSource } from "../../../../base/common/async.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { getNWords } from "../../chat/common/chatWordCounter.js";
async function performAsyncTextEdit(model, edit, progress, obs) {
  const [id] = model.deltaDecorations([], [{
    range: edit.range,
    options: {
      description: "asyncTextEdit",
      stickiness: TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges
    }
  }]);
  let first = true;
  for await (const part of edit.newText) {
    if (model.isDisposed()) {
      break;
    }
    const range = model.getDecorationRange(id);
    if (!range) {
      throw new Error("FAILED to perform async replace edit because the anchor decoration was removed");
    }
    const edit2 = first ? EditOperation.replace(range, part) : EditOperation.insert(range.getEndPosition(), part);
    obs?.start();
    model.pushEditOperations(null, [edit2], (undoEdits) => {
      progress?.report(undoEdits);
      return null;
    });
    obs?.stop();
    first = false;
  }
}
__name(performAsyncTextEdit, "performAsyncTextEdit");
function asProgressiveEdit(interval, edit, wordsPerSec, token) {
  wordsPerSec = Math.max(30, wordsPerSec);
  const stream = new AsyncIterableSource();
  let newText = edit.text ?? "";
  interval.cancelAndSet(() => {
    if (token.isCancellationRequested) {
      return;
    }
    const r = getNWords(newText, 1);
    stream.emitOne(r.value);
    newText = newText.substring(r.value.length);
    if (r.isFullString) {
      interval.cancel();
      stream.resolve();
      d.dispose();
    }
  }, 1e3 / wordsPerSec);
  const d = token.onCancellationRequested(() => {
    interval.cancel();
    stream.resolve();
    d.dispose();
  });
  return {
    range: edit.range,
    newText: stream.asyncIterable
  };
}
__name(asProgressiveEdit, "asProgressiveEdit");
export {
  asProgressiveEdit,
  performAsyncTextEdit
};
//# sourceMappingURL=utils.js.map
