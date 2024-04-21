<script setup>
import { buttonVariants } from '.'
import { cn } from '@/lib/utils'

const props = defineProps({
  variant: { type: null, required: false },
  size: { type: null, required: false },
  class: { type: null, required: false },
  type: { type: String, required: false, default: 'button' }
})
</script>

<template>
  <button :class="cn(buttonVariants({ variant, size }), props.class)" :type="type">
    <slot />
  </button>
</template>
