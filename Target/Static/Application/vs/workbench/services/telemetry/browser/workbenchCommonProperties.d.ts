import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { ICommonProperties } from '../../../../platform/telemetry/common/telemetry.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
export declare function resolveWorkbenchCommonProperties(storageService: IStorageService, productService: IProductService, isInternalTelemetry: boolean, remoteAuthority?: string, resolveAdditionalProperties?: () => {
    [key: string]: unknown;
}): ICommonProperties;
