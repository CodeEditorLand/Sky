import type { JSX } from "solid-js";

import Connection from "@Context/Connection/Context";
import Session, { _Function } from "@Context/Session/Context";
import Store from "@Context/Store/Context";

import { createEffect, on } from "solid-js";

export default ({ children }: { children?: JSX.Element }) => {
	createEffect(
		on(
			Connection.Messages[0],
			(Messages) =>
				Messages?.get("Data")?.get("Session") &&
				Session.Data[1](Messages?.get("Data")?.get("Session")),
		),
	);

	Connection.Socket[0]()?.send(
		JSON.stringify({
			Key: Store.Items[0]()?.get("Key")?.[0](),
			Identifier: Store.Items[0]()?.get("Identifier")?.[0](),
			From: "Data",
			View: "User",
		}),
	);

	return (
		<_Function.Provider value={_Function.defaultValue}>
			{children}
		</_Function.Provider>
	);
};
