<script setup lang="ts">
interface Props {
  cid?: string
  club?: Object
}
const {
  cid,
  club
} = defineProps<Props>()

const { getJson } = $(useNFTStorage());
const item = $ref({})

watchEffect(async () => {
  if (!cid) return
  item = await getJson(cid)
})
const theCid = $computed(() => cid?.replace('ipfs://', ''))

</script>
<template>
  <router-link :to="`/club/${club.tokenId}/${theCid}`" class="flex space-x-3 py-5 px-6 relative items-center hover:bg-gray-50 focus-within:ring-inset focus-within:ring-2 focus-within:ring-pink-500">
    <div class="flex-shrink-0">
      <IpfsImg :src="item.banner" class="rounded-full h-10 w-10" />
    </div>
    <div class="flex-1 min-w-0">
      <span class="inset-0 absolute" aria-hidden="true" />
      <p class="font-medium text-sm text-gray-900">
        {{ item.title }}
      </p>
      <p class="text-sm text-gray-500 truncate">
        {{ item.intro }}
      </p>
    </div>
    <div>
      {{ item.itemUnlockMinimumTokenNumber }}
    </div>
  </router-link>
</template>