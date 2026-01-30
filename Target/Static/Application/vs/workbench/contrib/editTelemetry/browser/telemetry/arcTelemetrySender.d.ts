import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IObservable } from '../../../../../base/common/observable.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { EditSourceData, IDocumentWithAnnotatedEdits } from '../helpers/documentWithAnnotatedEdits.js';
import { IAiEditTelemetryService } from './aiEditTelemetry/aiEditTelemetryService.js';
import type { ScmRepoAdapter } from './scmAdapter.js';
import { IRandomService } from '../randomService.js';
export declare class EditTelemetryReportInlineEditArcSender extends Disposable {
    private readonly _instantiationService;
    constructor(docWithAnnotatedEdits: IDocumentWithAnnotatedEdits<EditSourceData>, scmRepoBridge: IObservable<ScmRepoAdapter | undefined>, _instantiationService: IInstantiationService);
}
export declare class CreateSuggestionIdForChatOrInlineChatCaller extends Disposable {
    private readonly _aiEditTelemetryService;
    constructor(docWithAnnotatedEdits: IDocumentWithAnnotatedEdits<EditSourceData>, _aiEditTelemetryService: IAiEditTelemetryService);
}
export declare class EditTelemetryReportEditArcForChatOrInlineChatSender extends Disposable {
    private readonly _instantiationService;
    private readonly _randomService;
    constructor(docWithAnnotatedEdits: IDocumentWithAnnotatedEdits<EditSourceData>, scmRepoBridge: IObservable<ScmRepoAdapter | undefined>, _instantiationService: IInstantiationService, _randomService: IRandomService);
}
