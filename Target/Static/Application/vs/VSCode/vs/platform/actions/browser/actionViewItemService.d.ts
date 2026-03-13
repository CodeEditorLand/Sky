import { IActionViewItem } from '../../../base/browser/ui/actionbar/actionbar.js';
import { IActionViewItemOptions } from '../../../base/browser/ui/actionbar/actionViewItems.js';
import { IAction } from '../../../base/common/actions.js';
import { Event } from '../../../base/common/event.js';
import { IDisposable } from '../../../base/common/lifecycle.js';
import { IInstantiationService } from '../../instantiation/common/instantiation.js';
import { MenuId } from '../common/actions.js';
export declare const IActionViewItemService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IActionViewItemService>;
export interface IActionViewItemFactory {
    (action: IAction, options: IActionViewItemOptions, instantiationService: IInstantiationService, windowId: number): IActionViewItem | undefined;
}
export interface IActionViewItemService {
    _serviceBrand: undefined;
    readonly onDidChange: Event<MenuId>;
    register(menu: MenuId, submenu: MenuId, provider: IActionViewItemFactory, event?: Event<unknown>): IDisposable;
    register(menu: MenuId, commandId: string, provider: IActionViewItemFactory, event?: Event<unknown>): IDisposable;
    lookUp(menu: MenuId, submenu: MenuId): IActionViewItemFactory | undefined;
    lookUp(menu: MenuId, commandId: string): IActionViewItemFactory | undefined;
}
export declare class NullActionViewItemService implements IActionViewItemService {
    _serviceBrand: undefined;
    readonly onDidChange: Event<MenuId>;
    register(menu: MenuId, commandId: string | MenuId, provider: IActionViewItemFactory, event?: Event<unknown>): IDisposable;
    lookUp(menu: MenuId, commandId: string | MenuId): IActionViewItemFactory | undefined;
}
