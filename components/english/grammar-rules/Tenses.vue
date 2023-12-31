<template>
    <div v-if="tense in tensesData">
        <h3 class="grammar-rules--title">{{ tensesData[tense].name }} ({{ t(`${tense}.name`)}})</h3>
        <h4>{{ t('howToBuild')}}</h4>
        <ul class="grammar-rules--sublist">
            <li v-for="(item, i) in tensesData[tense].howToBuild" v-html="item" :key="'howToBuild' + '_' + i"></li>
        </ul>
        <p v-html="t('examplesBelow', {v: 'a, b, c'})" class="underline"></p>
        
        <h4>{{t('examples')}}</h4>
        <ul class="grammar-rules--description">
            <li v-for="(item, i) in tensesData[tense].description" v-html="item" :key="'description' + '_' + i"></li>
        </ul>

        <h4>{{t(`${tense}.howToUse`)}}</h4>
        <Table>
            <li v-for="(item, i) in tensesData[tense].howToUse" v-html="item" :key="'howToUse' + '_' + i"></li>
        </Table>
    </div>
    <div v-else>
        <h3 class="grammar-rules--title">{{ tensesDataShort[tense].name }} ({{ t(`${tense}.name`)}})</h3>
        <ul class="grammar-rules--tensesDataShort">
            <li v-for="(item, i) in tensesDataShort[tense].content" v-html="item" :key="'tensesDataShort' + '_' + i"></li>
        </ul>
    </div>
</template>

<script lang="ts" setup>
const { t } = useI18n()

const props = defineProps({
    tense: {
        required: true,
        type: String,
    },
})

interface Tenses {
    [key: string]: {
        name: string;
        howToBuild: string[];
        description: string[];
        howToUse: string[];
    }
}
interface TensesDataShort {
    [key: string]: {
        name: string,
        content: string[];
    }
}

const tensesData: Tenses = {
    presentSimple: {
        name: 'Present Simple',
        howToBuild: [
            `<span>
                <span class="green-underlined">${t('sentense')}:</span>${t('noun')} + 
                <span class="green-bolded">${t('verb')}(+s/+es)</span> + ${t('restOfTheWords')}
            </span>`,
            `<span>
                <span class="green-underlined">${t('negative')}:</span>${t('noun')} + <span class="green-bolded">do/does</span> + not + <span class="green-bolded">${t('verb')}(+s/+es)</span> + ${t('restOfTheWords')}
            </span>`,
            `<span>
                <span class="green-underlined">${t('question')}:</span> <span class="green-bolded">Do/Does</span> + ${t('noun')} + <span class="green-bolded">${t('verb')}(+s/+es)</span> + ${t('restOfTheWords')}?
            </span>`
        ],
        description: [
            `<span>
                ${ t('presentSimple.description1') }
            </span>`,
            `<span>
                ${ t('presentSimple.description2') }
                <ul class="grammar-rules--sublist">
                    <li>Smoking causes cancer.</li>
                    <li>I am a human</li>
                    <li>Flowers need sunlight and water to grow.</li>
                </ul>
            </span>`,
            `<span>
                ${ t('presentSimple.description3') } (Often, every year, from time to time, seldom, rare, usually)
                <ul class="grammar-rules--sublist">
                    <li>I play football every week.</li>
                    <li>I do <span class="green-bolded">not</span> play football every week.</li>
                    <li>Do I play football every week?</li>
                </ul>

                <ul class="grammar-rules--sublist">
                    <li>She go<span class="green-bolded">es</span> to school every day.</li>
                    <li>She do<span class="green-bolded">es not</span> go to school every day.</li>
                    <li>Do<span class="green-bolded">es</span> she go to school every day?</li>
                </ul>

                <ul class="grammar-rules--sublist">
                    <li>He eat<span class="green-bolded">s</span> breakfast every morning.</li>
                    <li>He do<span class="green-bolded">es</span> not eat breakfast every morning.</li>
                    <li>Do<span class="green-bolded">es</span> he eat breakfast every morning?</li>
                </ul>
            </span>`,
            `<span>
                ${ t('presentSimple.description4') }
                <li>The train leave<span class="green-bolded">s</span> at 7 PM.</li>
            </span>`,
            `<span>${ t('presentSimple.description5') }
                (come<span class="green-bolded">s</span>, eat<span class="green-bolded">s</span>, walk<span class="green-bolded">s</span>)
            </span>`,
            `<span>
                ${ t('presentSimple.description6') } (watch<span class="green-bolded">es</span>, wash<span class="green-bolded">es</span>, mix<span class="green-bolded">es</span>)
            </span>`,
            `<span>
                ${ t('presentSimple.description7') } (hurr<span class="green-bolded">ies</span>, stud<span class="green-bolded">ies</span>, repl<span class="green-bolded">ies</span>)
            </span>`,
            `<span>
                ${ t('presentSimple.description8') } (pay<span class="green-bolded">s</span>, enjoy<span class="green-bolded">s</span>)
            </span>`,
            `<span>
                ${ t('presentSimple.description9') } (has, goes, does, is (be)
            </span>`,
        ],
        howToUse: [
            `<ul>
                <li>
                    <span>I</span>
                    <span>you</span>
                    <span>we</span>
                    <span>they</span>
                    <span>he</span>
                    <span>she</span>
                    <span>it</span>
                </li>
                <li>
                    <span>s/es</span>
                </li>
            </ul>`,
        ],
    },
    presentContinuous: {
        name: 'Present Continuous',
        howToBuild: [
            `<span>
                <span class="green-underlined">${t('sentense')}:</span>
                ${t('noun')} +
                <span class="green-bolded">am/is/are</span> +
                <span class="green-bolded">${t('verb')}(+ing)</span> +
                ${t('restOfTheWords')}
            </span>`,
            `<span>
                <span class="green-underlined">${t('negative')}:</span>
                ${t('noun')} +
                <span class="green-bolded">am/is/are</span> + not +
                <span class="green-bolded">${t('verb')}(+ing)</span> +
                ${t('restOfTheWords')}
            </span>`,
            `<span>
                <span class="green-underlined">${t('question')}:</span>${ " " }
                <span class="green-bolded">Is/Are/Am</span> +
                ${t('noun')} +
                ${t('verb')}
                <span class="green-bolded">(+ing)</span> +
                ${t('restOfTheWords')} ?
            </span>`
        ],
        description: [
            `<span>
                ${t('presentContinuous.description1')}
                <ul class="grammar-rules--sublist">
                    <li>I'm play<span class="green-bolded">ing</span> football now.</li>
                    <li>I'm not play<span class="green-bolded">ing</span> football now.</li>
                    <li>Am I play<span class="green-bolded">ing</span> football now?</li>
                </ul>
            </span>`,
            `<span>
                ${t('presentContinuous.description2')}
                <ul class="grammar-rules--sublist">
                    <li>I am (I'm) watch<span class="green-bolded">ing</span> new TV show these days.</li>
                    <li>I am not (I'm not) watch<span class="green-bolded">ing</span> new TV show these days.</li>
                    <li>Am I watch<span class="green-bolded">ing</span> new TV show these days?</li>
                </ul>
            </span>`,
            `<span>
                ${ t('presentContinuous.description3') }
                <ul class="grammar-rules--sublist">
                    <li>I am look<span class="green-bolded">ing</span> after his dog while he is out of town.</li>
                    <li>I am (I'm) not driv<span class="green-bolded">ing</span> much these days. I am (I'm) letting my wife do it so she can practice.</li>
                    <li>Are you driv<span class="green-bolded">ing</span> a lot these days?</li>
                </ul>
            </span>`,
            `<span>
                ${ t('presentContinuous.description4') }
                <ul class="grammar-rules--sublist">
                    <li>They are (they're) build<span class="green-bolded">ing</span> a new condo in my area.</li>
                    <li>I am (I'm) try<span class="green-bolded">ing</span> to get used to the construction noice.</li>
                    <li>Are they build<span class="green-bolded">ing</span> a new condo in my area?</li>
                </ul>
            </span>`,
            `<span>
                ${ t('presentContinuous.description5') }
                <ul class="grammar-rules--sublist">
                    <li>We are (we're) go<span class="green-bolded">ing</span> on vacation next Friday. (already planned)</li>
                    <li>We are (we're) not go<span class="green-bolded">ing</span> to work next week. (already planned)</li>
                    <li>Are we go<span class="green-bolded">ing</span> on vacation next Friday?</li>
                </ul>
            </span>`
        ],
        howToUse: [
            `<ul>
                <li>I</li>
                <li>am</li>
            </ul>`,
            `<ul>
                <li>
                    <span>you</span>
                    <span>we</span>
                    <span>they</span>
                </li>
                <li>
                    <span>are</span>
                </li>
            </ul>`,
            `<ul>
                <li>
                    <span>he</span>
                    <span>she</span>
                    <span>it</span>
                </li>
                <li>
                    <span>is</span>
                </li>
            </ul>`,
        ],
    },
    presentPerfect: {
        name: 'Present Perfect',
        howToBuild: [
            `<span>
                <span class="green-underlined">${ t('sentense') }:</span>
                ${t('noun')} +
                <span class="green-bolded">have/has</span> +
                ${t('verb')}<span class="green-bolded"> (+ed)</span> ${t('or')} <span class="green-bolded">${t('irregularVerb3')}</span> +
                ${t('restOfTheWords')}
            </span>`,
            `<span>
                <span class="green-underlined">${t('negative')}:</span>
                ${t('noun')} +
                <span class="green-bolded">have/has</span> + not +
                ${t('verb')} <span class="green-bolded"> (+ed)</span> ${t('or')} <span class="green-bolded">${t('irregularVerb3')}</span> +
                ${t('restOfTheWords')}
            </span>`,
            `<span>
                <span class="green-underlined">${t('question')}:</span>${ " " }
                <span class="green-bolded">Have/has</span> +
                ${t('noun')} +
                ${t('verb')} <span class="green-bolded"> (+ed)</span> ${t('or')} <span class="green-bolded">${t('irregularVerb3')}</span> +
                ${t('restOfTheWords')} + ?
            </span>`
        ],
        description: [
            `<span>
                ${ t('presentPerfect.description1') }
                <ul class="grammar-rules--sublist">
                    <li>He <span class="green-bolded">has known</span> how to drive a car since the age of 18.</li>
                    <li>She <span class="green-bolded">has never known</span> how to drive a car.</li>
                    <li>Has he <span class="green-bolded">known</span> how to drive a car since 2017(twenty-seventeen)?</li>
                </ul>
            </span>`,
            `<span>
                ${ t('presentPerfect.description2') }
                <ul class="grammar-rules--sublist">
                    <li>I <span class="green-bolded">have watched</span> this movie before.</li>
                    <li>I <span class="green-bolded">have not</span> (haven't) watch<span class="green-bolded">ed</span> this movie before.</li>
                    <li>Have I watch<span class="green-bolded">ed</span> this movie before?</li>
                </ul>
            </span>`,
            `<span>
                ${ t('presentPerfect.description3') }
                <ul class="grammar-rules--sublist">
                    <li>I have (I've) just <span class="green-bolded">eaten</span> my breakfast.</li>
                    <li>She has not (hasn't) <span class="green-bolded">eaten</span> her breakfast yet.</li>
                    <li>Have we <span class="green-bolded">eaten</span> our breakfast yet?</li>
                </ul>
            </span>`,
            `<span>
                ${ t('presentPerfect.description4') }
                <ul class="grammar-rules--sublist">
                    <li>Because of many intense lessons, I have learn<span class="green-bolded">ed</span> English very well.</li>
                    <li>She has not (hasn't) learn<span class="green-bolded">ed</span> English very well yet.</li>
                    <li>Have they learn<span class="green-bolded">ed</span> English already?</li>
                </ul>
            </span>`,
            `<span>
                ${ t('presentPerfect.description5') }
                <ul class="grammar-rules--sublist">
                    <li>I have (I've) just finished my work</li>
                    <li>She has not (hasn't) finished her work yet.</li>
                    <li>I have (I've) never visited Canada.</li>
                    <li>I have (I've) already worked in Canada for 1 year.</li>
                    <li>Have you ever thought of travelling around the world?</li>
                    <li>So far, I have (I've) only been to 10 countries.</li>
                    <li>I've been driving for almost an hour!</li>
                </ul>
            </span>`

        ],
        howToUse: [
            `<ul>
                <li>
                    <span>I</span>
                    <span>you</span>
                    <span>we</span>
                    <span>they</span>
                </li>
                <li>have</li>
            </ul>`,
            `<ul>
                <li>
                    <span>he</span>
                    <span>she</span>
                    <span>it</span>
                </li>
                <li>has</li>
            </ul>`
        ]
    },
    pastSimple: {
        name: 'Past Simple',
        howToBuild: [
            `<span>
                <span class="green-underlined">${t('sentense')}:</span>${t('noun')} + 
                <span class="green-bolded">${t('verb')}(+ed/+d/${t('irregularVerb2')})</span> + ${t('restOfTheWords')}
            </span>`,
            `<span>
                <span class="green-underlined">${t('negative')}:</span>${t('noun')} + 
                <span class="green-bolded">did + not</span> + <span class="green-bolded">${t('verb')}</span> + ${t('restOfTheWords')}
            </span>`,
            `<span>
                <span class="green-underlined">${t('question')}:</span> <span class="green-bolded">Did</span> + ${t('noun')} + <span class="green-bolded">${t('verb')}
                </span> + ${t('restOfTheWords')}?
            </span>`,
            `<span>
                <span class="green-underlined">${t('questionNegative')}:</span> <span class="green-bolded">Did</span> + ${t('noun')} + <span class="green-bolded">not</span> + <span class="green-bolded">${t('verb')}
                </span> + ${t('restOfTheWords')}?
            </span>`
        ],
        description: [
            `<span>
                ${ t('pastSimple.description1') }
                <ul class="grammar-rules--sublist">
                    <li>She cooked delicious dinner yesterday.</li>
                    <li>Last week, we went(<span class="green-bolded">${t('irregularVerb2')}</span>) out of town.</li>
                    <li>A few years ago, we travelled abroad.</li>
                </ul>
            </span>`,
            `<span>
                ${ t('pastSimple.description2') }
                <ul class="grammar-rules--sublist">
                    <li>In my childhood, I always liked cold weather outside during winter.</li>
                    <li>Back in 90s(nineties), we always travelled.</li>
                </ul>
            </span>`,
        ],
        howToUse: [
            `<ul>
                <li>
                    <span>I</span>
                    <span>you</span>
                    <span>we</span>
                    <span>they</span>
                    <span>he</span>
                    <span>she</span>
                    <span>it</span>
                </li>
                <li>
                    <span>ed/d</span>
                </li>
            </ul>`,
        ],
    },
    pastContinuous: {
        name: 'Past Continuous',
        howToBuild: [
            `<span>
                <span class="green-underlined">${t('sentense')}:</span>${t('noun')} + 
                <span class="green-bolded">was/were</span>
                <span class="green-bolded">${t('verb')} + ing</span> + 
                ${t('restOfTheWords')}
            </span>`,
            `<span>
                <span class="green-underlined">${t('negative')}:</span>${t('noun')} + 
                <span class="green-bolded">was + not</span> + 
                <span class="green-bolded">${t('verb')} + ing</span> + ${t('restOfTheWords')}
            </span>`,
            `<span>
                <span class="green-underlined">${t('question')}:</span> 
                <span class="green-bolded">Was/were</span> + ${t('noun')} + 
                <span class="green-bolded">${t('verb')} + ing
                </span> + ${t('restOfTheWords')}?
            </span>`,
            `<span>
                <span class="green-underlined">${t('questionNegative')}:</span> 
                <span class="green-bolded">Was/were</span> + ${t('noun')} + 
                <span class="green-bolded">not</span> + 
                <span class="green-bolded">${t('verb')} + ing
                </span> + ${t('restOfTheWords')}? 
                <br />
                <span class="green-bolded">Was I not cooking this time last night?</span>
            </span>`
        ],
        description: [
            `<span>
                ${ t('pastContinuous.description1') }
                <ul class="grammar-rules--sublist">
                    <li>We were wathing a movie at 7 o'clock yesterday.</li>
                </ul>
            </span>`,
            `<span>
                ${ t('pastContinuous.description2') }
                <ul class="grammar-rules--sublist">
                    <li>He was looking while his father was repairing.</li>
                </ul>
            </span>`,
            `<span>
                ${ t('pastContinuous.description3') }
                <ul class="grammar-rules--sublist">
                    <li>As he was taking a shower, somebody called.</li>
                </ul>
            </span>`,
            `<span>
                ${ t('pastContinuous.description4') }
                <ul class="grammar-rules--sublist">
                    <li>He entered the room where a good smell was coming from.</li>
                </ul>
            </span>`,
            `<span>
                ${ t('pastContinuous.description5') }
                <ul class="grammar-rules--sublist">
                    <li>The children in the school were constantly messing around with each other.</li>
                </ul>
            </span>`,
        ],
        howToUse: [
            `<ul>
                <li>
                    <span>you</span>
                    <span>we</span>
                    <span>they</span>
                </li>
                <li>were</li>
            </ul>`,
            `<ul>
                <li>
                    <span>I</span>
                    <span>he</span>
                    <span>she</span>
                    <span>it</span>
                </li>
                <li>was</li>
            </ul>`
        ],
    }
}

const tensesDataShort: TensesDataShort = {
    futureSimple: {
        name: 'Future Simple',
        content: [
            `<span class="green-bolded">will + ${t('verb')}</span>`,
            `<span>+ I will work</span><span>+ He will write</span>`,
            `<span>- I won't work</span><span>- He won't write</span>`,
            `<span>? Will I work?</span><span>? Will I write?</span>`,
        ]
    },
    futureContinuous: {
        name: 'Future Continuous',
        content: [
            `<span class="green-bolded">will be + ${t('verb')} + ing</span>`,
            `<span>+ I will be working</span><span>+ He will be writing</span>`,
            `<span>- I won't be working</span><span>- He won't be writing</span>`,
            `<span>? Will I be working?</span><span>? Will he be writing?</span>`,
        ]
    },
    futurePerfect: {
        name: 'Future Perfect',
        content: [
            `<span class="green-bolded">will have + ${t('verb')} + ed / ${t('irregularVerb3')}</span>`,
            `<span>+ I will have worked until midnight</span><span>+ He will have written a letter to you by tomorrow</span>`,
            `<span>- I won't have worked until midnight</span><span>- He won't have written a letter to you by tomorrow</span>`,
            `<span>? Will I have worked until midnight?</span><span>? Will he have written a letter to you by tomorrow?</span>`,
        ]
    },
    pastPerfect: {
        name: 'Past Perfect',
        content: [
            `<span class="green-bolded">had + ${t('verb')} + ed / ${t('irregularVerb3')}</span>`,
            `<span>+ I had worked until yesterday 3pm</span><span>+ He had written me a letter by the time I turned 18</span>`,
            `<span>- I had not worked until yesterday 3pm</span><span>- He had not written me a letter by the time I turned 18</span>`,
            `<span>? Had I worked until yesterday 3pm?</span><span>? Had he written me a letter by the time I turned 18?</span>`,
        ]
    },
    pastSimplePassive: {
        name: "Past Simple Passive",
        content: [
            `<span class="green-bolded">was/were + ${t('verb')} + ed / ${t('irregularVerb3')}</span>`,
            `<span>+ The cake was baked by my mother</span><span>+ The letter was written by him</span>`,
            `<span>- The cake was not baked by him</span><span>- The letter was not written by her</span>`,
            `<span>? Was the cake baked by him?</span><span>? Was the letter written by her?</span>`,
        ]
    }
}

</script>


<i18n lang="yaml">
    en:
        howToBuild: How to build
        sentense: Sentense
        noun: Noun
        verb: verb
        or: or
        irregularVerb2: irregular verb in 2nd form
        irregularVerb3: irregular verb in 3rd form
        restOfTheWords: the rest of the words
        negative: Negative
        question: Question
        questionNegative: Question negative
        examplesBelow: See examples <span class="green-bolded">{v}</span> below
        examples: Rules and examples
        # todo
        presentSimpleDescription1: The present simple tense is formed with the base form of the verb (e.g. go, eat, drink, play, etc.)
        presentSimpleDescription2: The present simple tense is used to talk about things that are true in general
        presentSimpleDescription3: Things that happen regularly or repeatedly
        presentSimpleDescription4: Things that happen in the future, if they are planned or arranged
        presentSimpleSpecifics: When to add +s or +es to the verb
        presentSimpleSpecifics1: For most verbs we add -s to the base form
        presentSimpleSpecifics2: When the verb ends in -ch, -ss, -sh, -x or -zz, we add -es
        presentSimpleSpecifics3: When the verb ends in a consonant + -y we change y tow i and add -es
        presentSimpleSpecifics4: But when the verb ends in a vowel + -y we just add -s
        presentSimpleSpecifics5: Have, go, do and be are irregular verbs
        presentContinuousDescription1: We use the present continuous to talk about events which are in progress at the moment of speaking
        presentContinuousDescription2: We use the present continuous to talk about temporary states which are true around the moment of speaking
        presentContinuousDescription3: We use the present continuous to describe actions which are repeated or regular, but which we believe to be temporary
        presentContinuousDescription4: We use the present continuous to talk about a gradual change
        presentContinuousDescription5: We use the present continuous to refer to the future when we talk about plans and arrangements that have already been made
        presentContinuousamisare: When to use am/is/are?
        presentPerfectDescription1: An ongoing action that started in the past, but has not yet been completed
        presentPerfectDescription2: when we are talking about our experience up to the present
        presentPerfectDescription3: An action that was/not completed very recently (often used with just or now)
        presentPerfectDescription4: A change over time
        presentPerfectDescription5: With the following words - just, yet, never, already, ever, so far, up to now, recently, since, for
        presentPerfecthavehas: When to use have/has?
        pastSimpleHowToUse: How to use
    ru:
        howToBuild: Как построить
        sentense: Предложение
        noun: Имя существительное
        verb: глагол
        or: или
        irregularVerb2: неправильный глагол в 2й форме
        irregularVerb3: неправильный глагол в 3й форме
        restOfTheWords: Остальные слова
        negative: Отрицающее
        question: Вопросительное
        questionNegative: Вопросительное отрицательное
        examplesBelow: Смотрите примеры <span class="green-bolded">{v}</span> ниже
        examples: Правила и примеры
        presentSimple:
            name: Настоящее простое
            description1: Настоящее простое время образуется с помощью основной формы глагола (например, go, eat, drink, play, etc.)
            description2: Настоящее простое время используется чтобы говорить о вещах, которые правдивы в общем
            description3: Вещах, которые происходят регулярно или повторяются
            description4: Вещах, которые запланированы или организованы (даже если в будущем)
            description5: Для большинства глаголов мы добавляем -s к основной форме
            description6: Когда глагол заканчивается на -ch, -ss, -sh, -x или -zz, мы добавляем -es
            description7: Когда глагол заканчивается на согласную + -y мы меняем y на i и добавляем -es
            description8: Но когда глагол заканчивается на гласную + -y мы просто добавляем -s
            description9: Have, go, do и be - это неправильные глаголы
            howToUse: Когда использовать s/es?
        presentContinuous:
            name: Настоящее продолжительное
            description1: Мы используем настоящее время, чтобы говорить о событиях, которые в происходят настоящий момент
            description2: Мы используем настоящее время, чтобы говорить о временных состояниях, которые происходят сейчас(в эти дни)
            description3: Мы используем настоящее время, чтобы описывать действия, которые повторяются или регулярны, но мы считаем их временными
            description4: Мы используем настоящее время, чтобы говорить о постепенном изменении
            description5: Мы используем настоящее время, чтобы говорить о будущем, когда мы говорим о планах и намерениях, которые уже сделаны
            howToUse: Когда использовать am/is/are?
        presentPerfect:
            name: Настоящее совершенное
            description1: Мы используем настоящее совершенное время, чтобы говорить о действиях которые начались в прошлом, но еще не завершены
            description2: Мы используем настоящее совершенное время, чтобы говорить о нашем опыте до настоящего времени
            description3: Действие, которое было завершено/или нет совсем недавно (часто используется с just или now)
            description4: Изменения со временем
            description5: Со следующими словами - just, yet, never, already, ever, so far, up to now, recently, since, for
            howToUse: Когда использовать have/has?
        pastSimple: 
            name: Прошедшее простое
            description1: Мы используем простое прошедшее время, чтобы говорить о событиях, которые произошли в конкретную точку времени в прошлом (last week, yesterday, a few years ago etc.)
            description2: Мы используем простое прошедшее время, чтобы говорить о событиях, которые проиcходили много раз в прошлом
            howToUse: Как использовать
        pastContinuous:
            name: Прошедшее продолжительное
            description1: |
                Длительное действие, которое происходило в определенный момент в прошлом
                (at that time yesterday, at 5 o'clock, when he came)
            description2: Два или более длительных действий в прошлом, происходивших одновременно
            description3: Длительное действие в прошлом, которое прерывается другим (как правило, коротким) действием.
            description4: При описании обстановки или атмосферы
            description5: Для выражения отрицательной характеристики
            howToUse: Когда использовать was/were?
        pastPerfect:
            name: Прошедшее совершенное время
        futureSimple:
            name: Будущее простое время
        futureContinuous:
            name: Будущее продолжительное время
        futurePerfect:
            name: Будущее совершенное время
        pastSimplePassive:
            name: Прошедшее простое пассивное время
    zh:
        presentSimpleDescription1: 现在时态由动词的基本形式组成 (例如go, eat, drink, play等)
        presentContinuousDescription1: 现在时
        presentPerfectDescription1: 现在时
        pastSimpleHowToUse: TBD
</i18n>