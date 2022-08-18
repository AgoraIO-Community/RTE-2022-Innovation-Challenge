<script setup lang="ts">
import { ChevronLeftIcon } from '@heroicons/vue/solid'

const emit = defineEmits(['update:modelValue'])
interface Props {
  modelValue?: string
}
const {
  modelValue,
} = defineProps<Props>()

</script>
<template>
  <nav class="flex py-3 px-4 items-start sm:px-6 lg:px-8 xl:hidden" aria-label="Breadcrumb">
    <a href="#" class="font-medium space-x-3 text-sm text-gray-900 inline-flex items-center">
      <ChevronLeftIcon class="h-5 -ml-2 text-gray-400 w-5" aria-hidden="true" />
      <span>Category name</span>
    </a>
  </nav>
</template>