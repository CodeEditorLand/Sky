import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { ICommonProperties } from '../../../../platform/telemetry/common/telemetry.js';
import { INodeProcess } from '../../../../base/common/platform.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
export declare function resolveWorkbenchCommonProperties(storageService: IStorageService, productService: IProductService, release: string, hostname: string, machineId: string, sqmId: string, devDeviceId: string, isInternalTelemetry: boolean, process: INodeProcess, remoteAuthority?: string): ICommonProperties;
