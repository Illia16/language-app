<template>
    <Table class="irregular-verbs-table">
        <li>
            <ul>
                <li>{{t('irrgegularVerbs.translation')}}</li>
                <li>{{ t('irrgegularVerbs.infinitive')}}</li>
                <li>{{ t('irrgegularVerbs.past')}}</li>
                <li>{{ t('irrgegularVerbs.pastParticiple')}}</li>
            </ul>
        </li>
        <li v-for="(irregularVerb, i) of irregularVerbs" :key="i">
            <ul>
                <li>{{ irregularVerb.translation }}</li>
                <li>{{ irregularVerb.infinitive }}</li>
                <li>{{ irregularVerb.past }}</li>
                <li>{{ irregularVerb.pastParticiple }}</li>
            </ul>
        </li>
    </Table>
</template>

<script lang="ts" setup>
const { t } = useI18n({useScope: 'local'})

const irregularVerbs = [
    { translation: 'быть', infinitive: 'be', past: 'was/were', pastParticiple: 'been' },
    { translation: 'бить', infinitive: 'beat', past: 'beat', pastParticiple: 'beaten' },
    { translation: 'становиться', infinitive: 'become', past: 'became', pastParticiple: 'become' },
    { translation: 'начинать', infinitive: 'begin', past: 'began', pastParticiple: 'begun' },
    { translation: 'изгибаться', infinitive: 'bend', past: 'bent', pastParticiple: 'bent' },
    { translation: 'ставить', infinitive: 'set', past: 'set', pastParticiple: 'set' },
    { translation: 'сидеть', infinitive: 'sit', past: 'sat', pastParticiple: 'sat' },
    { translation: 'кусать', infinitive: 'bite', past: 'bit', pastParticiple: 'bitten' },
    { translation: 'дуть', infinitive: 'blow', past: 'blew', pastParticiple: 'blown' },
    { translation: 'ломать', infinitive: 'break', past: 'broke', pastParticiple: 'broken' },
    { translation: 'приносить', infinitive: 'bring', past: 'brought', pastParticiple: 'brought' },
    { translation: 'строить', infinitive: 'build', past: 'built', pastParticiple: 'built' },
    { translation: 'гореть', infinitive: 'burn', past: 'burnt/burned', pastParticiple: 'burnt/burned' },
    { translation: 'приходить', infinitive: 'come', past: 'came', pastParticiple: 'come' },
    { translation: 'делать', infinitive: 'do', past: 'did', pastParticiple: 'done' },
    { translation: 'кушать', infinitive: 'eat', past: 'ate', pastParticiple: 'eaten' },
    { translation: 'делать', infinitive: 'make', past: 'made', pastParticiple: 'made' },
    { translation: 'означать', infinitive: 'mean', past: 'meant', pastParticiple: 'meant' },
    { translation: 'встретить', infinitive: 'meet', past: 'met', pastParticiple: 'met' },
    { translation: 'купаться', infinitive: 'swim', past: 'swam', pastParticiple: 'swum' },
    { translation: 'брать', infinitive: 'take', past: 'took', pastParticiple: 'taken' },
    { translation: 'учить', infinitive: 'teach', past: 'taught', pastParticiple: 'taught' },
    { translation: 'рвать', infinitive: 'tear', past: 'tore', pastParticiple: 'torn' },
    { translation: 'сказать', infinitive: 'say', past: 'said', pastParticiple: 'said' },
    { translation: 'говорить', infinitive: 'speak', past: 'spoke', pastParticiple: 'spoken' },
    { translation: 'сидеть', infinitive: 'sit', past: 'sat', pastParticiple: 'sat'},
    { translation: 'писать', infinitive: 'write', past: 'wrote', pastParticiple: 'written'},
]
</script>

<i18n lang="yaml">
    en:
        irrgegularVerbs:
            translation: 'Translation'
            infinitive: '1st form (Infinitive)'
            past: '2nd form (Past)'
            pastParticiple: '3rd form (Participle)'
    ru:
        irrgegularVerbs:
            translation: 'Перевод'
            infinitive: '1 форма (Инфинитив)'
            past: '2 форма (Прошедшее)'
            pastParticiple: '3 форма (Причастие)'
    zh:
        irrgegularVerbs:
            translation: '翻译'
            infinitive: '1形式 (不定式)'
            past: '2形式 (过去式)'
            pastParticiple: '3形式 (分词)'
</i18n>