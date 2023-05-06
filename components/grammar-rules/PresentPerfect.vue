<template>
    <div>
        <h3 class="grammar-rules--title">Present Perfect ({{t('presentPerfect')}})</h3>

        <h4>{{t('generalWords.howToBuild')}}</h4>
        <ul class="grammar-rules--sublist">
            <li>
                <span class="green-underlined">{{t('generalWords.sentense')}}:</span>
                {{t('generalWords.noun')}} +
                <span class="green-bolded">have/has</span> +
                {{t('generalWords.verb')}}<span class="green-bolded"> (+ed)</span> {{t('or')}} <span class="green-bolded">{{t('irregularVerb3')}}</span> +
                {{t('generalWords.restOfTheWords')}}
            </li>

            <li>
                <span class="green-underlined">{{t('generalWords.negative')}}:</span>
                {{t('generalWords.noun')}} +
                <span class="green-bolded">have/has</span> + not +
                {{t('generalWords.verb')}} <span class="green-bolded"> (+ed)</span> {{t('or')}} <span class="green-bolded">{{t('irregularVerb3')}}</span> +
                {{t('generalWords.restOfTheWords')}}
            </li>

            <li>
                <span class="green-underlined">{{t('generalWords.question')}}:</span>{{ " " }}
                <span class="green-bolded">Have/has</span> +
                {{t('generalWords.noun')}} +
                {{t('generalWords.verb')}} <span class="green-bolded"> (+ed)</span> {{t('or')}} <span class="green-bolded">{{t('irregularVerb3')}}</span> +
                {{t('generalWords.restOfTheWords')}} + ?</li>
        </ul>
        <p v-html="t('examplesBelow', {v: 'a, b, c'})" class="underline"></p>

        <h4>{{t('generalWords.examples')}}</h4>
        <ul class="grammar-rules--description">
            <li>
                {{t('presentPerfectDescription1')}}
                <ul class="grammar-rules--sublist">
                    <li>He <span class="green-bolded">has known</span> how to drive a car since the age of 18.</li>
                    <li>She <span class="green-bolded">has never known</span> how to drive a car.</li>
                    <li>Has he <span class="green-bolded">known</span> how to drive a car since 2017(twenty-seventeen)?</li>
                </ul>
            </li>
            <li>
                {{t('presentPerfectDescription2')}}
                <ul class="grammar-rules--sublist">
                    <li>I <span class="green-bolded">have watched</span> this movie before.</li>
                    <li>I <span class="green-bolded">have not</span> (haven't) watch<span class="green-bolded">ed</span> this movie before.</li>
                    <li>Have I watch<span class="green-bolded">ed</span> this movie before?</li>
                </ul>
            </li>
            <li>
                {{ t('presentPerfectDescription3') }}
                <ul class="grammar-rules--sublist">
                    <li>I have (I've) just <span class="green-bolded">eaten</span> my breakfast.</li>
                    <li>She has not (hasn't) <span class="green-bolded">eaten</span> her breakfast yet.</li>
                    <li>Have we <span class="green-bolded">eaten</span> our breakfast yet?</li>
                </ul>
            </li>
            <li>
                {{ t('presentPerfectDescription4') }}
                <ul class="grammar-rules--sublist">
                    <li>Because of many intense lessons, I have learn<span class="green-bolded">ed</span> English very well.</li>
                    <li>She has not (hasn't) learn<span class="green-bolded">ed</span> English very well yet.</li>
                    <li>Have they learn<span class="green-bolded">ed</span> English already?</li>
                </ul>
            </li>
            <li>
                {{ t('presentPerfectDescription5') }}
                <ul class="grammar-rules--sublist">
                    <li>I have (I've) just finished my work</li>
                    <li>She has not (hasn't) finished her work yet.</li>
                    <li>I have (I've) never visited Canada.</li>
                    <li>I have (I've) already worked in Canada for 1 year.</li>
                    <li>Have you ever thought of travelling around the world?</li>
                    <li>So far, I have (I've) only been to 10 countries.</li>
                    <li>I've been driving for almost an hour!</li>
                </ul>
            </li>
        </ul>

        <h4>{{t('presentPerfecthavehas')}}</h4>
        <ul class="grammar-rules--hashave">
            <li>
                <span>
                    <span>I</span>
                    <span>you</span>
                    <span>we</span>
                    <span>they</span>
                </span>
                <span>have</span>
            </li>
            <li>
                <span>
                    <span>he</span>
                    <span>she</span>
                    <span>it</span>
                </span>
                <span>has</span>
            </li>
        </ul>
    </div>
</template>

<script lang="ts" setup>
const { t } = useI18n()

</script>

<style lang="scss">
.presentPerfect {
    ul.grammar-rules--hashave {
        @apply py-3;
        li {
            display: flex;
            > span {
                @apply text-center flex-1 ;

                &:nth-child(1) {
                    @apply border-t-mainGreen border-t-2 border-r-mainGreen border-r-2 border-l-2 border-l-mainGreen flex flex-col;
                }

                &:nth-child(2) {
                    @apply border-t-mainGreen border-t-2 border-r-mainGreen border-r-2 flex justify-center items-center;
                }
            }

            &:last-child {
                > span {
                    &:nth-child(1) :last-child,
                    &:nth-child(2) {
                        @apply border-b-mainGreen border-b-2;
                    }
                }
            }
        }
    }
}
</style>

<i18n lang="yaml">
    en:
        presentPerfectDescription1: An ongoing action that started in the past, but has not yet been completed
        presentPerfectDescription2: when we are talking about our experience up to the present
        presentPerfectDescription3: An action that was/not completed very recently (often used with just or now)
        presentPerfectDescription4: A change over time
        presentPerfectDescription5: With the following words - just, yet, never, already, ever, so far, up to now, recently, since, for
        presentPerfecthavehas: When to use have/has?
    ru:
        presentPerfectDescription1: Мы используем настоящее совершенное время, чтобы говорить о действиях которые начались в прошлом, но еще не завершены
        presentPerfectDescription2: Мы используем настоящее совершенное время, чтобы говорить о нашем опыте до настоящего времени
        presentPerfectDescription3: Действие, которое было завершено/или нет совсем недавно (часто используется с just или now)
        presentPerfectDescription4: Изменения со временем
        presentPerfectDescription5: Со следующими словами - just, yet, never, already, ever, so far, up to now, recently, since, for
        presentPerfecthavehas: Когда использовать have/has?
    zh:
        presentPerfect: 现在时
</i18n>

