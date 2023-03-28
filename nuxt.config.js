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
                // customRoutes: 'config',
                strategy: 'prefix_except_default',
                defaultLocale: 'en',
                locales: ['en', 'ru', 'cn'],
                vueI18n: {
                  legacy: false,
                  locale: 'en',
                  messages: {
                    en: {
                      selectTask: 'Select a task',
                      tenses: "Tenses",
                      words: "Words",
                    },
                    ru: {
                      selectTask: 'Выберите задание',
                      tenses: "Времена",
                      words: "Слова",
                    },
                    cn: {
                        selectTask: '选择任务',
                        tenses: "时态",
                        words: "字",
                    }
                  }
                }
            }
        ]
    ],
    alias: {
        'helper': resolve(__dirname, './helper')
    }
});
