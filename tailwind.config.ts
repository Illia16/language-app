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
                "main": '#FFA500',
                "mainGreen": '#219f7a',
                "button-bg": '#f5deb3',
                "white": '#fff',
                "mp-choice": '#f0f8ff',
            }
        },
    },
    plugins: [],
}