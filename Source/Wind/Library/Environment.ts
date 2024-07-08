/**
 * @module Environment
 *
 */
export const { default: StringURL } = await import("../Variable/StringURL.js");

export const _Function = z.object({
	API: StringURL,
	Socket: StringURL,
});

export type Type = z.infer<Exclude<typeof _Function, boolean>>;

import { z } from "zod";
