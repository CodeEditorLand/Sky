import { IThemeService, Themable } from '../../platform/theme/common/themeService.js';
import { IStorageService, IStorageValueChangeEvent, StorageScope, StorageTarget } from '../../platform/storage/common/storage.js';
import { DisposableStore } from '../../base/common/lifecycle.js';
import { Event } from '../../base/common/event.js';
export declare class Component<MementoType extends object = object> extends Themable {
    private readonly id;
    private readonly memento;
    constructor(id: string, themeService: IThemeService, storageService: IStorageService);
    getId(): string;
    protected getMemento(scope: StorageScope, target: StorageTarget): Partial<MementoType>;
    protected reloadMemento(scope: StorageScope): void;
    protected onDidChangeMementoValue(scope: StorageScope, disposables: DisposableStore): Event<IStorageValueChangeEvent>;
    protected saveState(): void;
}
