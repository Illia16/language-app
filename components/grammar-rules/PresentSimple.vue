<template>
    <div>
        <h3 class="grammar-rules--title">Present Simple ({{t('presentSimple')}})</h3>
        <ul class="grammar-rules--description">
            <li>{{t('presentSimpleDescription1')}}</li>
            <li>{{t('presentSimpleDescription2')}}</li>
            <li>{{ t('presentSimpleDescription2A') }}</li>
            <li>{{ t('presentSimpleDescription2B') }}</li>
            <li>{{ t('presentSimpleDescription2C') }}</li>
            <li>{{t('presentSimpleDescription3')}}</li>
        </ul>

        <h4>{{t('presentSimpleDescription3')}}</h4>
        <ul class="grammar-rules--form">
            <li>{{t('presentSimpleDescription3A')}} (come<span class="green-bolded">s</span>, eat<span class="green-bolded">s</span>, walk<span class="green-bolded">s</span>)</li>
            <li>{{t('presentSimpleDescription3B')}} (watch<span class="green-bolded">es</span>, wash<span class="green-bolded">es</span>, mix<span class="green-bolded">es</span>)</li>
            <li>{{t('presentSimpleDescription3C')}} (hurr<span class="green-bolded">ies</span>, stud<span class="green-bolded">ies</span>, repl<span class="green-bolded">ies</span>)</li>
            <li>{{t('presentSimpleDescription3D')}} (pay<span class="green-bolded">s</span>, enjoy<span class="green-bolded">s</span>)</li>
            <li>{{t('presentSimpleDescription3E')}} (has, goes, does, is (be)</li>
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
        presentSimpleDescription3: When to add +s or +es to the verb
        presentSimpleDescription3A: For most verbs we add -s to the base form
        presentSimpleDescription3B: When the verb ends in -ch, -ss, -sh, -x or -zz, we add -es
        presentSimpleDescription3C: When the verb ends in a consonant + -y we change y to i and add -es
        presentSimpleDescription3D: But when the verb ends in a vowel + -y we just add -s
        presentSimpleDescription3E: Have, go, do and be are irregular verbs
    ru:
        presentSimple: Настоящее простое
        presentSimpleDescription1: Настоящее простое время образуется с помощью основной формы глагола (например, go, eat, drink, play, etc.)
        presentSimpleDescription2: Настоящее простое время используется чтобы говорить о
        presentSimpleDescription2A: Вещах, которые правдивы в общем
        presentSimpleDescription2B: Вещах, которые происходят регулярно или повторяются
        presentSimpleDescription2C: Вещах, которые запланированы или организованы (даже если в будущем)
        presentSimpleDescription3: Когда добавлять +s или +es к глаголу
        presentSimpleDescription3A: Для большинства глаголов мы добавляем -s к основной форме
        presentSimpleDescription3B: Когда глагол заканчивается на -ch, -ss, -sh, -x или -zz, мы добавляем -es
        presentSimpleDescription3C: Когда глагол заканчивается на согласную + -y мы меняем y на i и добавляем -es
        presentSimpleDescription3D: Но когда глагол заканчивается на гласную + -y мы просто добавляем -s
        presentSimpleDescription3E: Have, go, do и be - это неправильные глаголы
    zh:
        presentSimple: 现在时
</i18n>