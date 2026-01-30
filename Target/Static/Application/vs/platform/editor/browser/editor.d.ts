import { StandardKeyboardEvent } from '../../../base/browser/keyboardEvent.js';
import { StandardMouseEvent } from '../../../base/browser/mouseEvent.js';
import { IDisposable } from '../../../base/common/lifecycle.js';
import { IEditorOptions } from '../common/editor.js';
export interface IOpenEditorOptions {
    readonly editorOptions: IEditorOptions;
    readonly openToSide: boolean;
}
export declare function registerOpenEditorListeners(element: HTMLElement, onOpenEditor: (options: IOpenEditorOptions) => void): IDisposable;
export declare function toOpenEditorOptions(event: StandardMouseEvent, isDoubleClick?: boolean): IOpenEditorOptions;
export declare function toOpenEditorOptions(event: StandardKeyboardEvent): IOpenEditorOptions | undefined;
export declare function toOpenEditorOptions(event: StandardMouseEvent | StandardKeyboardEvent): IOpenEditorOptions | undefined;
