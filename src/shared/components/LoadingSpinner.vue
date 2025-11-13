<template>
  <div class="flex justify-center items-center" :class="containerClass">
    <div
      class="animate-spin rounded-full border-b-2"
      :class="sizeClass"
      :style="{ borderColor: borderColor }"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'white'
  fullScreen?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  color: 'primary',
  fullScreen: false
})

const sizeClass = computed(() => {
  return {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  }[props.size]
})

const borderColor = computed(() => {
  return {
    primary: 'var(--primary-color)',
    white: 'var(--white-color)'
  }[props.color]
})

const containerClass = computed(() => {
  return props.fullScreen ? 'h-screen' : 'py-8'
})
</script>
