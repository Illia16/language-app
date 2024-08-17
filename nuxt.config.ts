import { resolve } from 'path'
import type { NuxtConfig } from '@nuxt/types'

console.log('API_URL_DATA:', process.env.API_URL_DATA,);
console.log('API_URL_USERS:', process.env.API_URL_USERS,);
console.log('ENV_NAME:', process.env.ENV_NAME,);

const config: NuxtConfig = {
    // typescript: {
    //     // shim: false,
    //     // typeCheck: true,
    //     // strict: true
    // },
    runtimeConfig: {
        API_URL_DATA: process.env.API_URL_DATA,
        ENV_NAME: process.env.ENV_NAME,
        public: {
            API_URL_DATA: process.env.API_URL_DATA,
            API_URL_USERS: process.env.API_URL_USERS,
            ENV_NAME: process.env.ENV_NAME,
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
