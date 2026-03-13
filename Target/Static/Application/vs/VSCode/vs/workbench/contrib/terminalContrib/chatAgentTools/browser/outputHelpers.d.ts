import { ITerminalInstance } from '../../../terminal/browser/terminal.js';
import type { IMarker as IXtermMarker } from '@xterm/xterm';
export declare function getOutput(instance: ITerminalInstance, startMarker?: IXtermMarker): string;
