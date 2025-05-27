/*---------------------------------------------------------------------------------------------
 * Wind Package Entry Point (index.ts) - Wind Package
 * --------------------------------------------------------------------------------------------
 * This file can serve as the main entry point for the "Wind" package if it's intended
 * to be imported as a module by the Sky/Astro application.
 *
 * For the current primary goal of providing the `window.vscode` global bridge,
 * `sky-host-bridge.ts` might be directly imported by Sky. However, if "Wind"
 * evolves to include other client-side services or utilities that the Sky application
 * might consume directly, this file would be the place to export them.
 *
 * Last Reviewed/Updated: 2025-05-27
 *--------------------------------------------------------------------------------------------*/

// The primary action is to ensure the host bridge is set up.
// Importing it here will execute the script and attach `window.vscode`.
import "./sky-host-bridge";

// You could export specific parts of the bridge or other utilities from "Wind" if needed.
// For example, if you had other client-side helper functions specific to the Wind layer:
// export { someWindUtilityFunction } from './wind-utils';

console.log(
	"[Wind Package] Main entry point (index.ts) executed. Sky Host Bridge should now be initialized on window.vscode.",
);

// If sky-host-bridge.ts exports its main object, you could re-export it:
// import skyHostApiGlobal from './sky-host-bridge';
// export { skyHostApiGlobal };
