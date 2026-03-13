import { EditorInput } from '../../../common/editor/editorInput.js';
import { IUntypedEditorInput } from '../../../common/editor.js';
import { URI } from '../../../../base/common/uri.js';
import { IImageCarouselCollection } from './imageCarouselTypes.js';
export declare class ImageCarouselEditorInput extends EditorInput {
    readonly collection: IImageCarouselCollection;
    readonly startIndex: number;
    static readonly ID = "workbench.input.imageCarousel";
    private _resource;
    constructor(collection: IImageCarouselCollection, startIndex?: number);
    get typeId(): string;
    get resource(): URI;
    getName(): string;
    matches(other: EditorInput | IUntypedEditorInput): boolean;
}
