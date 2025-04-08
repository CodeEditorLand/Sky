import { localize } from "../../../../nls.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { SyncDescriptor } from "../../../../platform/instantiation/common/descriptors.js";
import { EditorPaneDescriptor, IEditorPaneRegistry } from "../../../browser/editor.js";
import { RuntimeExtensionsEditor } from "./browserRuntimeExtensionsEditor.js";
import { RuntimeExtensionsInput } from "../common/runtimeExtensionsInput.js";
import { EditorExtensions } from "../../../common/editor.js";
Registry.as(EditorExtensions.EditorPane).registerEditorPane(
  EditorPaneDescriptor.create(RuntimeExtensionsEditor, RuntimeExtensionsEditor.ID, localize("runtimeExtension", "Running Extensions")),
  [new SyncDescriptor(RuntimeExtensionsInput)]
);
//# sourceMappingURL=extensions.web.contribution.js.map
