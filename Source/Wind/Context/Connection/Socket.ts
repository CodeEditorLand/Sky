import type { Signal } from "solid-js";

import Environment from "@Context/Environment/Context";

import {
	createReconnectingWS,
	makeHeartbeatWS,
} from "@solid-primitives/websocket";
import { createSignal } from "solid-js";

export type Type = Signal<ReturnType<typeof makeHeartbeatWS>>;

export default createSignal(
	makeHeartbeatWS(
		createReconnectingWS(Environment.Data[0]().Socket, undefined, {
			delay: 0,
			retries: 5,
		}),
		{
			interval: 50000,
			message: "beat",
		},
	),
);
