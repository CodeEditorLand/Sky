import { IEditorPaneService } from '../common/editorPaneService.js';
export declare class EditorPaneService implements IEditorPaneService {
    readonly _serviceBrand: undefined;
    readonly onWillInstantiateEditorPane: import("../../../workbench.web.main.internal.ts").Event<import("../../../common/editor.ts").IWillInstantiateEditorPaneEvent>;
    didInstantiateEditorPane(typeId: string): boolean;
}
