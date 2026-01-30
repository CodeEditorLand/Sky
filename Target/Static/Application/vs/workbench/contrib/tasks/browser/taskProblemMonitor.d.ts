import { Disposable } from '../../../../base/common/lifecycle.js';
import { AbstractProblemCollector } from '../common/problemCollectors.js';
import { ITerminalInstance } from '../../terminal/browser/terminal.js';
import { URI } from '../../../../base/common/uri.js';
import { IMarkerData } from '../../../../platform/markers/common/markers.js';
export declare class TaskProblemMonitor extends Disposable {
    private readonly terminalMarkerMap;
    private readonly terminalDisposables;
    constructor();
    addTerminal(terminal: ITerminalInstance, problemMatcher: AbstractProblemCollector): void;
    /**
     * Gets the task problems for a specific terminal instance
     * @param instanceId The terminal instance ID
     * @returns Map of problem matchers to their resources and marker data, or undefined if no problems found
     */
    getTaskProblems(instanceId: number): Map<string, {
        resources: URI[];
        markers: IMarkerData[];
    }> | undefined;
}
