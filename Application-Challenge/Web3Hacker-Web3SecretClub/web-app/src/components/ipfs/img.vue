<script setup lang="ts">
import { PhotographIcon } from '@heroicons/vue/solid'

interface Props {
  src?: string,
  hasModal?: Boolean
}
const {
  src,
  hasModal,
} = defineProps<Props>()

const theSrc = $computed(() => {
  if(!src) return ''
  return src.replace('ipfs://', 'https://nftstorage.link/ipfs/')
})

let isLoaded = $ref(false)
let isShow = $ref(false)
let isError = $ref(false)
setTimeout(() => {
  if (isLoaded) return
  isError = true
}, 5000);

</script>
<template>
  <div v-if="isError">
    <PhotographIcon v-bind="$attrs" />
  </div>
  <div v-else>
    <div v-if="!isLoaded" v-bind="$attrs" class="bg-black flex bg-opacity-75 justify-center items-center">
      <eos-icons:loading class="h-10 text-white w-10" />
    </div>
    <img :src="theSrc" v-bind="$attrs" v-else loading="lazy" @click="isShow=true" :class="hasModal ? 'hover:cursor-pointer' : ''" />
    <img :src="theSrc" @load="isLoaded = true" class="h-0 w-0" />
    <dialog-wide :show="isShow" @close="isShow=false" v-if="hasModal">
      <a :href="theSrc" target="_blank"><img :src="theSrc" class="w-auto" /></a>
    </dialog-wide>
  </div>
</template>
