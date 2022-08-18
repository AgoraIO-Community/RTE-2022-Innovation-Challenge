<script setup lang="ts">
import { litHelper } from '~/helpers/litHelper'
const litNodeClient = inject('litNodeClient')

const route = useRoute()
const tokenId = $computed(() => route.params.tokenId)

const { addSuccess } = $(notificationStore())
const { storeJson } = $(useNFTStorage())
const { dialogCreateItemShow, getClubItems } = $(secret3Store())
const { initContract, getTxUrl, walletAddress, getContractAddress } = $(web3AuthStore())

let title = $ref('Your secret club item title')
let intro = $ref('My First secret club item!')
const nftContract = $ref('0x83b06d09b99ad2641dd9b1132e8ce8809b623433')
const nftNumber = $ref('1')
let banner = $ref('')
const content = $ref('The secret content you want to encrypt in the token item that requires your reader to mint at least itemUnlockMinimumTokenNumber of current ERC1155 tokens to unlock the content. ')
const itemUnlockMinimumTokenNumber = $ref('10')

let isLoading = $ref(false)
let error = $ref('')
const doSubmit = async() => {
  if (isLoading) return

  isLoading = true
  const chain = 'mumbai'
  const { doEncryptedString } = await litHelper({ chain, walletAddress, litNodeClient })
  const contractAddress = getContractAddress('Secret3')
  const accessControlConditions = [{
    contractAddress,
    standardContractType: 'ERC1155',
    chain,
    method: 'balanceOf',
    parameters: [
      ':userAddress',
      tokenId,
    ],
    returnValueTest: {
      comparator: '>=',
      value: itemUnlockMinimumTokenNumber,
    },
  }]
  if (nftContract) {
    accessControlConditions.push({ operator: 'and' })
    accessControlConditions.push({
      contractAddress: nftContract,
      standardContractType: 'ERC721',
      chain,
      method: 'balanceOf',
      parameters: [
        ':userAddress',
      ],
      returnValueTest: {
        comparator: '>=',
        value: nftNumber,
      },
    })
  }

  const {
    encryptedString,
    encryptedSymmetricKey,
  } = await doEncryptedString(content, accessControlConditions)

  let itemCID = ''
  const data = {
    title,
    intro,
    banner,
    createdBy: walletAddress,
    content: {
      encryptedString,
      encryptedSymmetricKey,
      accessControlConditions,
    },
    itemUnlockMinimumTokenNumber,
  }
  itemCID = await storeJson(data)
  console.log('====> itemCID :', itemCID)
  try {
    const contractWriter = await initContract('Secret3', true)
    const tx = await contractWriter.addTokenItem(tokenId, itemCID)
    const txUrl = getTxUrl(tx.hash)
    console.log('====> txUrl :', txUrl)
    await tx.wait()
  }
  catch (err) {
    error = err.message
    isLoading = false
    return
  }

  dialogCreateItemShow = false
  title = ''
  intro = ''
  banner = ''
  addSuccess('Submit success')
  await getClubItems(tokenId)
  setTimeout(() => {
    isLoading = false
  }, 1000)
}
</script>
<template>
  <DialogWide :show="dialogCreateItemShow" @close="dialogCreateItemShow = false">
    <div class="w-xl">
      <div class="mt-3 text-center sm:mt-5">
        <DialogTitle as="h3" class="font-medium text-lg text-gray-900 leading-6">
          Create your new web3 secret club item
        </DialogTitle>
      </div>
      <Loading v-if="isLoading" class="h-50" />
      <div v-else class="divide-y space-y-8 divide-gray-200 p-5">
        <div class="divide-y space-y-8 divide-gray-200">
          <div>
            <div class="mt-6 grid gap-y-6 gap-x-4 grid-cols-1 sm:grid-cols-6">
              <FileUploaderBanner v-model="banner" title="Item Banner" class="sm:col-span-6" />
              <div class="sm:col-span-6">
                <label for="title" class="font-medium text-sm text-gray-700 block"> Title </label>
                <div class="mt-1">
                  <input id="title" v-model="title" type="text" name="title" autocomplete="title" class="rounded-md border-gray-300 shadow-sm w-full block sm:text-sm focus:border-indigo-500 focus:ring-indigo-500">
                </div>
              </div>
              <div class="sm:col-span-6">
                <label for="intro" class="font-medium text-sm text-gray-700 block"> Intro </label>
                <div class="mt-1">
                  <textarea id="intro" v-model="intro" name="intro" rows="2" class="border rounded-md border-gray-300 shadow-sm w-full p-4 block sm:text-sm focus:border-indigo-500 focus:ring-indigo-500" />
                </div>
              </div>
              <div class="sm:col-span-6">
                <label for="itemUnlockMinimumTokenNumber" class="font-medium text-sm text-gray-700 block"> Item Unlock Minimum token number </label>
                <div class="mt-1">
                  <input id="itemUnlockMinimumTokenNumber" v-model="itemUnlockMinimumTokenNumber" type="text" name="itemUnlockMinimumTokenNumber" autocomplete="itemUnlockMinimumTokenNumber" class="rounded-md border-gray-300 shadow-sm w-full block sm:text-sm focus:border-indigo-500 focus:ring-indigo-500">
                </div>
                <p class="mt-2 text-xs text-gray-400">
                  Your fans requires have at least the number of club ERC1155 NFT tokens in their wallet to unlock the content item
                </p>
              </div>
              <div class="sm:col-span-6">
                <label for="nftContract" class="font-medium text-sm text-gray-700 block"> ERC721 NFT Contract </label>
                <div class="flex mt-1">
                  <input id="nftNumber" v-model="nftNumber" type="text" name="nftNumber" autocomplete="nftNumber" class="rounded-md border-gray-300 shadow-sm mr-2 w-20 block sm:text-sm focus:border-indigo-500 focus:ring-indigo-500">
                  <input id="nftContract" v-model="nftContract" type="text" name="nftContract" autocomplete="nftContract" class="rounded-md border-gray-300 flex-1 shadow-sm w-full block sm:text-sm focus:border-indigo-500 focus:ring-indigo-500" placeholder="Your ERC721 contract address">
                </div>
                <p class="mt-2 text-xs text-gray-400">
                  Your fans requires have at least the number of the ERC721 NFT in their wallet to unlock the content item
                </p>
              </div>
              <div class="sm:col-span-6">
                <label for="name" class="font-medium text-sm text-gray-700 block">Encrypted Content</label>
                <div class="flex mt-1 w-full">
                  <EditorDefault v-model="content" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="pt-5">
          <div class="flex justify-end">
            <btn-plain class="mr-2" @click="dialogCreateItemShow = false">
              Cancel
            </btn-plain>
            <btn-black :is-loading="isLoading" @click="doSubmit">
              Submit
            </btn-black>
          </div>
        </div>
      </div>
    </div>
  </DialogWide>
</template>
