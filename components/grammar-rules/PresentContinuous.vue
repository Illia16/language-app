<template>
    <div>
        <h3 class="grammar-rules--title">Present Continuous ({{t('presentContinuous')}})</h3>

        <h4>{{t('generalWords.howToBuild')}}</h4>
        <ul class="grammar-rules--sublist">
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
                {{t('generalWords.restOfTheWords')}} ?</li>
        </ul>
        <p v-html="t('examplesBelow', {v: 'a, b, c'})" class="underline"></p>

        <h4>{{t('generalWords.examples')}}</h4>
        <ul class="grammar-rules--description">
            <li>
                {{t('presentContinuousDescription1')}}
                <ul class="grammar-rules--sublist">
                    <li>I'm play<span class="green-bolded">ing</span> football now.</li>
                    <li>I'm not play<span class="green-bolded">ing</span> football now.</li>
                    <li>Am I play<span class="green-bolded">ing</span> football now?</li>
                </ul>
            </li>
            <li>
                {{t('presentContinuousDescription2')}}
                <ul class="grammar-rules--sublist">
                    <li>I am (I'm) watch<span class="green-bolded">ing</span> new TV show these days.</li>
                    <li>I am not (I'm not) watch<span class="green-bolded">ing</span> new TV show these days.</li>
                    <li>Am I watch<span class="green-bolded">ing</span> new TV show these days?</li>
                </ul>
            </li>
            <li>
                {{ t('presentContinuousDescription3') }}
                <ul class="grammar-rules--sublist">
                    <li>I am look<span class="green-bolded">ing</span> after his dog while he is out of town.</li>
                    <li>I am (I'm) not driv<span class="green-bolded">ing</span> much these days. I am (I'm) letting my wife do it so she can practice.</li>
                    <li>Are you driv<span class="green-bolded">ing</span> a lot these days?</li>
                </ul>
            </li>
            <li>
                {{ t('presentContinuousDescription4') }}
                <ul class="grammar-rules--sublist">
                    <li>They are (they're) build<span class="green-bolded">ing</span> a new condo in my area.</li>
                    <li>I am (I'm) try<span class="green-bolded">ing</span> to get used to the construction noice.</li>
                    <li>Are they build<span class="green-bolded">ing</span> a new condo in my area?</li>
                </ul>
            </li>
            <li>
                {{ t('presentContinuousDescription5') }}
                <ul class="grammar-rules--sublist">
                    <li>We are (we're) go<span class="green-bolded">ing</span> on vacation next Friday. (already planned)</li>
                    <li>We are (we're) not go<span class="green-bolded">ing</span> to work next week. (already planned)</li>
                    <li>Are we go<span class="green-bolded">ing</span> on vacation next Friday?</li>
                </ul>
            </li>
        </ul>

        <h4>{{t('presentContinuousamisare')}}</h4>
        <Table>
            <li>
                <ul>
                    <li>I</li>
                    <li>am</li>
                </ul>
            </li>
            <li>
                <ul>
                    <li>
                        <span>you</span>
                        <span>we</span>
                        <span>they</span>
                    </li>
                    <li>
                        <span>are</span>
                    </li>
                </ul>
            </li>
            <li>
                <ul>
                    <li>
                        <span>he</span>
                        <span>she</span>
                        <span>it</span>
                    </li>
                    <li>
                        <span>is</span>
                    </li>
                </ul>
            </li>
        </Table>
    </div>
</template>

<script lang="ts" setup>
const { t } = useI18n()

</script>

<i18n lang="yaml">
    en:
        presentContinuousDescription1: We use the present continuous to talk about events which are in progress at the moment of speaking
        presentContinuousDescription2: We use the present continuous to talk about temporary states which are true around the moment of speaking
        presentContinuousDescription3: We use the present continuous to describe actions which are repeated or regular, but which we believe to be temporary
        presentContinuousDescription4: We use the present continuous to talk about a gradual change
        presentContinuousDescription5: We use the present continuous to refer to the future when we talk about plans and arrangements that have already been made
        presentContinuousamisare: When to use am/is/are?
    ru:
        presentContinuousDescription1: Мы используем настоящее время, чтобы говорить о событиях, которые в происходят настоящий момент
        presentContinuousDescription2: Мы используем настоящее время, чтобы говорить о временных состояниях, которые происходят сейчас(в эти дни)
        presentContinuousDescription3: Мы используем настоящее время, чтобы описывать действия, которые повторяются или регулярны, но мы считаем их временными
        presentContinuousDescription4: Мы используем настоящее время, чтобы говорить о постепенном изменении
        presentContinuousDescription5: Мы используем настоящее время, чтобы говорить о будущем, когда мы говорим о планах и намерениях, которые уже сделаны
        presentContinuousamisare: Когда использовать am/is/are?
    zh:
        presentContinuousDescription1: 现在时
</i18n>

