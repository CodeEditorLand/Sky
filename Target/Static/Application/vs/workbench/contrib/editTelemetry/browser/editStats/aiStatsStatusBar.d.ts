import { Disposable } from '../../../../../base/common/lifecycle.js';
import { ICommandService } from '../../../../../platform/commands/common/commands.js';
import { ITelemetryService } from '../../../../../platform/telemetry/common/telemetry.js';
import { IStatusbarService } from '../../../../services/statusbar/browser/statusbar.js';
import type { AiStatsFeature } from './aiStatsFeature.js';
import './media.css';
export declare class AiStatsStatusBar extends Disposable {
    private readonly _aiStatsFeature;
    private readonly _statusbarService;
    private readonly _commandService;
    private readonly _telemetryService;
    static readonly hot: import("../../../../../base/common/observable.js").IObservable<typeof AiStatsStatusBar>;
    private readonly _chartViewMode;
    constructor(_aiStatsFeature: AiStatsFeature, _statusbarService: IStatusbarService, _commandService: ICommandService, _telemetryService: ITelemetryService);
    private _sendHoverTelemetry;
    private _createStatusBar;
    private _createStatusBarHover;
    private _createToggleButton;
}
