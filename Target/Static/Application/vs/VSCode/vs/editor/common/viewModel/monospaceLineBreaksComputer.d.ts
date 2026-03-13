import { IComputedEditorOptions } from '../config/editorOptions.js';
import { ILineBreaksComputerFactory, ILineBreaksComputer, ILineBreaksComputerContext } from '../modelLineProjectionData.js';
export declare class MonospaceLineBreaksComputerFactory implements ILineBreaksComputerFactory {
    static create(options: IComputedEditorOptions): MonospaceLineBreaksComputerFactory;
    private readonly classifier;
    constructor(breakBeforeChars: string, breakAfterChars: string);
    createLineBreaksComputer(context: ILineBreaksComputerContext, options: IComputedEditorOptions, tabSize: number): ILineBreaksComputer;
}
