<script setup>
import { useVModel } from '@vueuse/core'
import { cn } from '@/lib/utils'

const props = defineProps({
  defaultValue: { type: [String, Number], required: false },
  modelValue: { type: [String, Number], required: false },
  class: { type: null, required: false }
})

const emits = defineEmits(['update:modelValue'])

const modelValue = useVModel(props, 'modelValue', emits, {
  passive: true,
  defaultValue: props.defaultValue
})
</script>

<template>
  <select
    v-model="modelValue"
    :class="
      cn(
        'box-border bg-gray-50 rounded border border-black/10 px-2 py-1 leading-6 transition-all cursor-pointer hover:border-accent active:border-accent dark:bg-shark-900 dark:border-white/10 dark:hover:border-accent dark:active:border-accent disabled:cursor-not-allowed disabled:opacity-50 disabled:pointer-events-none',
        props.class
      )
    "
  >
    <slot />
  </select>
</template>
