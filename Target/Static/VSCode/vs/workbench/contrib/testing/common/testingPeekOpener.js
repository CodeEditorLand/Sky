import { URI } from "../../../../base/common/uri.js";
import { ITextEditorOptions } from "../../../../platform/editor/common/editor.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { TestResultItem } from "./testTypes.js";
import { ITestResult } from "./testResult.js";
import { IEditor } from "../../../../editor/common/editorCommon.js";
import { MutableObservableValue } from "./observableValue.js";
const ITestingPeekOpener = createDecorator("testingPeekOpener");
export {
  ITestingPeekOpener
};
//# sourceMappingURL=testingPeekOpener.js.map
