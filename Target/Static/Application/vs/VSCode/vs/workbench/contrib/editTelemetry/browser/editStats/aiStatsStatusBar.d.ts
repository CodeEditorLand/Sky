import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IObservable } from '../../../../../base/common/observable.js';
import { ICommandService } from '../../../../../platform/commands/common/commands.js';
import { ITelemetryService } from '../../../../../platform/telemetry/common/telemetry.js';
import { IStatusbarService } from '../../../../services/statusbar/browser/statusbar.js';
import type { AiStatsFeature } from './aiStatsFeature.js';
import { ISessionData } from './aiStatsChart.js';
import './media.css';
export declare class AiStatsStatusBar extends Disposable {
    private readonly _aiStatsFeature;
    private readonly _statusbarService;
    private readonly _commandService;
    private readonly _telemetryService;
    static readonly hot: IObservable<typeof AiStatsStatusBar>;
    constructor(_aiStatsFeature: AiStatsFeature, _statusbarService: IStatusbarService, _commandService: ICommandService, _telemetryService: ITelemetryService);
    private _sendHoverTelemetry;
    private _createStatusBar;
}
export interface IAiStatsHoverData {
    readonly aiRate: IObservable<number>;
    readonly acceptedInlineSuggestionsToday: IObservable<number>;
    readonly sessions: IObservable<readonly ISessionData[]>;
}
export interface IAiStatsHoverOptions {
    readonly data: IAiStatsHoverData;
    readonly onOpenSettings?: () => void;
}
export declare function createAiStatsHover(options: IAiStatsHoverOptions): import("../../../../../base/browser/dom.js").ObserverNode<HTMLDivElement>;
