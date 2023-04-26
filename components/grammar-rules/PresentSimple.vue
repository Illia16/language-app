<template>
    <div>
        <h3 class="grammar-rules--title">Present Simple ({{t('presentSimple')}})</h3>
        <ul class="grammar-rules--description">
            <li>{{t('presentSimpleDescription1')}}</li>
            <li>{{t('presentSimpleDescription2')}}:</li>
            <ul class="grammar-rules--description">
                <li>{{ t('presentSimpleDescription2A') }}</li>
                <li>{{ t('presentSimpleDescription2B') }} (Often, every year, from time to time, seldom, rare, usually)</li>
                <li>{{ t('presentSimpleDescription2C') }}</li>
            </ul>
        </ul>

        <h4>{{t('presentSimpleSpecifics')}}</h4>
        <ul class="grammar-rules--specifics">
            <li>{{t('presentSimpleSpecifics1')}} (come<span class="green-bolded">s</span>, eat<span class="green-bolded">s</span>, walk<span class="green-bolded">s</span>)</li>
            <li>{{t('presentSimpleSpecifics2')}} (watch<span class="green-bolded">es</span>, wash<span class="green-bolded">es</span>, mix<span class="green-bolded">es</span>)</li>
            <li>{{t('presentSimpleSpecifics3')}} (hurr<span class="green-bolded">ies</span>, stud<span class="green-bolded">ies</span>, repl<span class="green-bolded">ies</span>)</li>
            <li>{{t('presentSimpleSpecifics4')}} (pay<span class="green-bolded">s</span>, enjoy<span class="green-bolded">s</span>)</li>
            <li>{{t('presentSimpleSpecifics5')}} (has, goes, does, is (be)</li>
        </ul>

        <h4>{{t('generalWords.howToBuild')}}</h4>
        <ul class="grammar-rules--how-to-build">
            <li><span class="green-underlined">{{t('generalWords.sentense')}}:</span> {{t('generalWords.noun')}} + <span class="green-bolded">{{t('generalWords.verb')}}(+s/+es)</span> + {{t('generalWords.restOfTheWords')}}</li>
            <li><span class="green-underlined">{{t('generalWords.negative')}}:</span> {{t('generalWords.noun')}} + <span class="green-bolded">do/does</span> + not + <span class="green-bolded">{{t('generalWords.verb')}}(+s/+es)</span> + {{t('generalWords.restOfTheWords')}}</li>
            <li><span class="green-underlined">{{t('generalWords.question')}}:</span> <span class="green-bolded">Do/Does</span> + {{t('generalWords.noun')}} + <span class="green-bolded">{{t('generalWords.verb')}}(+s/+es)</span> + {{t('generalWords.restOfTheWords')}}?</li>
        </ul>

        <h4>{{t('generalWords.examples')}}</h4>
        <ul class="grammar-rules--examples">
            <li>
                <ul>
                    <li>I play football every week.</li>
                    <li>I do <span class="green-bolded">not</span> play football every week.</li>
                    <li>Do I play football every week?</li>
                </ul>
            </li>
            <li>
                <ul>
                    <li>She go<span class="green-bolded">es</span> to school every day.</li>
                    <li>She do<span class="green-bolded">es not</span> go to school every day.</li>
                    <li>Do<span class="green-bolded">es</span> she go to school every day?</li>
                </ul>
            </li>
            <li>
                <ul>
                    <li>He eat<span class="green-bolded">s</span> breakfast every morning.</li>
                    <li>He do<span class="green-bolded">es</span> not eat breakfast every morning.</li>
                    <li>Do<span class="green-bolded">es</span> he eat breakfast every morning?</li>
                </ul>
            </li>
        </ul>
    </div>
</template>

<script lang="ts" setup>
const { t } = useI18n()

</script>


<i18n lang="yaml">
    en:
        presentSimple: Present Simple
        presentSimpleDescription1: The present simple tense is formed with the base form of the verb (e.g. go, eat, drink, play, etc.)
        presentSimpleDescription2: The present simple tense is used to talk about
        presentSimpleDescription2A: Things that are true in general
        presentSimpleDescription2B: Things that happen regularly or repeatedly
        presentSimpleDescription2C: Things that happen in the future, if they are planned or arranged
        presentSimpleSpecifics: When to add +s or +es to the verb
        presentSimpleSpecifics1: For most verbs we add -s to the base form
        presentSimpleSpecifics2: When the verb ends in -ch, -ss, -sh, -x or -zz, we add -es
        presentSimpleSpecifics3: When the verb ends in a consonant + -y we change y tow i and add -es
        presentSimpleSpecifics4: But when the verb ends in a vowel + -y we just add -s
        presentSimpleSpecifics5: Have, go, do and be are irregular verbs
    ru:
        presentSimple: Настоящее простое
        presentSimpleDescription1: Настоящее простое время образуется с помощью основной формы глагола (например, go, eat, drink, play, etc.)
        presentSimpleDescription2: Настоящее простое время используется чтобы говорить о
        presentSimpleDescription2A: Вещах, которые правдивы в общем
        presentSimpleDescription2B: Вещах, которые происходят регулярно или повторяются
        presentSimpleDescription2C: Вещах, которые запланированы или организованы (даже если в будущем)
        presentSimpleSpecifics: Когда добавлять +s или +es к глаголу
        presentSimpleSpecifics1: Для большинства глаголов мы добавляем -s к основной форме
        presentSimpleSpecifics2: Когда глагол заканчивается на -ch, -ss, -sh, -x или -zz, мы добавляем -es
        presentSimpleSpecifics3: Когда глагол заканчивается на согласную + -y мы меняем y на i и добавляем -es
        presentSimpleSpecifics4: Но когда глагол заканчивается на гласную + -y мы просто добавляем -s
        presentSimpleSpecifics5: Have, go, do и be - это неправильные глаголы
    zh:
        presentSimple: 现在时
</i18n>