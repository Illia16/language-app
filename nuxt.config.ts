import { resolve } from 'path'
import type { NuxtConfig } from '@nuxt/types'

console.log('apiUrl:', process.env.API_URL,);
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
                vueI18n: {
                    messages: {
                        en: {
                            mainMenu: {
                                look: 'Look',
                                other: 'Other',
                                grammar: 'Grammar',
                            },
                            welcomeMessage: 'Select your mother tongue',
                            selectTask: 'Select a task',
                            tenses: "Tenses",
                            irrgegularVerbs: {
                                translation: 'Translation',
                                infinitive: '1st form (Infinitive)',
                                past: '2nd form (Past)',
                                pastParticiple: '3rd form (Participle)',
                            },
                            get: 'Get',
                            add: 'Add',
                            update: 'Update',
                            delete: 'Delete',
                            confirm: 'Confirm',
                            cancel: 'Cancel',
                        },
                        ru: {
                            mainMenu: {
                                look: 'Смотреть',
                                other: 'Другое',
                                grammar: 'Грамматика',
                            },
                            welcomeMessage: 'Выберите Ваш родной язык',
                            selectTask: 'Выберите задание',
                            tenses: "Времена",
                            irrgegularVerbs: {
                                translation: 'Перевод',
                                infinitive: '1 форма (Инфинитив)',
                                past: '2 форма (Прошедшее)',
                                pastParticiple: '3 форма (Причастие)',
                            },
                            get: 'Найти',
                            add: 'Добавить',
                            update: 'Обновить',
                            delete: 'Удалить',
                            confirm: 'Подтвердить',
                            cancel: 'Отменить',
                        },
                        zh: {
                            mainMenu: {
                                look: '看看',
                                other: '其他',
                                grammar: '语法',
                            },
                            welcomeMessage: '选择您的母语',
                            selectTask: '选择任务',
                            tenses: "时态",
                            irrgegularVerbs: {
                                translation: '翻译',
                                infinitive: '1形式 (不定式)',
                                past: '2形式 (过去式)',
                                pastParticiple: '3形式 (分词)',
                            },
                            get: 'TBD',
                            add: 'TBD',
                            update: 'TBD',
                            delete: 'TBD',
                            confirm: 'TBD',
                            cancel: 'TBD',
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
        'types': resolve(__dirname, './types'),
        'components': resolve(__dirname, './components')
    }
};

export default config;
