import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IObservableWithChange, IObservable } from '../../../../../base/common/observable.js';
import { BaseStringEdit } from '../../../../../editor/common/core/edits/stringEdit.js';
import { StringText } from '../../../../../editor/common/core/text/abstractText.js';
import { ITelemetryService } from '../../../../../platform/telemetry/common/telemetry.js';
import type { ScmRepoAdapter } from './scmAdapter.js';
export declare class ArcTelemetryReporter extends Disposable {
    private readonly _timesMs;
    private readonly _documentValueBeforeTrackedEdit;
    private readonly _document;
    private readonly _gitRepo;
    private readonly _trackedEdit;
    private readonly _sendTelemetryEvent;
    private readonly _onBeforeDispose;
    private readonly _telemetryService;
    private readonly _arcTracker;
    private readonly _initialBranchName;
    private readonly _initialLineCounts;
    constructor(_timesMs: number[], _documentValueBeforeTrackedEdit: StringText, _document: {
        value: IObservableWithChange<StringText, {
            edit: BaseStringEdit;
        }>;
    }, _gitRepo: IObservable<ScmRepoAdapter | undefined>, _trackedEdit: BaseStringEdit, _sendTelemetryEvent: (res: ArcTelemetryReporterData) => void, _onBeforeDispose: () => void, _telemetryService: ITelemetryService);
    private _reportAfter;
    private _report;
}
export interface ArcTelemetryReporterData {
    telemetryService: ITelemetryService;
    timeDelayMs: number;
    didBranchChange: boolean;
    arc: number;
    originalCharCount: number;
    currentLineCount: number;
    currentDeletedLineCount: number;
    originalLineCount: number;
    originalDeletedLineCount: number;
}
