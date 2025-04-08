import { Event } from "../../../base/common/event.js";
import { ICodeEditor, IDiffEditor } from "../editorBrowser.js";
import { IDecorationRenderOptions } from "../../common/editorCommon.js";
import { IModelDecorationOptions, ITextModel } from "../../common/model.js";
import { ITextResourceEditorInput } from "../../../platform/editor/common/editor.js";
import { createDecorator } from "../../../platform/instantiation/common/instantiation.js";
import { URI } from "../../../base/common/uri.js";
import { IDisposable } from "../../../base/common/lifecycle.js";
const ICodeEditorService = createDecorator("codeEditorService");
export {
  ICodeEditorService
};
//# sourceMappingURL=codeEditorService.js.map
