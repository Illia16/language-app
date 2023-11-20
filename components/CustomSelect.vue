<template>
	<div ref="customSelectRef" :class="[`select-input select-input-${state}`]">
		<span class="select-input-label">
			<slot name="label" />
		</span>
		<div class="custom-select">
			<div
				:class="['custom-select-container', { open: isOpen }]"
				@blur="closeSelect">
				<button
					@click="isOpen = !isOpen"
					type="button"
					:disabled="isDisabled">
					<span v-if="modelValue">{{ options?.map(el => el.value === modelValue && el.name).filter(el=>el)[0] }}</span>
					<span v-else class="sr-only">Select a state</span>
				</button>
				<div class="custom-select-options">
					<button
						v-for="(option, i) of options"
						:key="option.name + '_' + i"
						:value="option.value"
						type="button"
						@click="(e) => handleSelect(e)"
						@keypress="(e) => handleSelect(e)">
						{{ option.name }}
					</button>
					<!-- <slot name="addNew" /> -->
				</div>
			</div>
		</div>
		<slot name="field-error" />
	</div>
</template>

<script lang="ts" setup>
import { PropType } from 'vue'
const emit = defineEmits(['update:modelValue']);
const props = defineProps({
	modelValue: String,
	options: Array as PropType<{ name: string, value: string }[]>,
    state: {
        type: String,
    },
    isDisabled: {
        default: false,
        type: Boolean,
    }
});

const customSelectRef = ref<HTMLElement>(null);
const isOpen = ref<boolean>(false);

const handleSelect = (e: Event):void => {	
	emit('update:modelValue', (e.target as HTMLButtonElement).value)
	isOpen.value = false;
}

const clickOutside = (e: Event):void => {
	if (!customSelectRef.value.contains(e.target as HTMLElement)) isOpen.value = false;
}

onMounted(() => {
	document.addEventListener('mousedown', clickOutside);
})

onBeforeUnmount(() => {
	document.removeEventListener('mousedown', clickOutside);
})
</script>

<style lang="scss">
.custom-select {
	.custom-select-container {
		@apply relative border border-solid border-black;

		&::after {
			@apply absolute right-2 top-[calc(30px/2-24px/2)] text-mainGreen rotate-180 content-['\25B2'];
		}

		> button {
			@apply flex items-center h-[30px] w-full px-2 bg-white;

			&:disabled {
				@apply bg-gray-200;
			}
		}

		.custom-select-options {
			@apply hidden;
		}

		&.open {
			> button {
				@apply border border-b-0 border-solid;
			}

			&::after {
				@apply content-['\25B2'] rotate-0;
			}

			.custom-select-options {
				@apply absolute top-9 left-0 z-40 block max-h-72 w-full overflow-y-scroll border-2 border-solid border-mainGreen bg-white;

				button {
					@apply flex w-full items-center border-0 px-2 py-1 text-left;

					&:hover,
					&:focus {
						@apply text-white;
						background-image: linear-gradient(
							50deg,
							#219f7a 0%,
							#348a49 100%,
							#219f7a 100%
						);
					}
				}

				&::-webkit-scrollbar {
					@apply mr-1 w-1.5 bg-transparent p-3 rounded;
				}
				&::-webkit-scrollbar-thumb {
					@apply relative h-auto w-auto border border-white bg-mainGreen rounded;
					background-clip: content-box;
					border-radius: 3px;
					border: 1px solid white;
					border-left: none;
				}
				scrollbar-color: #219f7a transparent;
				&::-webkit-scrollbar-track-piece {
					@apply hidden;
				}

			}
		}
	}

	& + .field-error {
		@apply hidden;
	}
}
</style>
