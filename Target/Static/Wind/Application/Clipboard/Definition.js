var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect, pipe, Runtime } from "../../effect";
const RunIntegrationEffect = /* @__PURE__ */ __name((effect) => {
  return pipe(
    effect,
    Effect.mapError((cause) => new ApplicationClipboardProblem({ cause })),
    (finalEffect) => Runtime.runPromise(Runtime.defaultRuntime, finalEffect)
  );
}, "RunIntegrationEffect");
class ClipboardServiceImpl {
  static {
    __name(this, "ClipboardServiceImpl");
  }
  _serviceBrand;
  triggerPaste(_targetWindowId) {
    return void 0;
  }
  writeText(Text) {
    return RunIntegrationEffect(WriteText(Text));
  }
  readText() {
    return RunIntegrationEffect(ReadText);
  }
  readFindText() {
    return this.readText();
  }
  writeFindText(Text) {
    return this.writeText(Text);
  }
  writeResources(ResourceList) {
    return RunIntegrationEffect(WriteResourceList(ResourceList));
  }
  readResources() {
    return RunIntegrationEffect(ReadResourceList);
  }
  hasResources() {
    return RunIntegrationEffect(HasResourceList);
  }
  readImage() {
    return RunIntegrationEffect(ReadImage);
  }
}
const Definition = Effect.sync(() => new ClipboardServiceImpl());
var Definition_default = Definition;
export {
  Definition_default as default
};
//# sourceMappingURL=Definition.js.map
