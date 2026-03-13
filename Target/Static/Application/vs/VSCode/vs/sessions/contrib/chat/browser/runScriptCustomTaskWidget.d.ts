import './media/runScriptAction.css';
import { Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { TaskStorageTarget } from './sessionsConfigurationService.js';
export declare const WORKTREE_CREATED_RUN_ON: "worktreeCreated";
export interface IRunScriptCustomTaskWidgetState {
    readonly label?: string;
    readonly labelDisabledReason?: string;
    readonly command?: string;
    readonly commandDisabledReason?: string;
    readonly target?: TaskStorageTarget;
    readonly targetDisabledReason?: string;
    readonly runOn?: typeof WORKTREE_CREATED_RUN_ON;
}
export interface IRunScriptCustomTaskWidgetResult {
    readonly label?: string;
    readonly command: string;
    readonly target: TaskStorageTarget;
    readonly runOn?: typeof WORKTREE_CREATED_RUN_ON;
}
export declare class RunScriptCustomTaskWidget extends Disposable {
    readonly domNode: HTMLElement;
    private readonly _labelInput;
    private readonly _commandInput;
    private readonly _runOnCheckbox;
    private readonly _storageOptions;
    private readonly _submitButton;
    private readonly _cancelButton;
    private readonly _labelLocked;
    private readonly _commandLocked;
    private readonly _targetLocked;
    private _selectedTarget;
    private readonly _onDidSubmit;
    readonly onDidSubmit: Event<IRunScriptCustomTaskWidgetResult>;
    private readonly _onDidCancel;
    readonly onDidCancel: Event<void>;
    constructor(state: IRunScriptCustomTaskWidgetState);
    focus(): void;
    private _submit;
    private _updateButtonEnablement;
}
