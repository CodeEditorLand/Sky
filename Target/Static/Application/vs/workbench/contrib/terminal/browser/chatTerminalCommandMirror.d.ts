import { Disposable } from '../../../../base/common/lifecycle.js';
import { Event } from '../../../../base/common/event.js';
import type { ITerminalCommand } from '../../../../platform/terminal/common/capabilities/capabilities.js';
import { ITerminalService } from './terminal.js';
import { XtermTerminal } from './xterm/xtermTerminal.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import type { IChatTerminalToolInvocationData } from '../../chat/common/chatService/chatService.js';
/**
 * Computes the maximum column width of content in a terminal buffer.
 * Iterates through each line and finds the rightmost non-empty cell.
 *
 * @param buffer The buffer to measure
 * @param cols The terminal column count (used to clamp line length)
 * @returns The maximum column width (number of columns used), or 0 if all lines are empty
 */
export declare function computeMaxBufferColumnWidth(buffer: {
    readonly length: number;
    getLine(y: number): {
        readonly length: number;
        getCell(x: number): {
            getChars(): string;
        } | undefined;
    } | undefined;
}, cols: number): number;
export interface IDetachedTerminalCommandMirrorRenderResult {
    lineCount?: number;
    maxColumnWidth?: number;
}
interface IDetachedTerminalCommandMirror {
    attach(container: HTMLElement): Promise<void>;
    renderCommand(): Promise<IDetachedTerminalCommandMirrorRenderResult | undefined>;
    onDidUpdate: Event<IDetachedTerminalCommandMirrorRenderResult>;
    onDidInput: Event<string>;
}
export declare function getCommandOutputSnapshot(xtermTerminal: XtermTerminal, command: ITerminalCommand, log?: (reason: 'fallback' | 'primary', error: unknown) => void): Promise<{
    text: string;
    lineCount: number;
} | undefined>;
/**
 * Mirrors a terminal command's output into a detached terminal instance.
 * Used in the chat terminal tool progress part to show command output.
 */
export declare class DetachedTerminalCommandMirror extends Disposable implements IDetachedTerminalCommandMirror {
    private readonly _xtermTerminal;
    private readonly _command;
    private readonly _terminalService;
    private readonly _contextKeyService;
    private _detachedTerminal;
    private _detachedTerminalPromise;
    private _attachedContainer;
    private readonly _streamingDisposables;
    private readonly _onDidUpdateEmitter;
    readonly onDidUpdate: Event<IDetachedTerminalCommandMirrorRenderResult>;
    private readonly _onDidInputEmitter;
    readonly onDidInput: Event<string>;
    private _lastVT;
    private _lineCount;
    private _maxColumnWidth;
    private _lastUpToDateCursorY;
    private _lowestDirtyCursorY;
    private _flushPromise;
    private _dirtyScheduled;
    private _isStreaming;
    private _sourceRaw;
    constructor(_xtermTerminal: XtermTerminal, _command: ITerminalCommand, _terminalService: ITerminalService, _contextKeyService: IContextKeyService);
    attach(container: HTMLElement): Promise<void>;
    renderCommand(): Promise<IDetachedTerminalCommandMirrorRenderResult | undefined>;
    private _getCommandOutputAsVT;
    private _getRenderedLineCount;
    private _computeMaxColumnWidth;
    private _getOrCreateTerminal;
    private _startStreaming;
    private _stopStreaming;
    private _handleCursorEvent;
    private _scheduleFlush;
    private _flushDirtyRange;
    private _doFlushDirtyRange;
    private _getAbsoluteCursorY;
}
/**
 * Mirrors a terminal output snapshot into a detached terminal instance.
 * Used when the terminal has been disposed of but we still want to show the output.
 */
export declare class DetachedTerminalSnapshotMirror extends Disposable {
    private readonly _getTheme;
    private readonly _terminalService;
    private readonly _contextKeyService;
    private _detachedTerminal;
    private _attachedContainer;
    private _output;
    private _container;
    private _dirty;
    private _lastRenderedLineCount;
    private _lastRenderedMaxColumnWidth;
    constructor(output: IChatTerminalToolInvocationData['terminalCommandOutput'] | undefined, _getTheme: () => IChatTerminalToolInvocationData['terminalTheme'] | undefined, _terminalService: ITerminalService, _contextKeyService: IContextKeyService);
    private _getTerminal;
    setOutput(output: IChatTerminalToolInvocationData['terminalCommandOutput'] | undefined): void;
    attach(container: HTMLElement): Promise<void>;
    render(): Promise<{
        lineCount?: number;
        maxColumnWidth?: number;
    } | undefined>;
    private _computeMaxColumnWidth;
    private _estimateLineCount;
    private _shouldComputeMaxColumnWidth;
    private _applyTheme;
}
export {};
