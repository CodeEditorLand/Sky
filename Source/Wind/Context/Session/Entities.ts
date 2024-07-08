import type Providers from "@Context/Session/Providers";

export default interface Interface<Provider extends keyof Providers = "Data"> {
	User: Type<Provider>;
}
