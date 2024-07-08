import { fontFamily } from "tailwindcss/defaultTheme";

export default {
	content: [
		"./Public/**/*.html",
		"./Source/**/*.{astro,js,jsx,ts,tsx,vue,svelte}",
	],
	darkMode: "media",
	theme: {
		container: {
			center: true,
		},
		extend: {
			transitionTimingFunction: {
				Land: "cubic-bezier(0.25, 0.1, 0.25, 1)",
			},
			fontFamily: {
				sans: ["Albert Sans", ...fontFamily.sans],
			},
			typography: {
				DEFAULT: {
					css: {
						a: {
							"font-weight": "400",
						},
					},
				},
			},
			ringWidth: {
				5: "5px",
			},
			colors: {
				backgroundLight: "var(--background-light)",
				backgroundDark: "var(--background-dark)",
			},
		},
	},
	variants: {},
	plugins: [
		require("@tailwindcss/forms"),
		require("@tailwindcss/typography"),
		require("@tailwindcss/aspect-ratio"),
	],
};
