import type { defineConfig } from "astro/config";

// @ts-expect-error
export const Development = import.meta.env.DEV;

export default (await import("astro/config")).defineConfig({
	srcDir: "./Source",
	publicDir: "./Public",
	outDir: "./Target",
	site: "http://localhost",
	compressHTML: !Development,
	prefetch: true,
	server: {
		port: 9999,
	},
	integrations: [
		(await import("@astrojs/solid-js")).default({
			// @ts-ignore
			devtools: Development,
		}),
		// @ts-ignore
		// import.meta.env.MODE === "production"
		// 	? (await import("astrojs-service-worker")).default()
		// 	: null,
		(await import("@astrojs/sitemap")).default(),
		(await import("@playform/inline")).default({ Logger: 1 }),
		(await import("@astrojs/prefetch")).default(),
		(await import("@playform/format")).default({ Logger: 1 }),
		(await import("@playform/compress")).default({ Logger: 1 }),
	],
	experimental: {
		directRenderScript: true,
		clientPrerender: true,
		globalRoutePriority: true,
		serverIslands: true,
	},
	vite: {
		build: {
			sourcemap: Development,
		},
		optimizeDeps: {
			...(Development
				? {
						exclude: [
							"@codeeditorland/common",
							"@codeeditorland/editor",
							"@codeeditorland/wind",
							"@codeeditorland/vanilla",
						],
					}
				: {}),
		},
		resolve: {
			preserveSymlinks: true,
		},
		css: {
			devSourcemap: Development,
			transformer: "postcss",
		},
		plugins: [(await import("vite-plugin-top-level-await")).default()],
	},
}) as typeof defineConfig;
