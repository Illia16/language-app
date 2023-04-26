<template>
    <div>
        <h3 class="grammar-rules--title">Present Continuous ({{t('presentContinuous')}})</h3>
        <ul class="grammar-rules--description">
            <li>{{t('presentContinuousDescription1')}}</li>
            <li>{{t('presentContinuousDescription2')}}</li>
            <li>{{ t('presentContinuousDescription3') }}</li>
            <li>{{ t('presentContinuousDescription4') }}</li>
            <li>{{ t('presentContinuousDescription5') }}</li>
        </ul>

        <h4>{{t('presentContinuousamisare')}}</h4>
        <ul class="grammar-rules--amisare">
            <li>
                <span>
                    <span>I</span>
                </span>
                <span>am</span>
            </li>
            <li>
                <span>
                    <span>you</span>
                    <span>we</span>
                    <span>they</span>
                </span>
                <span>are</span>
            </li>
            <li>
                <span>
                    <span>he</span>
                    <span>she</span>
                    <span>it</span>
                </span>
                <span>is</span>
            </li>
        </ul>

        <h4>{{t('generalWords.howToBuild')}}</h4>
        <ul class="grammar-rules--how-to-build">
            <li>
                <span class="green-underlined">{{t('generalWords.sentense')}}:</span> 
                {{t('generalWords.noun')}} + 
                <span class="green-bolded">am/is/are</span> + 
                <span class="green-bolded">{{t('generalWords.verb')}}(+ing)</span> + 
                {{t('generalWords.restOfTheWords')}}
            </li>

            <li>
                <span class="green-underlined">{{t('generalWords.negative')}}:</span>
                {{t('generalWords.noun')}} + 
                <span class="green-bolded">am/is/are</span> + not +
                <span class="green-bolded">{{t('generalWords.verb')}}(+ing)</span> + 
                {{t('generalWords.restOfTheWords')}}
            </li>

            <li>
                <span class="green-underlined">{{t('generalWords.question')}}:</span>{{ " " }}
                <span class="green-bolded">Is/Are/Am</span> + 
                {{t('generalWords.noun')}} +
                {{t('generalWords.verb')}}
                <span class="green-bolded">(+ing)</span> + 
                {{t('generalWords.restOfTheWords')}} + ?</li>
        </ul>

        <h4>{{t('generalWords.examples')}}</h4>
        <ul class="grammar-rules--examples">
            <li>
                <ul>
                    <li>I'm play<span class="green-bolded">ing</span> football now.</li>
                    <li>I'm not play<span class="green-bolded">not</span> football now.</li>
                    <li>Am I play<span class="green-bolded">ing</span> football now?</li>
                </ul>
            </li>
            <li>
                <ul>
                    <li>He's watch<span class="green-bolded">ing</span> TV now.</li>
                    <li>He's not watch<span class="green-bolded">ing</span> TV now.</li>
                    <li>Is he watch<span class="green-bolded">ing</span> TV now?</li>
                </ul>
            </li>
            <li>
                <ul>
                    <li>She's read<span class="green-bolded">ing</span> a book now.</li>
                    <li>She's not read<span class="green-bolded">ing</span> a book now.</li>
                    <li>Is she read<span class="green-bolded">ing</span> a book now?</li>
                </ul>
            </li>
        </ul>
    </div>
</template>

<script lang="ts" setup>
const { t } = useI18n()

</script>

<style lang="scss">
.presentContinuous {
    ul.grammar-rules--amisare {
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
        presentContinuous: Present Continuous
        presentContinuousDescription1: We use the present continuous to talk about events which are in progress at the moment of speaking
        presentContinuousDescription2: We use the present continuous to talk about temporary states which are true around the moment of speaking
        presentContinuousDescription3: We use the present continuous to describe actions which are repeated or regular, but which we believe to be temporary
        presentContinuousDescription4: We use the present continuous to talk about a gradual change
        presentContinuousDescription5: We use the present continuous to refer to the future when we talk about plans and arrangements that have already been made
        presentContinuousamisare: When to use am/is/are?
    ru:
        presentContinuous: Настоящее время
        presentContinuousDescription1: Мы используем настоящее время, чтобы говорить о событиях, которые в происходят настоящий момент 
        presentContinuousDescription2: Мы используем настоящее время, чтобы говорить о временных состояниях, которые происходят сейчас(в эти дни)
        presentContinuousDescription3: Мы используем настоящее время, чтобы описывать действия, которые повторяются или регулярны, но мы считаем их временными
        presentContinuousDescription4: Мы используем настоящее время, чтобы говорить о постепенном изменении
        presentContinuousDescription5: Мы используем настоящее время, чтобы говорить о будущем, когда мы говорим о планах и намерениях, которые уже сделаны
        presentContinuousamisare: Когда использовать am/is/are?
    zh:
        presentContinuous: 现在时
</i18n>

