<script setup lang="ts">
import {
  MenuIcon,
} from '@heroicons/vue/outline'
const emit = defineEmits(['update:modelValue'])
interface Props {
  modelValue?: string
}
const {
  modelValue,
} = defineProps<Props>()

const {
  sidebarOpen,
} = $(secret3Store())
</script>
<template>
  <div class="lg:hidden">
    <div class="border-b flex bg-gray-50 border-gray-200 py-1.5 px-4 items-center justify-between">
      <div class="flex items-center">
        <Secret3Logo />
      </div>
      <div>
        <button type="button" class="rounded-md h-12 -mr-3 text-gray-500 w-12 inline-flex items-center justify-center hover:text-gray-900 focus:outline-none focus:ring-inset focus:ring-2 focus:ring-pink-600" @click="sidebarOpen = true">
          <span class="sr-only">Open sidebar</span>
          <MenuIcon class="h-6 w-6" aria-hidden="true" />
        </button>
      </div>
    </div>
  </div>
</template>