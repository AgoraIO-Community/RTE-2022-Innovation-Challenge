<script setup lang="ts">
interface Props {
  item?: Object
}
const {
  item,
} = defineProps<Props>()

const { getClubInfo } = $(secret3Store())

watchEffect(async () => {
  if (!item.cid || item.title) return
  await getClubInfo(item)
})
</script>
<template>
  <router-link :to="`/club/${item.tokenId}`" :class="[item.current ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900', 'group flex items-center px-2 py-2 text-sm font-medium rounded-md']" :aria-current="item.current ? 'page' : undefined">
    <IpfsImg :src="item.logo" class="rounded-full object-cover flex-shrink-0 h-6 mr-3 text-gray-400 w-6 group-hover:text-gray-500" />
    {{item.title}}
  </router-link>
</template>