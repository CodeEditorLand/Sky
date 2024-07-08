import type { Type as Data } from "@Context/Environment/Data";

import type { Context } from "solid-js";

import { createContext, useContext } from "solid-js";

export type Type = Context<{
	Data: Data;
}>;

export const _Function = createContext({
	Data: (await import("@Context/Environment/Data")).default,
}) satisfies Type;

export default useContext(_Function);
