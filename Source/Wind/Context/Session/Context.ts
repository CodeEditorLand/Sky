import type Data from "../../Interface/Data.js";

import type { Context } from "solid-js";

import { createContext, useContext } from "solid-js";

export type Type = Context<{
	Data: Data;
}>;

export const _Function = createContext({
	Data: (await import("@Context/Session/Data")).default,
}) satisfies Type;

export default useContext(_Function);
