/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: false,
    content: [
        "./components/**/*.{vue,js}",
        "./layouts/**/*.vue",
        "./pages/**/*.vue",
        "*.{vue,js}",
        "./plugins/**/*.{js,ts}",
    ],
    theme: {
        extend: {},
    },
    plugins: [],
};
