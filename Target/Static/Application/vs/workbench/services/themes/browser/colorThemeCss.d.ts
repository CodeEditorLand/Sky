import { IColorTheme, IThemingParticipant } from '../../../../platform/theme/common/themeService.js';
import { IEnvironmentService } from '../../../../platform/environment/common/environment.js';
/**
 * Generates CSS content (variables + theming participant rules) for a color theme.
 * Pure function - no DOM side effects.
 *
 * @param theme The color theme to generate CSS for
 * @param scopeSelector CSS selector to scope the rules (e.g. '.monaco-workbench')
 * @param themingParticipants Functions that contribute additional CSS rules (optional)
 * @param environmentService Passed to theming participants (required if themingParticipants is non-empty)
 */
export declare function generateColorThemeCSS(theme: IColorTheme, scopeSelector: string, themingParticipants?: readonly IThemingParticipant[], environmentService?: IEnvironmentService): CSSValue;
/**
 * A typed wrapper for CSS content
 */
export declare class CSSValue {
    readonly code: string;
    constructor(code: string);
}
