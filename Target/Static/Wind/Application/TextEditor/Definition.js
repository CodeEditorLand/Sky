import { Effect } from "../../effect";
import { TextEditorService } from "vs/workbench/services/textfile/common/textEditorService.js";
const Definition = Effect.gen(function* (_) {
  const InstantiationService = yield* _(Instantiation.Tag);
  const FileService = yield* _(File.Tag);
  const ServiceInstance = new TextEditorService(
    InstantiationService,
    FileService,
    {}
    // Stubbed dependency
  );
  return ServiceInstance;
});
var Definition_default = Definition;
export {
  Definition_default as default
};
//# sourceMappingURL=Definition.js.map
