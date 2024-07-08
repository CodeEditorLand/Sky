import Socket from "@Context/Connection/Socket";

import { createWSState } from "@solid-primitives/websocket";

export type Type = ReturnType<typeof createWSState>;

export default createWSState(Socket[0]()) satisfies Type;
