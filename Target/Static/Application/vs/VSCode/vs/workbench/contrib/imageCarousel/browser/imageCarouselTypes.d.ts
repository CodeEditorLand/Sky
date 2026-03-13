import { URI } from '../../../../base/common/uri.js';
import { VSBuffer } from '../../../../base/common/buffer.js';
export interface ICarouselImage {
    readonly id: string;
    readonly name: string;
    readonly mimeType: string;
    readonly data: VSBuffer;
    readonly uri?: URI;
    readonly source?: string;
}
export interface IImageCarouselCollection {
    readonly id: string;
    readonly title: string;
    readonly images: ReadonlyArray<ICarouselImage>;
}
