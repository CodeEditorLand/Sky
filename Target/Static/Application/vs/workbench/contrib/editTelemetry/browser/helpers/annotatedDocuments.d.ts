import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IObservable, IReader } from '../../../../../base/common/observable.js';
import { URI } from '../../../../../base/common/uri.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IEditorGroupsService } from '../../../../services/editor/common/editorGroupsService.js';
import { IDocumentWithAnnotatedEdits, EditSourceData } from './documentWithAnnotatedEdits.js';
import { ObservableWorkspace, IObservableDocument } from './observableWorkspace.js';
export interface IAnnotatedDocuments {
    readonly documents: IObservable<readonly AnnotatedDocument[]>;
}
export declare class AnnotatedDocuments extends Disposable implements IAnnotatedDocuments {
    private readonly _workspace;
    private readonly _instantiationService;
    readonly documents: IObservable<readonly AnnotatedDocument[]>;
    private readonly _states;
    constructor(_workspace: ObservableWorkspace, _instantiationService: IInstantiationService);
}
export declare class UriVisibilityProvider {
    private readonly _editorGroupsService;
    private readonly visibleUris;
    constructor(_editorGroupsService: IEditorGroupsService);
    isVisible(uri: URI, reader: IReader): boolean;
}
export declare class AnnotatedDocument extends Disposable {
    readonly document: IObservableDocument;
    readonly isVisible: IObservable<boolean>;
    private readonly _instantiationService;
    readonly documentWithAnnotations: IDocumentWithAnnotatedEdits<EditSourceData>;
    constructor(document: IObservableDocument, isVisible: IObservable<boolean>, _instantiationService: IInstantiationService);
}
