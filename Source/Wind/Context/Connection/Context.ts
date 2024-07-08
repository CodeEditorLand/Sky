import type Messages from "@Context/Connection/Messages";
import type Socket from "@Context/Connection/Socket";
import type State from "@Context/Connection/State";
import type States from "@Context/Connection/States";
import type Status from "@Context/Connection/Status";

import type { Context } from "solid-js";

import { createContext, useContext } from "solid-js";

export type Type = Context<{
	Messages: Messages;
	Socket: Socket;
	State: State;
	Status: Status;
	States: States;
}>;

export const _Function = createContext({
	Messages: (await import("@Context/Connection/Messages")).default,
	Socket: (await import("@Context/Connection/Socket")).default,
	State: (await import("@Context/Connection/State")).default,
	Status: (await import("@Context/Connection/Status")).default,
	States: (await import("@Context/Connection/States")).default,
}) satisfies Type;

export default useContext(_Function);
