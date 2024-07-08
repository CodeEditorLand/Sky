import type { WSMessage } from "@solid-primitives/websocket";

export type Type = (Messages: WSMessage[] | WSMessage) => void;
