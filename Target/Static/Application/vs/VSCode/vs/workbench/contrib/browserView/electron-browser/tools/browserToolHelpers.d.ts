import { IPlaywrightService } from '../../../../../platform/browserView/common/playwrightService.js';
import { IToolResult } from '../../../chat/common/tools/languageModelToolsService.js';
import type { Page } from 'playwright-core';
/**
 * Shared helper for running a Playwright function against a page and returning its result.
 */
export declare function playwrightInvokeRaw<TArgs extends unknown[], TReturn>(playwrightService: IPlaywrightService, pageId: string, fn: (page: Page, ...args: TArgs) => Promise<TReturn>, ...args: TArgs): Promise<TReturn>;
/**
 * Shared helper for running a Playwright function against a page and returning
 * a tool result. Handles success/error formatting.
 */
export declare function playwrightInvoke<TArgs extends unknown[], TReturn>(playwrightService: IPlaywrightService, pageId: string, fn: (page: Page, ...args: TArgs) => Promise<TReturn>, ...args: TArgs): Promise<IToolResult>;
export declare function errorResult(message: string): IToolResult;
