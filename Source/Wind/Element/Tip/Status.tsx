import type { Concrete } from "@Element/Button";

import Connection from "@Context/Connection/Context";
import Button from "@Element/Button";
import Tip from "@Element/Tip";

import "@Stylesheet/Element/Tippy/Dark.scss";
import "@Stylesheet/Element/Tippy/Light.scss";

import "tippy.js/animations/shift-away.css";
import "tippy.js/dist/tippy.css";

export type Property = {
	Class?: string | (() => string);
	ClassButton?: string | (() => string);
};

export default (Property: Property) => {
	const { Class, ClassButton } = Merge(
		{
			Class: "",
			ClassButton: "",
		} satisfies Property,
		Property,
	) as Concrete<Property>;

	return (
		<Tip
			Class={typeof Class === "function" ? Class() : Class}
			Content="Connecting."
			onMount={async (Tip) =>
				(await import("solid-js")).createEffect(
					(await import("solid-js")).on(
						Connection.Status[0],
						(Status) => Tip._tippy.setContent(Status),
						{
							defer: false,
						},
					),
				)
			}>
			<Button
				Class={() => {
					let Class = `Status ${
						typeof ClassButton === "function"
							? ClassButton()
							: ClassButton
					}`;

					switch (Connection.State()) {
						case 0: {
							Class += " Connecting";
							break;
						}

						case 1: {
							Class += " Connected";
							break;
						}

						case 2: {
							Class += " Disconnecting";
							break;
						}

						case 3: {
							Class += " Disconnected";
							break;
						}

						default: {
							Class += " Disconnected";
							break;
						}
					}

					return Class;
				}}
				Action={() =>
					[0, 1].indexOf(Connection.State()) === -1
						? Connection.Socket[0]()?.reconnect()
						: Connection.Socket[0]()?.close(1000, "Closing socket.")
				}
				Label="Indicates the status of your connection to the WebSocket."
			/>
		</Tip>
	);
};

export const { default: Merge } = await import("@Function/Merge.js");
