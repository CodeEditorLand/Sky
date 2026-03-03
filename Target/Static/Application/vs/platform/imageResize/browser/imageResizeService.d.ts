import { URI } from '../../../base/common/uri.js';
import { IFileService } from '../../files/common/files.js';
import { ILogService } from '../../log/common/log.js';
import { IImageResizeService } from '../common/imageResizeService.js';
export declare class ImageResizeService implements IImageResizeService {
    readonly _serviceBrand: undefined;
    /**
     * Resizes an image provided as a UInt8Array string. Resizing is based on Open AI's algorithm for tokenzing images.
     * https://platform.openai.com/docs/guides/vision#calculating-costs
     * @param data - The UInt8Array string of the image to resize.
     * @returns A promise that resolves to the UInt8Array string of the resized image.
     */
    resizeImage(data: Uint8Array | string, mimeType?: string): Promise<Uint8Array>;
    convertStringToUInt8Array(data: string): Uint8Array;
    convertUint8ArrayToString(data: Uint8Array): string;
    isValidBase64(str: string): boolean;
    createFileForMedia(fileService: IFileService, imagesFolder: URI, dataTransfer: Uint8Array, mimeType: string): Promise<URI | undefined>;
    cleanupOldImages(fileService: IFileService, logService: ILogService, imagesFolder: URI): Promise<void>;
    getTimestampFromFilename(filename: string): number | undefined;
}
