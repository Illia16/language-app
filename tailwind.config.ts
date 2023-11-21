import type { Config } from 'tailwindcss';

export default <Partial<Config>>{
    content: [
        "./components/**/*.{js,vue,ts}",
        "./layouts/**/*.vue",
        "./pages/**/*.vue",
        "./plugins/**/*.{js,ts}",
        "./nuxt.config.{js,ts}",
        "./app.vue",
    ],
    theme: {
        extend: {
            colors: {
                "mainBg": "#ffe6a5",
                "mainGreen": '#219f7a',
                "white": '#fff',
            }
        },
    },
    plugins: [],
}