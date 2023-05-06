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
                            welcomeMessage: 'Select your mother tongue',
                            selectRule: 'Grammar rules',
                            selectTask: 'Select a task',
                            tenses: "Tenses",
                            presentSimple: 'Present Simple',
                            presentContinuous: 'Present Continuous',
                            presentPerfect: 'Present Perfect',
                            words: "Words",
                            irregularVerbs: "Irregular verbs",
                            'modal-verbs': "Modal verbs",
                            or: 'or',
                            irregularVerb3: 'irregular verb in 3rd form',
                            examplesBelow: 'See examples  <span class="green-bolded">{v}</span> below',
                            generalWords: {
                                noun: 'Noun',
                                verb: 'verb',
                                restOfTheWords: 'the rest of the words',
                                question: 'Question',
                                negative: 'Negative',
                                sentense: 'Sentense',
                                examples: 'Rules and examples',
                                howToBuild: 'How to build',
                            }
                        },
                        ru: {
                            welcomeMessage: 'Выберите Ваш родной язык',
                            selectRule: 'Грамматика',
                            selectTask: 'Выберите задание',
                            tenses: "Времена",
                            presentSimple: 'Настоящее простое',
                            presentContinuous: 'Настоящее время',
                            presentPerfect: 'Настоящее совершенное',
                            words: "Слова",
                            irregularVerbs: "Неправильные глаголы",
                            'modal-verbs': "Модальные глаголы",
                            irregularVerb3: 'неправильный глагол в 3 форме',
                            examplesBelow: 'Смотрите примеры <span class="green-bolded">{v}</span> ниже',
                            or: 'или',
                            generalWords: {
                                noun: 'Имя существительное',
                                verb: 'глагол',
                                restOfTheWords: 'Остальные слова',
                                question: 'Вопросительное',
                                negative: 'Отрицающее',
                                sentense: 'Предложение',
                                examples: 'Правила и примеры',
                                howToBuild: 'Как построить',
                            },
                        },
                        zh: {
                            welcomeMessage: '选择您的母语',
                            selectRule: '语法规则',
                            selectTask: '选择任务',
                            tenses: "时态",
                            presentSimple: '现在时',
                            presentContinuous: '现在进行时',
                            presentPerfect: '现在完成时',
                            words: "字",
                            irregularVerbs: "不规则动词",
                            'modal-verbs': "情态动词",
                            or: '或',
                            irregularVerb3: '第三形式的不规则动词',
                            generalWords: {
                                noun: 'Имя существительное',
                                verb: 'Глагол',
                                restOfTheWords: 'Остальные слова',
                                question: 'Вопросительное',
                                negative: 'Отрицающее',
                                sentense: 'Предложение',
                                examples: 'Примеры',
                                howToBuild: 'Как построить',
                            },
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
