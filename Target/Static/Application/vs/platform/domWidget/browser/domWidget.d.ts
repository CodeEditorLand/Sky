import { Disposable, DisposableStore } from '../../../base/common/lifecycle.js';
import { IObservable } from '../../../base/common/observable.js';
import { IInstantiationService, GetLeadingNonServiceArgs } from '../../instantiation/common/instantiation.js';
/**
 * The DomWidget class provides a standard to define reusable UI components.
 * It is disposable and defines a single root element of type HTMLElement.
 * It also provides static helper methods to create and append widgets to the DOM,
 * with support for hot module replacement during development.
*/
export declare abstract class DomWidget extends Disposable {
    /**
     * Appends the widget to the provided DOM element.
    */
    static createAppend<TArgs extends unknown[], T extends DomWidget>(this: DomWidgetCtor<TArgs, T>, dom: HTMLElement, store: DisposableStore, ...params: TArgs): void;
    /**
     * Creates the widget in a new div element with "display: contents".
    */
    static createInContents<TArgs extends unknown[], T extends DomWidget>(this: DomWidgetCtor<TArgs, T>, store: DisposableStore, ...params: TArgs): HTMLDivElement;
    /**
     * Creates an observable instance of the widget.
     * The observable will change when hot module replacement occurs.
    */
    static createObservable<TArgs extends unknown[], T extends DomWidget>(this: DomWidgetCtor<TArgs, T>, store: DisposableStore, ...params: TArgs): IObservable<T>;
    /**
     * Appends the widget to the provided DOM element.
    */
    static instantiateAppend<TArgs extends unknown[], T extends DomWidget>(this: DomWidgetCtor<TArgs, T>, instantiationService: IInstantiationService, dom: HTMLElement, store: DisposableStore, ...params: GetLeadingNonServiceArgs<TArgs>): void;
    /**
     * Creates the widget in a new div element with "display: contents".
     * If possible, prefer `instantiateAppend`, as it avoids an extra div in the DOM.
    */
    static instantiateInContents<TArgs extends unknown[], T extends DomWidget>(this: DomWidgetCtor<TArgs, T>, instantiationService: IInstantiationService, store: DisposableStore, ...params: GetLeadingNonServiceArgs<TArgs>): HTMLDivElement;
    /**
     * Creates an observable instance of the widget.
     * The observable will change when hot module replacement occurs.
    */
    static instantiateObservable<TArgs extends unknown[], T extends DomWidget>(this: DomWidgetCtor<TArgs, T>, instantiationService: IInstantiationService, store: DisposableStore, ...params: GetLeadingNonServiceArgs<TArgs>): IObservable<T>;
    /**
     * @deprecated Do not call manually! Only for use by the hot reload system (a vite plugin will inject calls to this method in dev mode).
    */
    static registerWidgetHotReplacement(this: new (...args: any[]) => DomWidget, id: string): void;
    /** Always returns the same element. */
    abstract get element(): HTMLElement;
}
type DomWidgetCtor<TArgs extends unknown[], T extends DomWidget> = {
    new (...args: TArgs): T;
    createObservable(store: DisposableStore, ...params: TArgs): IObservable<T>;
    instantiateObservable(instantiationService: IInstantiationService, store: DisposableStore, ...params: GetLeadingNonServiceArgs<TArgs>): IObservable<T>;
    createAppend(dom: HTMLElement, store: DisposableStore, ...params: TArgs): void;
    instantiateAppend(instantiationService: IInstantiationService, dom: HTMLElement, store: DisposableStore, ...params: GetLeadingNonServiceArgs<TArgs>): void;
};
export {};
