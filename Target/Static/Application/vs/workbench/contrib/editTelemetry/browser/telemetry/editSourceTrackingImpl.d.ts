import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IObservable } from '../../../../../base/common/observable.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { ITelemetryService } from '../../../../../platform/telemetry/common/telemetry.js';
import { IUserAttentionService } from '../../../../services/userAttention/common/userAttentionService.js';
import { AnnotatedDocument, IAnnotatedDocuments } from '../helpers/annotatedDocuments.js';
import { DocumentEditSourceTracker, TrackedEdit } from './editTracker.js';
import { ScmAdapter } from './scmAdapter.js';
import { IRandomService } from '../randomService.js';
type EditTelemetryMode = 'longterm' | '10minFocusWindow' | '20minFocusWindow';
type EditTelemetryTrigger = '10hours' | 'hashChange' | 'branchChange' | 'closed' | 'time';
export declare class EditSourceTrackingImpl extends Disposable {
    private readonly _statsEnabled;
    private readonly _annotatedDocuments;
    private readonly _instantiationService;
    readonly docsState: IObservable<Map<import("../helpers/observableWorkspace.ts").IObservableDocument, TrackedDocumentInfo>>;
    private readonly _states;
    constructor(_statsEnabled: IObservable<boolean>, _annotatedDocuments: IAnnotatedDocuments, _instantiationService: IInstantiationService);
}
declare class TrackedDocumentInfo extends Disposable {
    private readonly _doc;
    private readonly _scm;
    private readonly _statsEnabled;
    private readonly _instantiationService;
    private readonly _telemetryService;
    private readonly _randomService;
    private readonly _userAttentionService;
    readonly longtermTracker: IObservable<DocumentEditSourceTracker<undefined> | undefined>;
    readonly windowedTracker: IObservable<DocumentEditSourceTracker<undefined> | undefined>;
    readonly windowedFocusTracker: IObservable<DocumentEditSourceTracker<undefined> | undefined>;
    private readonly _repo;
    constructor(_doc: AnnotatedDocument, _scm: ScmAdapter, _statsEnabled: IObservable<boolean>, _instantiationService: IInstantiationService, _telemetryService: ITelemetryService, _randomService: IRandomService, _userAttentionService: IUserAttentionService);
    sendTelemetry(mode: EditTelemetryMode, trigger: EditTelemetryTrigger, t: DocumentEditSourceTracker, focusTime: number, actualTime: number): Promise<void>;
    getTelemetryData(ranges: readonly TrackedEdit[]): {
        nesModifiedCount: number;
        inlineCompletionsCopilotModifiedCount: number;
        inlineCompletionsNESModifiedCount: number;
        otherAIModifiedCount: number;
        userModifiedCount: number;
        ideModifiedCount: number;
        unknownModifiedCount: number;
        externalModifiedCount: number;
        totalModifiedCharactersInFinalState: number;
        languageId: string;
        isTrackedByGit: Promise<boolean> | undefined;
    };
}
export {};
