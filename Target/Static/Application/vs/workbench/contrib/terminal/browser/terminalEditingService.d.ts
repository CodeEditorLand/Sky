import { IEditableData } from '../../../common/views.js';
import { IViewsService } from '../../../services/views/common/viewsService.js';
import { ITerminalEditingService, ITerminalInstance } from './terminal.js';
export declare class TerminalEditingService implements ITerminalEditingService {
    private readonly _viewsService;
    readonly _serviceBrand: undefined;
    private _editable;
    private _editingTerminal;
    constructor(_viewsService: IViewsService);
    getEditableData(instance: ITerminalInstance): IEditableData | undefined;
    setEditable(instance: ITerminalInstance, data: IEditableData | null): void;
    isEditable(instance: ITerminalInstance | undefined): boolean;
    getEditingTerminal(): ITerminalInstance | undefined;
    setEditingTerminal(instance: ITerminalInstance | undefined): void;
}
