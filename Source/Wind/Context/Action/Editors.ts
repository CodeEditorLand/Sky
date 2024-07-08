/**
 * @module Action
 *
 */
export default (await import("@Library/Create.js")).default(
	(await import("@Library/Persist")).default([
		(await import("solid-js")).createSignal(new Map([])),
		"Editors",
	]),
) satisfies Type;
