import { DisposableStore, IDisposable } from '../common/lifecycle.js';
import { IObservable } from '../common/observable.js';
export declare function isGlobalStylesheet(node: Node): boolean;
export declare function createStyleSheet(container?: HTMLElement, beforeAppend?: (style: HTMLStyleElement) => void, disposableStore?: DisposableStore): HTMLStyleElement;
export declare function cloneGlobalStylesheets(targetWindow: Window): IDisposable;
export declare function createCSSRule(selector: string, cssText: string, style?: HTMLStyleElement): void;
export declare function removeCSSRulesContainingSelector(ruleName: string, style?: HTMLStyleElement): void;
export declare function createStyleSheetFromObservable(css: IObservable<string>): IDisposable;
