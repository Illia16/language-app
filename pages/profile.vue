<template>
    <div v-if="store.userLangData" class="listOfWords">
        <h1>{{ t('listOfWords') }}</h1>

        <ul>
            <li class="listOfWords-item">
                <span>{{ t('item') }}:</span>
            </li>
            <li class="listOfWords-itemCorrect">
                <span>{{ t('itemCorrect') }}:</span>
            </li>
            <li class="listOfWords-itemType">
                <span>{{ t('itemType') }}:</span>
            </li>
            <li class="listOfWords-itemTypeCategory">
                <span>{{ t('itemTypeCategory') }}:</span>
            </li>
            <li class="listOfWords-languageStudying">
                <span>{{ t('languageStudying') }}:</span>
            </li>
            <li>
                <span>{{ t('level') }}:</span>
            </li>
            <li class="lastLi"></li>
            <li class="lastLi"></li>
        </ul>

        <ul v-for="(el, i) of store.userLangData" :key="i">
            <li class="listOfWords-item">
                <span>{{ t('item') }}:</span>
                <span>{{ el.item }}</span>
                <span v-if="el.fileUrl" class="listOfWords-item--audio">
                    <span>{{ t('audio') }}:</span>
                    <AudioPlayer :file="el.fileUrl"></AudioPlayer>
                </span>
            </li>
            <li class="listOfWords-itemCorrect">
                <span>{{ t('itemCorrect') }}:</span>
                <span>{{ el.itemCorrect }}</span>
            </li>
            <li class="listOfWords-itemType">
                <span>{{ t('itemType') }}:</span>
                <span>{{ el.itemType }}</span>
            </li>
            <li class="listOfWords-itemTypeCategory">
                <span>{{ t('itemTypeCategory') }}:</span>
                <span>{{ el.itemTypeCategory }}</span>
            </li>
            <li class="listOfWords-languageStudying">
                <span>{{ t('languageStudying') }}:</span>
                <span>{{ el.languageStudying }}</span>
            </li>
            <li>
                <span>{{ t('level') }}:</span>
                <span>{{ el.level }}</span>
            </li>
            <li class="listOfWords-btn--delete lastLi">
                <button type="button" @click="() => openConfirmModal(el, t('delete'))">{{ t('delete') }}</button>
            </li>
            <li class="listOfWords-btn--update lastLi">
                <button type="button" @click="() => openConfirmModal(el, t('update'))">{{ t('update') }}</button>
            </li>
        </ul>
        <ul>
            <li  class="listOfWords-addNewItem">
                <button @click="() => openConfirmModal(null, t('add'))">{{ t('addNewItem') }}</button>
            </li>
        </ul>
    </div>

    <teleport to="body">
        <Modal v-if="store.modalOpen && store.modalType === t('delete')" @closeCallback="closeConfirmModal" class="modal-delete-item">
            <!-- <h2>Are you sure you want to {{ activeModalAction }} the following item?</h2> -->
            <h2>{{ t('modalTitle', { activeModalAction: activeModalAction }) }}</h2>
            <ul>
                <li>
                    <span>
                        {{ t('item') }}:
                    </span>
                    <span>
                        {{v_item}}
                    </span>
                </li>
                <li>
                    <span>
                        {{ t('itemCorrect') }}:
                    </span>
                    <span>
                        {{v_itemCorrect}}
                    </span>
                </li>
                <li>
                    <span>
                        {{ t('itemType') }}:
                    </span>
                    <span>
                        {{v_itemType}}
                    </span>
                </li>
                <li>
                    <span>
                        {{ t('itemTypeCategory') }}:
                    </span>
                    <span>
                        {{v_itemTypeCategory}}
                    </span>
                </li>
                <li>
                    <span>
                        {{ t('level') }}:
                    </span>
                    <span>
                        {{v_level}}
                    </span>
                </li>
            </ul>
            <div class="space-y-4">
                <button class="custom-button-link" @click="deleteUserData">{{t('confirm')}}</button>
                <button @click="closeConfirmModal" class="custom-button-link">{{t('cancel')}}</button>
            </div>
        </Modal>

        <Modal v-if="store.modalOpen && store.modalType === t('add')" @closeCallback="closeConfirmModal" class="modal-add-item">
            <h2>{{ t('modalTitle', { activeModalAction: activeModalAction }) }}</h2>
                <div class="form_el">
                    <label>{{t('item')}}</label>
                    <input type="text" v-model="v_item" />
                </div>
                <div class="form_el">
                    <label>{{t('itemTranscription')}} ({{ t('optional') }})</label>
                    <input type="text" v-model="v_itemTranscription" />
                </div>
                <div class="form_el">
                    <label>{{t('itemCorrect')}}</label>
                    <input type="text" v-model="v_itemCorrect" />
                </div>

                <CustomSelect
                    v-model="v_itemType"
                    :options="[
                        ...itemType,
                        {
                            name: t('addNew'),
                            value: 'addNew'
                        }
                    ]"
                    state="itemType"
                >
                    <template v-slot:label>{{t('itemType')}}</template>
                    <template v-slot:field-error>
                        <div class="field-error">Please select a itemType.</div>
                    </template>
                </CustomSelect>

                <div v-if="v_itemType === 'addNew'" class="form_el">
                    <label>{{t('newItemType')}}</label>
                    <input type="text" v-model="v_newItemType" />
                </div>

                <CustomSelect
                    v-model="v_itemTypeCategory"
                    :options="[
                        ...itemTypeCategory,
                        {
                            name: t('addNew'),
                            value: 'addNew'
                        }
                    ]"
                    state="itemTypeCategory"
                >
                    <template v-slot:label>{{t('itemTypeCategory')}}</template>
                    <template v-slot:field-error>
                        <div class="field-error">Please select a itemTypeCategory.</div>
                    </template>
                </CustomSelect>

                <div v-if="v_itemTypeCategory === 'addNew'" class="form_el">
                    <label>{{t('newItemTypeCategory')}}</label>
                    <input type="text" v-model="v_newItemTypeCategory" />
                </div>

                <CustomSelect
                    v-model="v_languageStudying"
                    :options="[
                        {
                            name: 'English',
                            value: 'en',
                        },
                        {
                            name: 'Chinese',
                            value: 'zh',
                        },
                    ]"
                    state="lang"
                >
                    <template v-slot:label>{{t('languageStudying')}}</template>
                    <template v-slot:field-error>
                        <div class="field-error">Please select a languageStudying.</div>
                    </template>
                </CustomSelect>

                <CustomSelect
                    v-model="v_level"
                    :options="[
                        {
                            name: '0',
                            value: '0',
                        },
                        {
                            name: '1',
                            value: '1',
                        },
                        {
                            name: '2',
                            value: '2',
                        },
                        {
                            name: '3',
                            value: '3',
                        },
                        {
                            name: '4',
                            value: '4',
                        },
                        {
                            name: '5',
                            value: '5',
                        },
                        {
                            name: '6',
                            value: '6',
                        },
                        {
                            name: '7',
                            value: '7',
                        },
                        {
                            name: '8',
                            value: '8',
                        },
                        {
                            name: '9',
                            value: '9',
                        },
                        {
                            name: '10',
                            value: '10',
                        },
                    ]"
                    state="level"
                >
                    <template v-slot:label>{{t('level')}}</template>
                </CustomSelect>
                <FileInput v-model="v_file"></FileInput>
            <div class="space-y-4">
                <button class="custom-button-link" @click="addUserData">{{t('confirm')}}</button>
                <button @click="closeConfirmModal" class="custom-button-link">{{t('cancel')}}</button>
            </div>
        </Modal>

        <Modal v-if="store.modalOpen && store.modalType === t('update')" @closeCallback="closeConfirmModal" class="modal-update-item">
            <h2>{{ t('modalTitle', { activeModalAction: activeModalAction }) }}</h2>
            <div class="form_el">
                <label>{{t('item')}}</label>
                <input type="text" v-model="v_item" />
            </div>
            <div class="form_el">
                <label>{{t('itemTranscription')}} ({{ t('optional') }})</label>
                <input type="text" v-model="v_itemTranscription" />
            </div>
            <div class="form_el">
                <label>{{t('itemCorrect')}}</label>
                <input type="text" v-model="v_itemCorrect" />
            </div>
            <div class="form_el">
                <label>{{t('itemType')}}</label>
                <input type="text" v-model="v_itemType" />
            </div>
            <div class="form_el">
                <label>{{t('itemTypeCategory')}}</label>
                <input type="text" v-model="v_itemTypeCategory" />
            </div>
            <CustomSelect
                v-model="v_languageStudying"
                :options="[
                    {
                        name: 'English',
                        value: 'en',
                    },
                    {
                        name: 'Chinese',
                        value: 'zh',
                    },
                ]"
                state="lang"
            >
                <template v-slot:label>{{t('languageStudying')}}</template>
                <template v-slot:field-error>
                    <div class="field-error">Please select a languageStudying.</div>
                </template>
            </CustomSelect>
            <CustomSelect
                v-model="v_level"
                :options="[
                    {
                        name: '0',
                        value: '0',
                    },
                    {
                        name: '1',
                        value: '1',
                    },
                    {
                        name: '2',
                        value: '2',
                    },
                    {
                        name: '3',
                        value: '3',
                    },
                    {
                        name: '4',
                        value: '4',
                    },
                    {
                        name: '5',
                        value: '5',
                    },
                    {
                        name: '6',
                        value: '6',
                    },
                    {
                        name: '7',
                        value: '7',
                    },
                    {
                        name: '8',
                        value: '8',
                    },
                    {
                        name: '9',
                        value: '9',
                    },
                    {
                        name: '10',
                        value: '10',
                    },
                ]"
                state="level"
            >
                <template v-slot:label>{{t('level')}}</template>
            </CustomSelect>
            <FileInput v-model="v_file"></FileInput>
            <div class="space-y-4">
                <button class="custom-button-link" @click="updateUserData">{{t('confirm')}}</button>
                <button @click="closeConfirmModal" class="custom-button-link">{{t('cancel')}}</button>
            </div>
        </Modal>
    </teleport>
</template>

<script lang="ts" setup>
import { useMainStore } from 'store/main';
import { UserDataArrayOfObj, UserData } from 'types/helperTypes'
import { v4 as uuidv4  } from "uuid";

const { t } = useI18n({useScope: 'local'});
const store = useMainStore();
const config = useRuntimeConfig();

const activeModalAction = ref<string>('');
const filePath = ref<string>('');
const currentItemOriginal = ref<UserData>({});
// v-models
const v_level = ref<string>('0');
const v_languageStudying = ref<string>('en');
const v_itemType = ref<string>('');
const v_newItemType = ref<string>('')
const v_itemTypeCategory = ref<string>('');
const v_newItemTypeCategory = ref<string>('')
const v_item = ref<string>('');
const v_itemID = ref<string>('');
const v_itemCorrect = ref<string>('');
const v_file = ref<Object>({});
const v_itemTranscription = ref<string>('');
//

// select lists
const itemType = computed<{ name: string, value: string }[]>(() => store.userLangData
    .filter(el => el.languageStudying === v_languageStudying.value)
    .map(el => el.itemType)
    .filter((value, index, self) => self.indexOf(value) === index)
    .map(el => {
        return {name: el, value: el}
    })
)
const itemTypeCategory = computed<{ name: string, value: string }[]>(() => store.userLangData
    .filter(el => el.languageStudying === v_languageStudying.value)
    .filter(el => el.itemType === v_itemType.value)
    .map(el => el.itemTypeCategory)
    .filter((value, index, self) => self.indexOf(value) === index)
    .map(el => {
        return {name: el, value: el}
    })
)
//

onMounted(() => {
    console.log('store.userLangData', store.userLangData);
})

// watch(() => itemType, (v) => {
//     console.log('itemType', v.value);
// }, {deep: true});

// watch(() => itemTypeCategory, (v) => {
//     console.log('itemTypeCategory', v.value);
// }, {deep: true});


const closeConfirmModal = (): void => {
    console.log('closeConfirmModal');
    store.setModalOpen(false);
    store.setModalType('');

    v_level.value = '0';
    v_languageStudying.value = 'en';
    v_itemType.value = '';
    v_newItemType.value = '';
    v_itemTypeCategory.value = '';
    v_newItemTypeCategory.value = '';
    v_item.value = '';
    v_itemID.value = '';
    v_itemCorrect.value = '';
    v_itemTranscription.value = '';
    v_file.value = {};
    currentItemOriginal.value = {};
}

const openConfirmModal = (item: UserData | null, action: string):void => {
    console.log('action', action);
    console.log('item', item);

    store.setModalOpen(true);
    store.setModalType(action);
    activeModalAction.value = action;

    if (item) {
        currentItemOriginal.value = item;
        v_level.value = item.level;
        v_languageStudying.value = item.languageStudying;
        v_itemType.value = item.itemType;
        v_itemTypeCategory.value = item.itemTypeCategory;
        v_item.value = item.item;
        v_itemID.value = item.itemID
        v_itemCorrect.value = item.itemCorrect;
        if (item.itemTranscription) v_itemTranscription.value = item.itemTranscription;
        if (item.filePath) {
            filePath.value = item.filePath
        } else {
            filePath.value = '';
        }
    }
}

// GET API (in this component for update UI after put/update/delete API calls)
const getUserData = async () => {
    const res = await fetch(`${config.public.apiUrl}/${config.public.envName}/study-items?user=${store.currentUserName}`).then(el => el.json())
    if (res.data && res.data.length) {
        store.setUserLangData(res.data);
    }
}

// DELETE API
const deleteUserData = async () => {
    const res = await fetch(`${config.public.apiUrl}/${config.public.envName}/study-items`, {
        method: 'DELETE',
        body: JSON.stringify([
            {
                "user": store.currentUserName,
                "itemID": v_itemID.value,
                ...(filePath.value && { "filePath": filePath.value }),
            }
        ])
    })
    .then(res => {
        res.json()
        getUserData()
        // update FE without API call
        // const newArr: UserDataArrayOfObj = store.userLangData.filter(el => el.itemID !== v_itemID.value);
        // console.log('newArr', newArr);
        // store.setUserLangData(newArr);
        closeConfirmModal();
    });
    console.log('res_DELETE API', res);
}

// POST API
const addUserData = async () => {
    if (!v_level.value || !v_languageStudying.value || !v_itemType.value || !v_itemTypeCategory.value || !v_item.value || !v_itemCorrect.value) {
        return;
    }

    const payload = new FormData();
    payload.append('item', v_item.value);
    payload.append('user', store.currentUserName);
    payload.append('itemID', v_item.value.replaceAll(" ", "_") + "___" + uuidv4());

    payload.append('itemCorrect', v_itemCorrect.value);
    payload.append('itemType', v_itemType.value === 'addNew' ? v_newItemType.value : v_itemType.value);
    payload.append('itemTypeCategory', v_itemTypeCategory.value === 'addNew' ? v_newItemTypeCategory.value : v_itemTypeCategory.value);

    payload.append('languageMortherTongue', store.userLangData[0].languageMortherTongue);
    payload.append('languageStudying', v_languageStudying.value);
    payload.append('level', v_level.value);


    if (v_itemTranscription.value) {
        payload.append('itemTranscription', v_itemTranscription.value);
    }

    if (v_file.value?.name) {
        payload.append('file', v_file.value);
    }

    console.log('payload', payload);
    const res = await fetch(`${config.public.apiUrl}/${config.public.envName}/study-items`, {
        method: 'POST',
        body: payload,
    })
    .then(res => {
        res.json()
        getUserData();
        // update FE without API call
        // const newArr: UserDataArrayOfObj = store.userLangData.slice();
        // newArr.push(payload[0])
        // console.log('newArr', newArr);
        // store.setUserLangData(newArr);
        closeConfirmModal();
    });
    console.log('res_POST API', res);
}

// PUT API
const updateUserData = async () => {
    const payload = new FormData();
    payload.append('item', v_item.value);
    payload.append('user', store.currentUserName);
    payload.append('itemID', v_itemID.value);

    let anyChanges: boolean = false;
    if (currentItemOriginal.value['level'] !== v_level.value) {
        anyChanges = true;
        payload.append('level', v_level.value);
    }
    if (currentItemOriginal.value['languageStudying'] !== v_languageStudying.value) {
        anyChanges = true;
        payload.append('languageStudying', v_languageStudying.value);
    }

    const itemTypeKey = v_itemType.value === 'addNew' ? v_newItemType.value : v_itemType.value;
    if (currentItemOriginal.value['itemType'] !== itemTypeKey) {
        anyChanges = true;
        payload.append('itemType', itemTypeKey);
    }

    const itemTypeCatKey = v_itemTypeCategory.value === 'addNew' ? v_newItemTypeCategory.value : v_itemTypeCategory.value;
    if (currentItemOriginal.value['itemTypeCategory'] !== itemTypeCatKey) {
        anyChanges = true;
        payload.append('itemTypeCategory', itemTypeCatKey);
    }

    if (currentItemOriginal.value['itemCorrect'] !== v_itemCorrect.value) {
        anyChanges = true;
        payload.append('itemCorrect', v_itemCorrect.value);
    }

    if (currentItemOriginal.value['itemTranscription'] !== v_itemTranscription.value) {
        anyChanges = true;
        payload.append('itemTranscription', v_itemTranscription.value);
    }

    if (v_file.value?.name) {
        anyChanges = true;
        payload.append('file', v_file.value);
    }

    console.log('anyChanges', anyChanges);
    if (anyChanges) {
        const res = await fetch(`${config.public.apiUrl}/${config.public.envName}/study-items`, {
            method: 'PUT',
            body: payload,
        })
        .then(res => {
            res.json();
            getUserData();
            closeConfirmModal();
        });
        console.log('res_PUT API', res);
    }

    // update FE without API call
    // const newArr: UserDataArrayOfObj = store.userLangData.map(el => {
    //     if (el.itemID === v_itemID.value) {
    //         el.level = v_level.value;
    //         el.languageStudying = v_languageStudying.value;
    //         el.itemType = v_itemType.value;
    //         el.itemTypeCategory = v_itemTypeCategory.value;
    //         el.item = v_item.value;
    //         el.itemCorrect = v_itemCorrect.value;

    //         return el;
    //     } else {
    //         return el;
    //     }
    // });
    // console.log('newArr', newArr);
    // store.setUserLangData(newArr);
}

watch(v_languageStudying, function() {
    console.log('v_languageStudying', v_languageStudying.value);
});

watch(v_file, function() {
    console.log('v_file1', v_file.value);
});
</script>


<style lang="scss">

.modal-delete-item,
.modal-update-item,
.modal-add-item {
    .modal-content {
        @apply space-y-4;
    }
}

.modal-delete-item {
    ul {
        @apply space-y-4;

        li {
            @apply flex flex-col md:flex-row;

            span:nth-child(2) {
                @apply flex-1 font-bold;
            }
        }
    }
}

.listOfWords {
    @apply overflow-x-auto w-[calc(100vw-1.25rem-1.25rem)];

    h1 {
        @apply text-2xl my-3 text-center;
    }

    ul {
        @apply flex border-b border-mainGreen w-full;

        li {
            @apply flex flex-col justify-center text-xs flex-1 px-2 py-2 bg-yellow-50;

            &.listOfWords-btn--delete {
                @apply flex-grow-0 bg-red-500 text-black px-0 py-0;

                button {
                    @apply w-full h-full px-2 py-2;
                }
            }

            &.listOfWords-btn--update {
                @apply flex-grow-0 bg-yellow-500 text-black;

                button {
                    @apply w-full h-full px-2 py-2;
                }
            }

            &.listOfWords-languageStudying {
                @apply flex-grow-0;
            }

            &.listOfWords-item {
                @apply min-w-[9.5rem];

                .listOfWords-item--audio {
                    @apply self-center flex items-center space-x-2;
                }
            }

            &.listOfWords-itemCorrect {
                @apply min-w-[9.5rem];
            }

            &.listOfWords-itemType {
                @apply min-w-[5.5rem];
            }

            &.listOfWords-itemTypeCategory {
                @apply min-w-[8.5rem];
            }

            &.listOfWords-addNewItem {
                @apply bg-mainGreen w-full;

                button {
                    @apply w-full h-full px-2 py-2 text-white text-base;
                }
            }

            span {
                &:nth-child(2) {
                    @apply font-bold break-all;
                }
            }

            &.lastLi {
                @apply flex-1 min-w-[5.5rem] max-w-[5.5rem];
            }
        }

        // borders
        &:first-of-type {
            li {
                @apply border-t border-t-mainGreen;
            }
        }

        li:first-child {
            @apply border-l border-l-mainGreen;
        }

        li {
            @apply border-r border-r-mainGreen;
        }
        //
    }
}

</style>


<i18n lang="yaml">
    en:
        listOfWords: 'A list my words'
        modalTitle: '{activeModalAction} word/sentence:'
        item: 'Word/sentence'
        itemTranscription: 'Transcription'
        optional: 'Optional'
        audio: 'Audio'
        itemCorrect: 'Correct translation'
        addNew: 'Add'
        itemType: 'Category'
        newItemType: 'New item type'
        itemTypeCategory: 'Sub-category'
        newItemTypeCategory: 'New sub-category'
        languageStudying: 'Language'
        level: 'My level'
        addNewItem: 'Add new item'
        add: 'Add'
        update: 'Update'
        delete: 'Delete'
        confirm: 'Confirm'
        cancel: 'Cancel'
    ru:
        listOfWords: 'Список моих слов/предложений'
        modalTitle: '{activeModalAction} слово/предложение:'
        item: 'Слово/предложение'
        itemTranscription: 'Транскрипт'
        optional: 'Необязательно'
        audio: 'Аудио'
        itemCorrect: 'Правильный ответ'
        addNew: 'Добавить'
        itemType: 'Категория'
        newItemType: 'Новая категория'
        itemTypeCategory: 'Сабкатегория'
        newItemTypeCategory: 'Новая сабкатегория'
        languageStudying: 'Язык'
        level: 'Мой уровень'
        addNewItem: 'Добавить новое слово/предложение'
        add: 'Добавить'
        update: 'Обновить'
        delete: 'Удалить'
        confirm: 'Подтвердить'
        cancel: 'Отменить'
    zh:
        listOfWords: 'TBD'
        modalTitle: 'TBD'
        item: 'TBD'
        itemTranscription: 'TBD'
        optional: 'TBD'
        audio: 'Audio'
        itemCorrect: 'TBD'
        addNew: 'TBD'
        itemType: 'TBD'
        newItemType: 'TBD'
        itemTypeCategory: 'TBD'
        newItemTypeCategory: 'TBD'
        languageStudying: 'TBD'
        level: 'TBD'
        addNewItem: 'TBD'
        add: 'TBD'
        update: 'TBD'
        delete: 'TBD'
        confirm: 'TBD'
        cancel: 'TBD'
</i18n>
