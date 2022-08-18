<script setup lang="ts">
import { SearchIcon, FilterIcon, ChatIcon } from '@heroicons/vue/solid'
import { shortAddress, chatLink } from '~/helpers/web3'

interface Props {
  address?: string
}
const {
  address,
} = defineProps<Props>()

</script>
<template>
  <div class="font-bold mr-2">
    CreatedBy:
  </div>
  <div>
    <a class="flex text-black underline" target="_blank" :href="chatLink(address)">{{ shortAddress(address) }}
      <ChatIcon class="ml-1 w-6" />
    </a>
  </div>
</template>