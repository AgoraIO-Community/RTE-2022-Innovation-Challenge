<script setup lang="ts">
const route = useRoute()
const tokenId = $computed(() => route.params.tokenId)

const { getClubInfo } = $(secret3Store())

watchEffect(async() => {
  if (!tokenId) return

  await getClubInfo(tokenId)
})
</script>

<template>
  <div class="flex h-full w-full px-10 justify-center items-center">
    <div class="border-dashed rounded-lg border-2 border-gray-300 text-center w-full p-12 relative block hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
      <svg class="mx-auto h-12 text-gray-400 w-12" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 14v20c0 4.418 7.163 8 16 8 1.381 0 2.721-.087 4-.252M8 14c0 4.418 7.163 8 16 8s16-3.582 16-8M8 14c0-4.418 7.163-8 16-8s16 3.582 16 8m0 0v14m0-4c0 4.418-7.163 8-16 8S8 28.418 8 24m32 10v6m0 0v6m0-6h6m-6 0h-6" />
      </svg>
      <span class="font-medium mt-2 text-sm text-gray-900 block"> Select any of the item on the left</span>
    </div>
  </div>
</template>

<route lang="yaml">
meta:
  layout: secret3
</route>
