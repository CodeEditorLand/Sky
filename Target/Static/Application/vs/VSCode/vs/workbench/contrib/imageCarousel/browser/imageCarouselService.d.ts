import { Disposable } from '../../../../base/common/lifecycle.js';
import { IImageCarouselCollection } from './imageCarouselTypes.js';
import { IChatResponseViewModel } from '../../chat/common/model/chatViewModel.js';
export declare const IImageCarouselService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IImageCarouselService>;
export interface IImageCarouselService {
    readonly _serviceBrand: undefined;
    /**
     * Extract images from a chat response's tool invocations.
     */
    extractImagesFromResponse(response: IChatResponseViewModel): Promise<IImageCarouselCollection | undefined>;
}
export declare class ImageCarouselService extends Disposable implements IImageCarouselService {
    readonly _serviceBrand: undefined;
    extractImagesFromResponse(response: IChatResponseViewModel): Promise<IImageCarouselCollection | undefined>;
    private extractImagesFromToolInvocation;
    private getImageDataFromOutputDetails;
}
