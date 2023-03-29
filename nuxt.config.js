import { defineNuxtConfig } from "nuxt/config";
import { resolve } from 'path'

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
    // typescript: {
    //     shim: false,
    // },
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
    ],
    modules: [
        '@pinia/nuxt',
        '@nuxtjs/tailwindcss',
        '@pinia-plugin-persistedstate/nuxt',
        [
            '@nuxtjs/i18n',
            {
                strategy: 'prefix_except_default',
                defaultLocale: 'en',
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
                vueI18n: {
                    legacy: false,                
                    messages: {
                        en: {
                            welcomeMessage: 'Select your mother tongue',
                            selectTask: 'Select a task',
                            tenses: "Tenses",
                            words: "Words",
                        },
                        ru: {
                            welcomeMessage: 'Выберите Ваш родной язык',
                            selectTask: 'Выберите задание',
                            tenses: "Времена",
                            words: "Слова",
                        },
                        zh: {
                            welcomeMessage: '选择您的母语',
                            selectTask: '选择任务',
                            tenses: "时态",
                            words: "字",
                        }
                    }
                },
                detectBrowserLanguage: {
                    useCookie: true,
                    cookieKey: 'i18n_redirected',
                    redirectOn: 'root',
                }
            }
        ]
    ],
    alias: {
        'helper': resolve(__dirname, './helper')
    }
});
