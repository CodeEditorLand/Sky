import { IComputedEditorOptions } from '../../common/config/editorOptions.js';
import { ILineBreaksComputer, ILineBreaksComputerContext, ILineBreaksComputerFactory } from '../../common/modelLineProjectionData.js';
export declare class DOMLineBreaksComputerFactory implements ILineBreaksComputerFactory {
    private targetWindow;
    static create(targetWindow: Window): DOMLineBreaksComputerFactory;
    constructor(targetWindow: WeakRef<Window>);
    createLineBreaksComputer(context: ILineBreaksComputerContext, options: IComputedEditorOptions, tabSize: number): ILineBreaksComputer;
}
