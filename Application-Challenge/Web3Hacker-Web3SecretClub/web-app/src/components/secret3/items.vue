<script setup lang="ts">
import { useClipboard } from '@vueuse/core'

const route = useRoute()
const tokenId = $computed(() => route.params.tokenId)
const { storeJson } = $(useNFTStorage())
const { addSuccess } = $(notificationStore())

const { walletAddress, userData, initContract, parseEther } = $(web3AuthStore())
const { name, avatar } = $(userData)
const {
  getClubItems,
  dialogCreateItemShow,
  navigation,
  secondaryNavigation,
  items,
} = $(secret3Store())

watchEffect(async() => {
  if (tokenId === '') return
  await getClubItems(tokenId)
})

onUnmounted(() => {
  items = []
})

const clubInfo = $computed(() => {
  if (tokenId === '') return {}
  const index = navigation.findIndex(item => item.tokenId === tokenId)
  if (index !== -1) return navigation[index]
  const index2 = secondaryNavigation.findIndex(item => item.tokenId.toString() === tokenId)
  if (index2 !== -1) return secondaryNavigation[index2]
  return {}
})
const isOwner = $computed(() => clubInfo.createdBy === walletAddress)

const updateBalance = async() => {
  const contractReader = await initContract('Secret3')
  myClubTokenCount = await contractReader.balanceOf(walletAddress, tokenId)
}

const showInviteDialog = $ref(false)
let showMintDialog = $ref(false)
let mintAmount = $ref(1)
const updateMintAmount = (delta) => {
  if (mintAmount === 1 && delta === -1)
    return

  mintAmount += delta
}

let isMinting = $ref(false)
const doMint = async() => {
  if (isMinting) return

  isMinting = true
  const contractWriter = await initContract('Secret3', true)

  const data = {
    author: walletAddress,
    avatar,
    name,
    amount: mintAmount,
    tokenId,
  }
  const metadataCID = await storeJson(data)
  const value = parseEther(clubInfo.basicPrice).mul(mintAmount)
  const tx = await contractWriter.mintNFT(tokenId, mintAmount, metadataCID, { value })
  await tx.wait()
  isMinting = false
  showMintDialog = false
  addSuccess('Mint Success!')
  mintAmount = 1
  await updateBalance()
}
let refLink = $ref('')
const { copy, copied } = useClipboard()
let myClubTokenCount = $ref(0)

watchEffect(async() => {
  if (tokenId === '') return
  if (!walletAddress) return

  refLink = `${location.origin}${location.pathname}?ref=${walletAddress}`

  await updateBalance()
})
</script>
<template>
  <aside class="border-r border-gray-200 flex-shrink-0 w-96 hidden xl:flex xl:flex-col xl:order-first">
    <div class="px-6 pt-6 pb-4">
      <div class="flex pb-6 justify-between">
        <IpfsImg :src="clubInfo.logo" class="rounded-md flex-1 mr-2 w-full" />
        <div class="w-50">
          <h2 class="font-medium text-lg text-gray-900">
            {{ clubInfo.title }}
          </h2>
          <p class="mt-1 text-sm text-gray-600">
            {{ clubInfo.intro }}
          </p>
        </div>
      </div>
      <div v-show="isOwner" class="border-t flex border-gray-200 py-6 justify-between items-center">
        <div>
          Admin:
        </div>
        <btn-black @click="dialogCreateItemShow = true">
          Add item
        </btn-black>
      </div>
      <div class="border-t space-y-2 border-gray-200 py-6">
        <div class="flex justify-start">
          <Secret3CreatedBy :address="clubInfo.createdBy" />
        </div>
        <div class="flex justify-start">
          <div class="font-bold mr-2">
            TokenId:
          </div>
          <div>
            {{ clubInfo.tokenId }}
          </div>
        </div>
        <div class="flex justify-start">
          <div class="font-bold mr-2">
            Basic Price:
          </div>
          <div>
            {{ clubInfo.basicPrice }}
          </div>
        </div>
        <div class="flex justify-start items-center">
          <div class="font-bold mr-2">
            Invite Commission:
          </div>
          <div class="flex flex-1 justify-between items-center">
            <div>{{ clubInfo.inviteCommission }}%</div>
            <btn-black @click="showInviteDialog = true">
              Invite
            </btn-black>
          </div>
        </div>
        <div class="flex justify-start items-center">
          <div class="font-bold mr-2">
            My Club Tokens:
          </div>
          <div class="flex flex-1 justify-between items-center">
            <div>{{ myClubTokenCount }}</div>
            <btn-green @click="showMintDialog = true">
              Mint !
            </btn-green>
          </div>
        </div>
      </div>
    </div>
    <nav class="border-t border-gray-200 flex-1 min-h-0 overflow-y-auto" aria-label="Directory">
      <div class="relative">
        <ul role="list" class="divide-y divide-gray-200 z-0 relative">
          <li v-for="cid in items" :key="cid">
            <Secret3Item :cid="cid" :club="clubInfo" />
          </li>
        </ul>
      </div>
    </nav>
    <DialogDefault :show="showInviteDialog" @close="showInviteDialog = false">
      <div class="flex flex-col">
        <h2 class="font-bold text-center mb-2">
          Invite to Earn
        </h2>
        <p class="mb-2 p-2">
          Copy the link below and share to your friends, any of your friend mint NFT by your link, you get rewards!
        </p>
        <input id="refLink" type="text" name="refLink" autocomplete="refLink" class="rounded-none rounded-r-md border-gray-300 flex-1 w-full min-w-0 block sm:text-sm focus:border-indigo-500 focus:ring-indigo-500" :value="refLink" disabled>
        <div v-show="copied" class="text-center py-2 text-green-400">
          Copy successed
        </div>
        <btn-black class=" mx-auto mt-2 w-30" @click="copy(refLink)">
          Copy
        </btn-black>
      </div>
    </DialogDefault>
    <DialogDefault :show="showMintDialog" @close="showMintDialog = false">
      <div>
        <h2 class="font-bold text-center mb-2">
          Mint Token
        </h2>
        <Loading v-if="isMinting" class="h-20" />
        <div v-else class="flex flex-col">
          <div class="bg-transparent rounded-lg flex flex-row h-10 mt-1  relative">
            <button data-action="decrement" class="rounded-l cursor-pointer h-full outline-none bg-gray-300 text-gray-600 w-20 hover:bg-gray-400 hover:text-gray-700" @click="updateMintAmount(-1)">
              <span class="font-thin m-auto text-2xl">−</span>
            </button>
            <input v-model="mintAmount" type="number" class="flex font-semibold outline-none bg-gray-300 text-center text-md w-full text-gray-700 items-center  md:text-basecursor-default hover:text-black focus:outline-none focus:text-black  " name="custom-input-number">
            <button data-action="increment" class="rounded-r cursor-pointer h-full bg-gray-300 text-gray-600 w-20 hover:bg-gray-400 hover:text-gray-700" @click="updateMintAmount(1)">
              <span class="font-thin m-auto text-2xl">+</span>
            </button>
          </div>
          <btn-black class=" mx-auto mt-2 w-30" @click="doMint">
            Mint
          </btn-black>
        </div>
      </div>
    </DialogDefault>
  </aside>
</template>
