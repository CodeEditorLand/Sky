import { ProcessItem } from '../common/processes.js';
export declare const JS_FILENAME_PATTERN: RegExp;
export declare function listProcesses(rootPid: number): Promise<ProcessItem>;
