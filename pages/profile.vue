<template>
    <template v-if="store.userLangData">
        <h1>A list my words:</h1>
        <ul v-for="(el, i) of store.userLangData" :key="i" class="flex justify-center border-b border-cyan-600 w-full space-x-8">
            <li class="flex flex-col">
                <span>level:</span>
                <span>{{ el.level }}</span>
            </li>
            <li class="flex flex-col">
                <span>languageStudying:</span>
                <span>{{ el.languageStudying }}</span>
            </li>
            <li class="flex flex-col">
                <span>itemType:</span>
                <span>{{ el.itemType }}</span>
            </li>
            <li class="flex flex-col">
                <span>itemTypeCategory:</span>
                <span>{{ el.itemTypeCategory }}</span>
            </li>
            <li class="flex flex-col">
                <span>item:</span>
                <span>{{ el.item }}</span>
            </li>
            <li class="flex flex-col">
                <span>itemCorrect:</span>
                <span>{{ el.itemCorrect }}</span>
            </li>
            <button type="button" @click="() => openConfirmModal(el, 'delete')" class="bg-red-500">Delete</button>
            <button type="button" @click="() => openConfirmModal(el, 'update')" class="bg-yellow-500">Update</button>
        </ul>
        <button @click="() => openConfirmModal(null, 'add')" class="bg-green-500">Add new item</button>
    </template>

    <teleport to="body">
        <Modal v-if="store.modalOpen && store.modalType === 'delete'" @closeCallback="closeConfirmModal">
            <h2>Are you sure you want to {{ activeModalAction }} the following item?</h2>
                <ul>
                    <li>Item: {{v_item}}</li>
                    <li>Correct translation: {{v_itemCorrect}}</li>
                    <li>Item type{{v_itemType}}</li>
                    <li>Item type category: {{v_itemTypeCategory}}</li>
                    <li>Level: {{v_level}}</li>
                </ul>
            <div class="flex">
                <button class="custom-button-link" @click="deleteUserData">Yes</button>
                <button @click="closeConfirmModal" class="custom-button-link">No</button>
            </div>
        </Modal>

        <Modal v-if="store.modalOpen && store.modalType === 'add'" @closeCallback="closeConfirmModal">
            <h2>Please {{ activeModalAction }} the new item below:</h2>
                <div class="form_el">
                    <span>level:</span>
                    <select v-model="v_level">
                        <option>0</option>
                        <option>1</option>
                        <option>2</option>
                        <option>3</option>
                        <option>4</option>
                        <option>5</option>
                        <option>6</option>
                        <option>7</option>
                        <option>8</option>
                        <option>9</option>
                        <option>10</option>
                    </select>
                </div>
                <div class="form_el">
                    <label>languageStudying:</label>
                    <input type="text" v-model="v_languageStudying"/>
                </div>
                <div class="form_el">
                    <label>itemType:</label>
                    <input type="text" v-model="v_itemType" />
                </div>
                <div class="form_el">
                    <label>itemTypeCategory:</label>
                    <input type="text" v-model="v_itemTypeCategory" />
                </div>
                <div class="form_el">
                    <label>item:</label>
                    <input type="text" v-model="v_item" />
                </div>
                <div class="form_el">
                    <label>itemCorrect:</label>
                    <input type="text" v-model="v_itemCorrect" />
                </div>
            <div class="flex">
                <button class="custom-button-link" @click="addUserData">Yes</button>
                <button @click="closeConfirmModal" class="custom-button-link">No</button>
            </div>
        </Modal>

        <Modal v-if="store.modalOpen && store.modalType === 'update'" @closeCallback="closeConfirmModal">
            <h2>Please {{ activeModalAction }} the new item below:</h2>
                <div class="form_el">
                    <span>level:</span>
                    <select v-model="v_level">
                        <option>0</option>
                        <option>1</option>
                        <option>2</option>
                        <option>3</option>
                        <option>4</option>
                        <option>5</option>
                        <option>6</option>
                        <option>7</option>
                        <option>8</option>
                        <option>9</option>
                        <option>10</option>
                    </select>
                </div>
                <div class="form_el">
                    <label>languageStudying:</label>
                    <input type="text" v-model="v_languageStudying"/>
                </div>
                <div class="form_el">
                    <label>itemType:</label>
                    <input type="text" v-model="v_itemType" />
                </div>
                <div class="form_el">
                    <label>itemTypeCategory:</label>
                    <input type="text" v-model="v_itemTypeCategory" />
                </div>
                <div class="form_el">
                    <label>item:</label>
                    <input type="text" v-model="v_item" />
                </div>
                <div class="form_el">
                    <label>itemCorrect:</label>
                    <input type="text" v-model="v_itemCorrect" />
                </div>
            <div class="flex">
                <button class="custom-button-link" @click="updateUserData">Yes</button>
                <button @click="closeConfirmModal" class="custom-button-link">No</button>
            </div>
        </Modal>
    </teleport>
</template>

<script lang="ts" setup>
import { useMainStore } from 'store/main';
import { ArrayOfUserData, UserData } from 'types/helperTypes'
import { v4 as uuidv4  } from "uuid";

const store = useMainStore();
const config = useRuntimeConfig();

const activeModalAction = ref<string>('');
// v-models
const v_level = ref<string>('0');
const v_languageStudying = ref<string>('');
const v_itemType = ref<string>('');
const v_itemTypeCategory = ref<string>('');
const v_item = ref<string>('');
const v_itemID = ref<string>('');
const v_itemCorrect = ref<string>('');
// 

const closeConfirmModal = (): void => {
    store.setModalOpen(false); 
    store.setModalType('');

    v_level.value = '0';
    v_languageStudying.value = '';
    v_itemType.value = '';
    v_itemTypeCategory.value = '';
    v_item.value = '';
    v_itemID.value = '';
    v_itemCorrect.value = '';
}

const openConfirmModal = (item: UserData | null, action: string):void => {    
    store.setModalOpen(true);
    store.setModalType(action);
    activeModalAction.value = action;

    if (item) {
        v_level.value = item.level;
        v_languageStudying.value = item.languageStudying;
        v_itemType.value = item.itemType;
        v_itemTypeCategory.value = item.itemTypeCategory;
        v_item.value = item.item;
        v_itemCorrect.value = item.itemCorrect;
        v_itemID.value = item.itemID
    }
}

// DELETE API
const deleteUserData = async () => {
       const res = await fetch(`${config.public.apiUrl}/${config.public.envName}/study-items?user=${store.currentUserName}`, {
        method: 'DELETE',
        body: JSON.stringify([
            {
                "user": store.currentUserName, 
                "itemID": v_itemID.value
            }
        ])
    })
    .then(res => res.json());
    console.log('res', res);

    // update FE
    const newArr: ArrayOfUserData = store.userLangData.filter(el => el.itemID !== v_itemID.value);
    console.log('newArr', newArr);
    store.setUserLangData(newArr);
    closeConfirmModal();
}

// POST API
const addUserData = async () => {
    if (!v_level.value || !v_languageStudying.value || !v_itemType.value || !v_itemTypeCategory.value || !v_item.value || !v_itemCorrect.value) {
        return;
    }

    const payload = [
        {
            "user": store.currentUserName, 
            "itemID": v_item.value + "___" + uuidv4(),
            "item": v_item.value,
            "itemCorrect": v_itemCorrect.value,
            "itemType": v_itemType.value,
            "itemTypeCategory": v_itemTypeCategory.value,
            "languageMortherTongue": store.userLangData[0].languageMortherTongue,
            "languageStudying": v_languageStudying.value,
            "level": v_level.value
        }
    ]

    const res = await fetch(`${config.public.apiUrl}/${config.public.envName}/study-items?user=${store.currentUserName}`, {
        method: 'POST',
        body: JSON.stringify(payload)
    })
    .then(res => res.json());
    console.log('res', res);

    // update FE
    const newArr: ArrayOfUserData = store.userLangData.slice();
    newArr.push(payload[0])
    console.log('newArr', newArr);
    store.setUserLangData(newArr);
    closeConfirmModal();
}

// PUT API
const updateUserData = async () => {
    console.log('v_level', v_level.value);
    console.log('store', store.userLangData.filter(el => el.level === v_level.value));
    
    const payload = [
        {
            name: 'level',
            value: v_level.value
        },
        {
            name: 'languageStudying',
            value: v_languageStudying.value
        },
        {
            name: 'itemType',
            value: v_itemType.value
        },
        {
            name: 'itemTypeCategory',
            value: v_itemTypeCategory.value
        },
        {
            name: 'item',
            value: v_item.value
        },
        {
            name: 'itemCorrect',
            value: v_itemCorrect.value
        }
    ].map(el => {
        return  {
            "user": store.currentUserName,
            "itemID": v_itemID.value,
            "keyToUpdate": {
                "name": el.name,
                "value": el.value
            }
        }
    })

    console.log('payload', payload);
    

    const res = await fetch(`${config.public.apiUrl}/${config.public.envName}/study-items?user=${store.currentUserName}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
    })
    .then(res => res.json());
    console.log('res', res);

    // update FE
    const newArr: ArrayOfUserData = store.userLangData.map(el => {
        if (el.itemID === v_itemID.value) {
            el.level = v_level.value;
            el.languageStudying = v_languageStudying.value;
            el.itemType = v_itemType.value;
            el.itemTypeCategory = v_itemTypeCategory.value;
            el.item = v_item.value;
            el.itemCorrect = v_itemCorrect.value;

            return el;
        } else {
            return el;
        }
    });
    console.log('newArr', newArr);
    store.setUserLangData(newArr);
    closeConfirmModal();
}
</script>


<style lang="scss">

</style>

