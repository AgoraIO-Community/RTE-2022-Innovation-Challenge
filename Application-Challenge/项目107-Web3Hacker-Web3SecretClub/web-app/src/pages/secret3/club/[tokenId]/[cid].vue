<script setup lang="ts">
import * as ls from '~/helpers/ls'
import { litHelper } from '~/helpers/litHelper'
const litNodeClient = inject('litNodeClient')
const { walletAddress } = $(web3AuthStore())

const route = useRoute()
const tokenId = $computed(() => route.params.tokenId)
const cid = $computed(() => route.params.cid)
const { getJson } = $(useNFTStorage())

let item = $ref({})

let isUnlocking = $ref(false)
let errMsg = $ref('')
const doUnlock = async () => {
  if (isUnlocking) return

  const cachedKey = `decryptedString-${cid}`
  const data = ls.getItem(cachedKey, false)
  if (data) {
    item.unlockedContent = data
    return
  }

  errMsg = ''
  isUnlocking = true
  const { encryptedSymmetricKey, encryptedString, accessControlConditions } = item.content
  const chain = 'mumbai'
  const { doDecryptString } = await litHelper({ chain, walletAddress, litNodeClient })
  const { decryptedString, err } = await doDecryptString(encryptedSymmetricKey, encryptedString, accessControlConditions)
  isUnlocking = false
  if (err) {
    errMsg = err
    return
  }
  item.unlockedContent = decryptedString
  ls.setItem(cachedKey, decryptedString)
}

watchEffect(async () => {
  if (tokenId === '' || !cid) return

  item = await getJson(cid)

  if (!walletAddress) return
  await doUnlock()
})

const isOwner = $computed(() => {
  const is = walletAddress === item.createdBy
  console.log('====> is :', is)
  return is
})
</script>

<template>
  <article>
    <IpfsImg class="object-cover h-60 w-full" :src="item.banner" />
    <div class="bg-white  py-16 px-4 relative overflow-hidden">
      <div class="mx-auto  max-w-prose relative">
        <div class="text-lg">
          <h1>
            <span class="font-bold mt-2 text-center tracking-tight text-3xl text-gray-900 leading-8 block sm:tracking-tight sm:text-4xl">{{ item.title }}</span>
          </h1>
          <div class="flex pt-5 meta justify-between">
            <div>
              <span class="font-bold mr-2">Unlocked Minmum Token Number:</span>
              {{ item.itemUnlockMinimumTokenNumber }}
            </div>
            <div class="flex">
              <Secret3CreatedBy :address="item.createdBy" />
            </div>
          </div>
          <p class="mt-8 text-xl text-gray-500 leading-8">
            {{ item.intro }}
          </p>
        </div>
        <div class="mt-6 text-gray-500">
          <div v-if="item.unlockedContent">
            <Secret3Agora v-if="item.isLiveStream" v-model="item.unlockedContent" :is-owner="isOwner" />
            <MdPreview v-else :text="item.unlockedContent" />
          </div>
          <div v-else>
            <div class="border-dashed rounded-lg border-2 border-gray-300 text-center w-full p-12 relative block hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <btn-green :is-loading="isUnlocking" @click="doUnlock">
                Require you to mint at least {{ item.itemUnlockMinimumTokenNumber }} NFTs to decrypt the content!
              </btn-green>
              <Error v-model="errMsg" class="mt-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </article>
</template>

<route lang="yaml">
meta:
  layout: secret3
</route>
