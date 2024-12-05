<template>
    <div v-if="store.currentUserName" class="listOfWords">
        <h1>{{ t('listOfWords') }}</h1>
        <button type="button" class="custom-button-link px-4" @click="() => openConfirmModal(null, 'addSetOfItems')">{{ t('addSetOfItems') }}</button>
        <h2>{{ t('filterItems') }} &#8594;</h2>

        <ul v-if="userItemTypes.length > 1 || userLanguagesInProgress.length > 1">
            <li class="listOfWords-item" aria-hidden="true"></li>
            <li class="listOfWords-itemCorrect" aria-hidden="true"></li>
            <li class="listOfWords-itemType">
                <CustomSelect
                    v-if="userItemTypes.length > 1"
                    v-model="v_filterItemType"
                    :options="[
                        {
                            name: t('all'),
                            value: 'all'
                        },
                        ...userItemTypes,
                    ]"
                    state="table"
                    >
                    <template v-slot:label>{{t('itemType')}}</template>
                </CustomSelect>
            </li>
            <li class="listOfWords-itemTypeCategory" aria-hidden="true"></li>
            <li class="listOfWords-languageStudying">
                <CustomSelect
                    v-if="userLanguagesInProgress.length > 1"
                    v-model="v_filterLearningLang"
                    :options="userLanguagesInProgress"
                    state="table"
                    >
                    <template v-slot:label>{{t('languageStudying')}}</template>
                </CustomSelect>
            </li>
            <li class="listOfWords-level" aria-hidden="true"></li>
            <li class="lastLi" aria-hidden="true"></li>
            <li class="lastLi" aria-hidden="true"></li>
        </ul>

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
            <li class="listOfWords-level">
                <span>{{ t('level') }}:</span>
            </li>
            <li class="lastLi" aria-hidden="true"></li>
            <li class="lastLi" aria-hidden="true"></li>
        </ul>

        <ul 
            v-for="(el, i) of store.userLangData" 
            :key="i" 
            v-show="el.languageStudying === v_filterLearningLang && v_filterItemType === 'all' || el.itemType === v_filterItemType && el.languageStudying === v_filterLearningLang"
        >
            <li class="listOfWords-item">
                <span>{{ el.item }}</span>
                <span v-if="el.fileUrl" class="listOfWords-item--audio">
                    <span>{{ t('audio') }}:</span>
                    <AudioPlayer :file="el.fileUrl"></AudioPlayer>
                </span>
            </li>
            <li class="listOfWords-itemCorrect">
                <span>{{ el.itemCorrect }}</span>
            </li>
            <li class="listOfWords-itemType">
                <span>{{ el.itemType }}</span>
            </li>
            <li class="listOfWords-itemTypeCategory">
                <span>{{ el.itemTypeCategory }}</span>
            </li>
            <li class="listOfWords-languageStudying">
                <span>{{ el.languageStudying }}</span>
            </li>
            <li class="listOfWords-level">
                <span>{{ el.level }}</span>
            </li>
            <li class="listOfWords-btn--delete lastLi">
                <button type="button" @click="() => openConfirmModal(el, 'delete')">{{ t('delete') }}</button>
            </li>
            <li class="listOfWords-btn--update lastLi">
                <button type="button" @click="() => openConfirmModal(el, 'update')">{{ t('update') }}</button>
            </li>
        </ul>
        <ul>
            <li  class="listOfWords-addNewItem">
                <button @click="() => openConfirmModal(null, 'add')">{{ t('addNewItem') }}</button>
            </li>
        </ul>
    </div>

    <teleport to="body">
        <Modal v-if="store.modalOpen && store.modalType === 'delete'" @closeCallback="closeConfirmModal" class="modal-delete-item">
            <h2>{{ t('modalTitle', { activeModalAction: t(activeModalAction) }) }}</h2>
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

        <Modal v-if="store.modalOpen && store.modalType === 'add'" @closeCallback="closeConfirmModal" class="modal-add-item">
            <h2>{{ t('modalTitle', { activeModalAction: t(activeModalAction) }) }}</h2>
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

        <Modal v-if="store.modalOpen && store.modalType === 'update'" @closeCallback="closeConfirmModal" class="modal-update-item">
            <h2>{{ t('modalTitle', { activeModalAction: t(activeModalAction) }) }}</h2>
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
            <div class="form_el">
                <label>{{t('itemType')}}</label>
                <input type="text" v-model="v_itemType" />
            </div>
            <div class="form_el">
                <label>{{t('itemTypeCategory')}}</label>
                <input type="text" v-model="v_itemTypeCategory" />
            </div>
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

        <Modal v-if="store.modalOpen && store.modalType === 'addSetOfItems'" @closeCallback="closeConfirmModal" class="modal-addSetOfItems">
            <h2 id="addSetOfItemsTitle">{{ t('addSetOfItemsTitle') }}</h2>
            <CustomSelect
                class="my-3"
                v-model="v_languageStudying"
                :options="[
                    {
                        name: 'English',
                        value: 'en',
                    },
                    {
                        name: 'Russian',
                        value: 'ru',
                    },
                    {
                        name: 'Chinese',
                        value: 'zh',
                    },
                    {
                        name: 'Spanish',
                        value: 'es',
                    },
                ]"
                state="lang"
            >
                <template v-slot:label>{{t('languageStudying')}}</template>
                <template v-slot:field-error>
                    <div class="field-error">Please select a languageStudying.</div>
                </template>
            </CustomSelect>

            <div class="my-3 flex flex-col">
                <label for="numberOfItems">{{ t('numberOfItems') }}</label>
                <input type="number" name="numberOfItems" id="numberOfItems" v-model="v_numberOfItems" min="2" max="20" class="w-32 text-center border-2 border-mainGreen shadow-lg p-1">
            </div>

            <label for="addSetOfItems" class="sr-only">{{ t('addSetOfItemsTitle') }}</label>
            <textarea 
                name="addSetOfItems" 
                id="addSetOfItems" 
                v-model="v_addSetOfItemsByDescription"
                aria-labelledby="addSetOfItemsTitle"
                class="w-full border-2 border-mainGreen shadow-lg my-3 p-2 lg:p-3 resize-none"
                maxlength="100"
            ></textarea>
            <div v-if="errorMsg" class="field-error">{{ errorMsg }}</div>
            <div class="space-y-4">
                <button class="custom-button-link" @click="addSetOfItems">{{t('confirm')}}</button>
                <button @click="closeConfirmModal" class="custom-button-link">{{t('cancel')}}</button>
            </div>
        </Modal>
    </teleport>
</template>

<script lang="ts" setup>
import { useMainStore } from 'store/main';
import { UserData } from 'types/helperTypes'
import { v4 as uuidv4  } from "uuid";
import { mapLanguage } from 'helper/helpers';

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

const v_addSetOfItemsByDescription = ref<string>('');
const v_numberOfItems = ref<string>('10');

// v-models for filtering items
const v_filterLearningLang = ref<string>('');
const v_filterItemType = ref<string>('all');
//

const errorMsg = ref<string>('');

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

// rework these
const userLanguagesInProgress = computed<{ name: string, value: string }[]>(() => store.userLangData.reduce(function (accumulator:string[], currentValue:UserData) {
    if (!accumulator.includes(currentValue.languageStudying)){
        accumulator.push(currentValue.languageStudying)
    }
    return accumulator
    }, [])
    .map(el => {
        return {name: mapLanguage(el), value: el}
    })
)

const userItemTypes = computed<{ name: string, value: string }[]>(() => store.userLangData.reduce(function (accumulator:string[], currentValue:UserData) {
    if (!accumulator.includes(currentValue.itemType) && currentValue.languageStudying === v_filterLearningLang.value) {
        accumulator.push(currentValue.itemType)
    }
    return accumulator
    }, [])
    .map(el => {
        return {name: el, value: el}
    })
)
//

onMounted(() => {
    if (store.userLangData[0]) {
        v_filterLearningLang.value = store.userLangData[0].languageStudying;
    } 
    
    if (!store.currentUserName) {
        navigateTo('/');
    }
})

// Reset Category to "all" when swithing items of different languages 
watch(() => v_filterLearningLang.value, () => {    
    v_filterItemType.value = 'all';
});


const closeConfirmModal = (): void => {
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

const addSetOfItems = async () => {
    console.log('v_addSetOfItemsByDescription', v_addSetOfItemsByDescription.value);
    console.log('userMotherTongue',  store.userMotherTongue);
    console.log('v_languageStudying', v_languageStudying.value);
    console.log('v_numberOfItems', v_numberOfItems.value);

    if (!v_addSetOfItemsByDescription.value || v_addSetOfItemsByDescription.value.length > 100 || !store.userMotherTongue || !v_languageStudying.value || !v_numberOfItems.value || Number(v_numberOfItems.value) > 20) {
        return
    }

    store.setLoading(true);
    const resaddSetOfItems = await fetch(`${config.public.API_URL_DATA}/${config.public.ENV_NAME}/data-ai-generated`, {
        method: 'POST',
        body: JSON.stringify({
            prompt: v_addSetOfItemsByDescription.value,
            userMotherTongue: store.userMotherTongue,
            languageStudying: v_languageStudying.value,
            numberOfItems: v_numberOfItems.value
        }),
        headers: {
            "Authorization": `Bearer ${store.token}`
        }
    })
    .then(res => res.json())
    .catch(err => {
        console.log('err addSetOfItems API:', err);
    })
    .finally(() => {
        store.setLoading(false);
    });

    console.log('resaddSetOfItems', resaddSetOfItems);
    if (resaddSetOfItems.success) {
        getUserData();
        closeConfirmModal();
    } else {
        errorMsg.value = resaddSetOfItems.message;
    }
}

// GET API (in this component for update UI after put/update/delete API calls)
const getUserData = async () => {
    store.setLoading(true);
    const res = await fetch(`${config.public.API_URL_DATA}/${config.public.ENV_NAME}/data`, {
        headers: {
            "Authorization": `Bearer ${store.token}`
        }
    })
    .then(el => el.json())
    .catch(err => console.log(err))
    .finally(() => {
        store.setLoading(false);
    });

    // if (res.success && res.data && res.data.length) {
    if (res.success) {
        store.setUserLangData(res.data);
    }
}

// DELETE API
const deleteUserData = async () => {
    store.setLoading(true);
    const resDeleteApi = await fetch(`${config.public.API_URL_DATA}/${config.public.ENV_NAME}/data`, {
        method: 'DELETE',
        body: JSON.stringify({
            "itemID": v_itemID.value,
            ...(filePath.value && { "filePath": filePath.value }),
        }),
        headers: {
            "Authorization": `Bearer ${store.token}`
        }
    })
    .then(res => res.json())
    .catch(err => {
        console.log('err DELETE API:', err);
    })
    .finally(() => {
        store.setLoading(false);
    });

    if (resDeleteApi.success) {
        // update FE without API call
        getUserData()
        closeConfirmModal();
    }
}

// POST API
const addUserData = async () => {
    // validate empty
    if (!v_level.value || !v_languageStudying.value || !v_itemType.value || !v_itemTypeCategory.value || !v_item.value || !v_itemCorrect.value) {
        return;
    }

    // validate length
    if (v_level.value.length > 100 || v_languageStudying.value.length > 100  || v_itemType.value.length > 100  || v_itemTypeCategory.value.length > 100  || v_item.value.length > 100 || v_itemCorrect.value.length > 100 ) {
        return;
    }

    const payload = new FormData();
    payload.append('item', v_item.value);
    payload.append('itemID', v_item.value.replaceAll(" ", "_") + "___" + uuidv4());

    payload.append('itemCorrect', v_itemCorrect.value);
    payload.append('itemType', v_itemType.value === 'addNew' ? v_newItemType.value : v_itemType.value);
    payload.append('itemTypeCategory', v_itemTypeCategory.value === 'addNew' ? v_newItemTypeCategory.value : v_itemTypeCategory.value);

    payload.append('userMotherTongue', store.userMotherTongue);
    payload.append('languageStudying', v_languageStudying.value);
    payload.append('level', v_level.value);


    if (v_itemTranscription.value) {
        payload.append('itemTranscription', v_itemTranscription.value);
    }

    if (v_file.value?.name) {
        payload.append('file', v_file.value);
    }

    store.setLoading(true);
    const resPostApi = await fetch(`${config.public.API_URL_DATA}/${config.public.ENV_NAME}/data`, {
        method: 'POST',
        body: payload,
        headers: {
            "Authorization": `Bearer ${store.token}`
        }
    })
    .then(res => res.json())
    .catch(err => {
        console.log('err DELETE API:', err);
    })
    .finally(() => {
        store.setLoading(false);
    });

    if (resPostApi.success) {
        getUserData()
        closeConfirmModal();
    }
}

// PUT API
const updateUserData = async () => {
    const payload = new FormData();
    payload.append('item', v_item.value);
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

    if (anyChanges) {
        store.setLoading(true);
        const resPutApi = await fetch(`${config.public.API_URL_DATA}/${config.public.ENV_NAME}/data`, {
            method: 'PUT',
            body: payload,
            headers: {
                "Authorization": `Bearer ${store.token}`
            }
        })
        .then(res => res.json())
        .catch(err => {
            console.log('err DELETE API:', err);
        })
        .finally(() => {
            store.setLoading(false);
        })

        if (resPutApi.success) {
            getUserData()
            closeConfirmModal();
        }
    }
}
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

    &::-webkit-scrollbar {
        @apply w-3;
    };

    &::-webkit-scrollbar-track {
        box-shadow: inset 0 0 12px rgba(0, 0, 0, 0.3);
    }

    &::-webkit-scrollbar-thumb {
        @apply bg-gray-400;
    }

    h1 {
        @apply text-2xl my-3 text-center;
    }

    ul {
        @apply flex border-b border-mainGreen w-full;

        li {
            @apply flex flex-col justify-center text-xs flex-1 px-2 py-0.5 bg-yellow-50;

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
                @apply flex-grow-0 min-w-[6.6875rem];
            }

            &.listOfWords-level {
                @apply min-w-[4.025rem];
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
                @apply min-w-[7.5rem];
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
        addSetOfItems: 'Add a set of items.'
        addSetOfItemsTitle: 'Describe what you would like to add, and the AI will add (up to 10 at a time) a set of words/sentences from your request. For example: "I want to learn modal verbs"'
        numberOfItems: "Enter Number of items you'd like to add"
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
        filterItems: 'Filter'
        level: 'My level'
        addNewItem: 'Add new item'
        add: 'Add'
        update: 'Update'
        delete: 'Delete'
        confirm: 'Confirm'
        cancel: 'Cancel'
        all: 'All'
    ru:
        listOfWords: 'Список моих слов/предложений'
        addSetOfItems: 'Добавить целый раздел/тему.'
        addSetOfItemsTitle: 'Опишите, что бы вы хотели добавить, и ИИ добавит (до 10 штук за один раз) набор слов/предложений из Вашего запроса. Например: «Я хочу выучить модальные глаголы»'
        numberOfItems: "Введите количество, которые вы хотели бы добавить"
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
        filterItems: 'Фильтр'
        level: 'Мой уровень'
        addNewItem: 'Добавить новое слово/предложение'
        add: 'Добавить'
        update: 'Обновить'
        delete: 'Удалить'
        confirm: 'Подтвердить'
        cancel: 'Отменить'
        all: 'Все'
    zh:
        listOfWords: '我的詞彙表'
        addSetOfItems: '添加一组项目'
        addSetOfItemsTitle: '描述您想要添加的内容，AI 会根据您的请求添加（一次最多 10 个）一组单词/句子。例如：“我想学习情态动词”'
        numberOfItems: "输入您要添加的商品数量"
        modalTitle: '{activeModalAction} 詞語/句子:'
        item: '詞語/句子'
        itemTranscription: '音標'
        optional: '選修的'
        audio: '音訊'
        itemCorrect: '正確翻譯'
        addNew: '新增'
        itemType: '類別'
        newItemType: '新增類別'
        itemTypeCategory: '子類別'
        newItemTypeCategory: '新增子類別'
        languageStudying: '語言'
        filterItems: '筛选'
        level: '我的程度'
        addNewItem: '新增詞語/句子'
        add: '新增'
        update: '更新'
        delete: '刪除'
        confirm: '確認'
        cancel: '取消'
        all: '都'
</i18n>
