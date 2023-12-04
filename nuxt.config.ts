import { resolve } from 'path'
import type { NuxtConfig } from '@nuxt/types'

console.log('apiUrl:', process.env.API_URL,);
console.log('apiUrlAuth:', process.env.API_URL_AUTH,);
console.log('apiKey:', process.env.API_KEY,);
console.log('envName:', process.env.ENV_NAME,);

const config: NuxtConfig = {
    // typescript: {
    //     // shim: false,
    //     // typeCheck: true,
    //     // strict: true
    // },
    runtimeConfig: {
        apiKey: process.env.API_KEY,
        apiUrl: process.env.API_URL,
        envName: process.env.ENV_NAME,
        public: {
            apiKey: process.env.API_KEY,
            apiUrl: process.env.API_URL,
            apiUrlAuth: process.env.API_URL_AUTH,
            envName: process.env.ENV_NAME,
        }
    },
    app: {
        head: {
            htmlAttrs: {
                lang: 'en'
            },
            title: 'Language App',
            meta: [
                { name: 'viewport', content: 'width=device-width, initial-scale=1' },
                { hid: 'description', name: 'description', content: '' },
                { name: 'format-detection', content: 'telephone=no' }
            ],
            link: [
                { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
            ]
        },
    },
    css: ["@/assets/styles/main.scss"],
    build: {
        postcss: {
            postcssOptions: {
                plugins: {
                    tailwindcss: {},
                    autoprefixer: {},
                },
            },
        },
    },
    buildModules: [
        '@nuxt/postcss8',
        '@nuxt/typescript-build',
    ],
    modules: [
        '@pinia/nuxt',
        '@nuxtjs/tailwindcss',
        '@pinia-plugin-persistedstate/nuxt',
        [
            '@nuxtjs/i18n',
            {
                strategy: 'no_prefix',
                defaultLocale: 'en',
                fallbackLocale: "en",
                locales: [
                    {
                        code: 'en',
                        iso: 'en-US',
                        name: 'English'
                    },
                    {
                        code: 'ru',
                        iso: 'ru-RU',
                        name: 'Русский'
                    },
                    {
                        code: 'zh',
                        iso: 'zh-CN',
                        name: '简体中文'
                    }
                ],
                detectBrowserLanguage: {
                    useCookie: true,
                    cookieKey: 'i18n_redirected',
                    redirectOn: 'root',
                }
            }
        ],
        ['@nuxtjs/google-fonts', {
            families: {
                Roboto: {
                    wght: [300, 400, 700],
                    ital: [300, 400, 700]
                },
                'Roboto+Condensed': {
                    wght: [300, 400, 700],
                    ital: [300, 400, 700]
                }
            },
            display: 'swap',
        }]
    ],
    alias: {
        'helper': resolve(__dirname, './helper'),
        'store': resolve(__dirname, './store'),
        'types': resolve(__dirname, './types'),
        'components': resolve(__dirname, './components')
    }
};

export default config;
