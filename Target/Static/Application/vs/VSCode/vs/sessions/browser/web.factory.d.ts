import { IWorkbenchConstructionOptions } from '../../workbench/browser/web.api.js';
import { IDisposable } from '../../base/common/lifecycle.js';
/**
 * Creates the Sessions workbench with the provided options in the provided container.
 */
export declare function create(domElement: HTMLElement, options: IWorkbenchConstructionOptions): IDisposable;
