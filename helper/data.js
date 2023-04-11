export default {
    userName: 'User',
    userId: '1',
    userMotherLanguage: 'ru',
    tenses: [
        {
            value: 'presentSimple',
            name: 'Present Simple (Простое настоящее)',
            nameTransladed: 'Простое настоящее',
            data: [
                {
                    word: 'I cook every day',
                    translation: 'Я готовлю каждый день',
                },
                {
                    word: 'I do not go to work every day',
                    translation: 'Я не хожу на работу каждый день',
                },
                {
                    word: 'I study English every day',
                    translation: 'Я учу английский каждый день',
                },
                {
                    word: 'Do I drive a car every day?',
                    translation: 'Вожу ли я машину каждый день?',
                },
                {
                    word: 'He doesn\'t (does not) like to swim',
                    translation: 'Он не любит плавать',
                }
            ]
        },
        {
            value: 'presentContinous',
            name: 'Present Continuous (Продолженное настоящее)',
            nameTransladed: 'Продолженное настоящее',
            data: [
                {
                    word: 'I am (I\'m) cooking now',
                    translation: 'Я сейчас готовлю',
                },
                {
                    word: 'I am (I\'m) cleaning your room now',
                    translation: 'Я убираю твою комнату сейчас',
                },
                {
                    word: 'I am (I\'m) not watching TV now',
                    translation: 'Я сейчас не смотрю телевизор',
                },
                {
                    word: 'Is she swimming now?',
                    translation: 'Она сейчас плавает?',
                },
                {
                    word: 'They are not cooking dinner now',
                    translation: 'Они не готовят ужин сейчас',
                }
            ]
        },
        {
            value: 'presentPerfect',
            name: 'Present Perfect (Настоящее совершенное)',
            nameTransladed: 'Настоящее совершенное',
            data: [
                {
                    word: 'I\'ve (I have) cooked dinner',
                    translation: 'Я приготовил ужин',
                },
                {
                    word: 'Have you washed dishes?',
                    translation: 'Ты помыл посуду?',
                },
                {
                    word: 'I\'ve (I have) lived in Canada my whole life',
                    translation: 'Я прожил в Канаде всю свою жизнь',
                },
                {
                    word: 'I haven\'t (have not) watched TV today',
                    translation: 'Я не смотрел телевизор сегодня',
                },
                {
                    word: 'They haven\'t (have not) finished cooking',
                    translation: 'Они не закончили готовить',
                }
            ]
        }
    ],
    words: [
        {
            value: 'cooking',
            name: 'Cooking Words (Кулинарные слова)',
            nameTransladed: 'Кулинарные слова',
            data: [
                {
                    word: 'Frying pan',
                    translation: 'Сковорода',
                },
                {
                    word: 'Stove',
                    translation: 'Плита',
                },
                {
                    word: 'Kitchenware',
                    translation: 'Кухонные принадлежности',
                },
                {
                    word: 'Fridge',
                    translation: 'Холодильник',
                },
                {
                    word: 'Cup',
                    translation: 'Чашка',
                },
                {
                    word: 'Bake',
                    translation: 'выпекать',
                },
                {
                    word: 'Add',
                    translation: 'добавлять',
                },
                {
                    word: 'Measure',
                    translation: 'отмерить',
                },
                {
                    word: 'Combine',
                    translation: 'соединить',
                },
                {
                    word: 'Flip',
                    translation: 'переворачивать',
                },
                {
                    word: 'Season',
                    translation: 'приправлять',
                },
                {
                    word: 'fry potatoes',
                    translation: 'жарить картошку',
                },
                {
                    word: 'peel potatoes',
                    translation: 'чистить картошку',
                },
                {
                    word: 'pour water',
                    translation: 'лить воду',
                },
                {
                    word: 'wash dishes',
                    translation: 'мыть посуду',
                },
                {
                    word: 'boil water',
                    translation: 'кипятить воду',
                },
            ]
        },
        {
            value: 'Irregular verbs',
            name: 'Irregular verbs (Неправильные глаголы)',
            nameTransladed: 'Неправильные глаголы',
            data: [
                {
                    word: 'Give me a glass of water please', 
                    translation: 'Дай мне стакан воды пожалуйста',
                },
                {
                    word: 'I gave him a glass of water one hour ago',
                    translation: 'Я дал ему стакан воды час назад',
                },
                {
                    word: 'Did I give him a glass of water yesterday?',
                    translation: 'Дал ли я ему стакан воды вчера?',
                },
                {
                    word: 'I\'ve (have) just given him a glass of water', 
                    translation: 'Я только что дал ему стакан воды',
                },
                {
                    word: 'We all make mistakes',
                    translation: 'Мы все делаем ошибки',
                },
                {
                    word: 'She made a mistake yesterday',
                    translation: 'Она сделала ошибку вчера',
                    wrongAnswersEng: [
                        'She makes a mistake yesterday',
                        'She will make a mistake',
                        'Does she make a mistake every day?',
                    ],
                    wrongAnswersMotherTongue: [
                        'Она сделает ошибку вчера',
                        'Она будет делать ошибку вчера',
                        'Она делает ошибку вчера'
                    ]
                },
                {
                    word: 'I\'ve (have) just made a mistake',
                    translation: 'Я только что сделал ошибку',
                },
                {
                    word: 'I eat bread every day',
                    translation: 'Я ем хлеб каждый день',
                },
                {
                    word: 'Do you eat bread every day?',
                    translation: 'Ты ешь хлеб каждый день?',
                },
                {
                    word: 'I ate potatoes yesterday',
                    translation: 'Я ел картошку вчера',
                },
                {
                    word: 'Did you eat potatoes yesterday?',
                    translation: 'Ты ел картошку вчера?',
                    wrongAnswersEng: [
                        'I eat potatoes',
                        'I eaten potatoes',
                        'Do I eat potatoes yesterday?',
                    ],
                    wrongAnswersMotherTongue: [
                        'Я ем картошку',
                        'Я буду есть картошку',
                    ]
                },
                {
                    word: 'I\'ve (have) just eaten potatoes',
                    translation: 'Я только что съел картошку',
                    wrongAnswersEng: [
                        'I ate potatoes',
                        'I eat potatoes',
                    ],
                    wrongAnswersMotherTongue: [
                        'Я ем картошку',
                        'Я ел картошку вчера',
                    ]
                },
                {
                    word: 'I know the answer',
                    translation: 'Я знаю ответ',
                    wrongAnswersEng: [
                        'I knew the answer',
                        'I knowed the answer',
                        'I\'ve known the answer'
                    ],
                    wrongAnswersMotherTongue: [
                        'Я знал ответ',
                        'Я буду знать ответ',
                    ]
                },
                {
                    word: 'Do you know how to cook it?',
                    translation: 'Ты знаешь как приготовить это?',
                    wrongAnswersEng: [
                        'Does you know how to cook it?',
                        'Did you know how to cook it?',
                        'You know how to cook it'
                    ],
                    wrongAnswersMotherTongue: [
                        'Ты знал как это приготовить?',
                        'Ты будешь знать как это приготовить?',
                    ]
                },
                {
                    word: 'I knew it',
                    translation: 'Я знал это',
                    wrongAnswersEng: [
                        'I know it',
                        'Do I know it?',
                        'Was I know it?',
                    ],
                    wrongAnswersMotherTongue: [
                        'Я знаю это',
                        'Ты знаешь это',
                        'Я буду знать это',
                    ]
                },
                {
                    word: 'I\'ve (have) known you for a long time',
                    translation: 'Я знаю тебя долгое время',
                },
                {
                    word: 'I think I know the answer',
                    translation: 'Я думаю что знаю ответ',
                    wrongAnswersEng: [
                        'I thought I knew the answer',
                        'I think I knew the answer',
                        'Do I think I know the answer?',
                    ],
                    wrongAnswersMotherTongue: [
                        'Я думал что знаю ответ',
                        'Я думаю что знал ответ',
                        'Я буду думать что знаю ответ?',
                    ]
                },
                {
                    word: 'Do you think you know the answer?',
                    translation: 'Ты думаешь что знаешь ответ?',
                    wrongAnswersEng: [
                        'Does you think you know the answer?',
                        'Do you think you knew the answer?',
                        'Do you think you\'ve known the answer?',
                    ],
                    wrongAnswersMotherTongue: [
                        'Ты думал что знаешь ответ?',
                        'Ты не думаешь что знаешь ответ?',
                        'Ты будешь думать что знаешь ответ?',
                    ]
                },
                {
                    word: 'I thought I knew the answer',
                    translation: 'Я думал что знаю ответ',
                    wrongAnswersEng: [
                        'I think I knew the answer',
                        'I\'ve thought I knew the answer',
                        'I thinked I knew the answer',
                    ],
                    wrongAnswersMotherTongue: [
                        'Я думаю что знаю ответ',
                        'Я не думал что знаю ответ',
                        'Я буду думать что знаю ответ',
                    ]
                },
                {
                    word: 'Didn\'t you think about it?',
                    translation: 'Ты не думал об этом?',
                    wrongAnswersEng: [
                        'Don\'t you think about it?',
                        'Didn\'t you thought about it?',
                        'Did you think about it?',
                    ],
                    wrongAnswersMotherTongue: [
                        'Ты не думаешь об этом?',
                        'Ты не будешь думать об этом?',
                        'Ты думал об этом?',
                    ]
                }
            ]
        },
    ],
    modalVerbs: [
        {
            value: 'modalVerbs',
            name: 'Can/Should/May/Might/Have to (Модальные глаголы)',
            nameTransladed: 'Модальные глаголы',
            data: [
                {
                    word: 'I should exercise more often (good idea)',
                    translation: 'Я должен упражняться чаще (хорошая идея)',
                },
                {
                    word: 'I have to exercise every day (obligation)',
                    translation: 'Я должен упражняться каждый день (обязательно)',
                },
                {
                    word: 'We should eat more vegetables and fruits to be healthy',
                    translation: 'Мы должны есть больше овощей и фруктов чтобы быть здоровыми',
                },
                {
                    word: 'I can play the guitar',
                    translation: 'Я могу играть на гитаре',
                },
                {
                    word: 'I might play the guitar later',
                    translation: 'Я может сыграю на гитаре позже',
                },
                {
                    word: 'I can\'t (cannot) help you right now',
                    translation: 'Я не могу тебе помочь сейчас',
                },
                {
                    word: 'I couldn\'t (could not) help you yesterday',
                    translation: 'Я не мог помочь тебе вчера',
                },
                {
                    word: 'I can cook dinner tonight',
                    translation: 'Я могу приготовить ужин сегодня вечером',
                },
                {
                    word: 'Can you cook breakfast tomorrow?',
                    translation: 'Ты можешь приготовить завтрак завтра?',
                },
                {
                    word: 'I may cook dinner tonight',
                    translation: 'Я может приготовлю ужин сегодня вечером',
                },
                {
                    word: 'We may go to the pool tonight',
                    translation: 'Мы может пойдем в бассейн сегодня вечером',
                },
                {
                    word: 'You may enter the room',
                    translation: 'Ты можешь войти в комнату',
                },
                {
                    word: 'I need to make a phone call',
                    translation: 'Мне нужно сделать звонок',
                },
                {
                    word: 'Do I need to make a phone call?',
                    translation: 'Нужно ли мне сделать звонок?',
                },
                {
                    word: 'Don\'t you need to make a phone call?',
                    translation: 'Тебе не нужно сделать звонок?',
                },
                {
                    word: 'I would like to make a phone call',
                    translation: 'Я хотел бы сделать звонок',
                },
                {
                    word: 'Would you like to make a phone call?',
                    translation: 'Ты хотел бы сделать звонок?',
                }
            ]
        },
    ],
}