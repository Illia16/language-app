import { resolve } from 'path'
import type { NuxtConfig } from '@nuxt/types'

const config: NuxtConfig = {
    // typescript: {
    //     // shim: false,
    //     // typeCheck: true,
    //     // strict: true
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
        '@nuxt/typescript-build',
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
                        messages: {
                        en: {
                            welcomeMessage: 'Select your mother tongue',
                            selectTask: 'Select a task',
                            tenses: "Tenses",
                            words: "Words",
                            modalVerbs: "Modal verbs",
                        },
                        ru: {
                            welcomeMessage: 'Выберите Ваш родной язык',
                            selectTask: 'Выберите задание',
                            tenses: "Времена",
                            words: "Слова",
                            modalVerbs: "Модальные глаголы",
                            
                        },
                        zh: {
                            welcomeMessage: '选择您的母语',
                            selectTask: '选择任务',
                            tenses: "时态",
                            words: "字",
                            modalVerbs: "情态动词",
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
        'helper': resolve(__dirname, './helper'),
        'store': resolve(__dirname, './store'),
        'types': resolve(__dirname, './types')
    }
};

export default config;