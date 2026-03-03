import { URI } from '../../../../../../base/common/uri.js';
import { ExtensionIdentifier } from '../../../../../../platform/extensions/common/extensions.js';
import { IProductService } from '../../../../../../platform/product/common/productService.js';
/**
 * Checks if a prompt file is organization-provided.
 * Organization-provided prompt files come from the built-in chat extension
 * and are located under a `/github/` path.
 *
 * @param uri The URI of the prompt file
 * @param extensionId The extension identifier that provides the prompt file
 * @param productService The product service to get the built-in chat extension ID
 * @returns `true` if the prompt file is organization-provided, `false` otherwise
 */
export declare function isOrganizationPromptFile(uri: URI, extensionId: ExtensionIdentifier, productService: IProductService): boolean;
