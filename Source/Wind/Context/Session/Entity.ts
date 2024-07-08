import type Entities from "@Context/Session/Entities";
import type Provider from "@Context/Session/Provider";

export type Type = keyof Entities<Provider>;

export type { Type as default };
