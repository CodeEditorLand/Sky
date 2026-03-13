import { IOSProperties } from '../../native/common/native.js';
import { IProductService } from '../../product/common/productService.js';
export declare function createNativeAboutDialogDetails(productService: IProductService, osProps: IOSProperties): {
    title: string;
    details: string;
    detailsToCopy: string;
};
