<script setup>
import { useVModel } from '@vueuse/core'
import { cn } from '@/lib/utils'

const props = defineProps({
  defaultValue: { type: [String, Number], required: false },
  modelValue: { type: [String, Number], required: false },
  class: { type: null, required: false },
})

const emits = defineEmits(['update:modelValue'])

const modelValue = useVModel(props, 'modelValue', emits, {
  passive: true,
  defaultValue: props.defaultValue,
})
</script>

<template>
  <input v-model="modelValue"
    :class="cn('box-border bg-gray-50 rounded border border-black/10 px-2 py-1 leading-6 transition-all hover:border-accent active:border-accent dark:bg-shark-900 dark:border-white/10 dark:hover:border-accent dark:active:border-accent', props.class)" />
</template>
