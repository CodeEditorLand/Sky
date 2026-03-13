import { Disposable } from '../../../../base/common/lifecycle.js';
import { IAnnotatedDocuments } from './helpers/annotatedDocuments.js';
export type AiContributionLevel = 'chatAndAgent' | 'all';
/**
 * Tracks AI-generated edits across open documents using the edit telemetry pipeline.
 */
export declare class AiContributionFeature extends Disposable {
    private readonly _trackers;
    private readonly _documentsByUri;
    constructor(annotatedDocuments: IAnnotatedDocuments);
    dispose(): void;
    private _createTrackerEntry;
    private _hasAiContributions;
    private _clearAiContributions;
}
