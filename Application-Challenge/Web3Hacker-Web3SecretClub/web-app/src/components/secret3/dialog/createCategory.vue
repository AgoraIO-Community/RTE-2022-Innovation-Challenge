<script setup lang="ts">
import { parseEther } from '~/helpers/web3'
const { addSuccess } = $(notificationStore())
const { storeJson } = $(useNFTStorage())
const { dialogCreateCategoryShow, getMyOwnClub } = $(secret3Store())
const { initContract, getTxUrl, walletAddress } = $(web3AuthStore())

let title = $ref(`The Secret of Hackathon Drive Buidl`)
let intro = $ref(`Well, at here I want to share my experiences about how I buidl with web3 hackathon, aka HDB(Hackathon Drive Buidl)`)
let logo = $ref(``)
const basicPrice = $ref(`0.01`)
const inviteCommission = $ref(`1`)

let isLoading = $ref(false)
let error = $ref('')
const doSubmit = async () => {
  if (isLoading) return

  error = ''
  isLoading = true
  let metadataCID = ''
  const metadata = {
    createdBy: walletAddress,
    title,
    intro,
    logo,
    basicPrice,
    inviteCommission,
  }
  metadataCID = await storeJson(metadata)

  try {
    const contractWriter = await initContract('Secret3', true)
    const value = parseEther('0.01')
    const _basicPrice = parseEther(basicPrice)
    const _inviteCommission = parseInt(inviteCommission) * 100 // inviteCommission / 10000 = xx%
    const tx = await contractWriter.createToken(_basicPrice, _inviteCommission, metadataCID, { value })
    const txUrl = getTxUrl(tx.hash)
    console.log('====> txUrl :', txUrl)
    await tx.wait()
  } catch (err) {
    error = err
    isLoading = false
    return
  }
 
  dialogCreateCategoryShow = false
  title = ''
  intro = ''
  logo = ''
  addSuccess('Submit success')
  await getMyOwnClub()
  setTimeout(() => {
    isLoading = false
  }, 1000)
}
</script>
<template>
  <DialogWide :show="dialogCreateCategoryShow" @close="dialogCreateCategoryShow = false">
    <div class="w-xl">
      <div class="mt-3 text-center sm:mt-5">
        <DialogTitle as="h3" class="font-medium text-lg text-gray-900 leading-6">
          Create your new web3 secret club
        </DialogTitle>
      </div>
      <Loading v-if="isLoading" class="h-50" />
      <div v-else class="divide-y space-y-8 divide-gray-200 p-5">
        <div class="divide-y space-y-8 divide-gray-200">
          <div>
            <div class="mt-6 grid gap-y-6 gap-x-4 grid-cols-1 sm:grid-cols-6">
              <FileUploaderThumbnail v-model="logo" title="Category Logo" class="sm:col-span-6" />
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
                <label for="basicPrice" class="font-medium text-sm text-gray-700 block"> Basic Price </label>
                <div class="mt-1">
                  <input id="basicPrice" v-model="basicPrice" type="text" name="basicPrice" autocomplete="basicPrice" class="rounded-md border-gray-300 shadow-sm w-full block sm:text-sm focus:border-indigo-500 focus:ring-indigo-500">
                </div>
                <p class="mt-2 text-xs text-gray-400">This is used for your fans to follow your club/buy a new item from your club's fee and calculate the price</p>
              </div>
              <div class="sm:col-span-6">
                <label for="inviteCommission" class="font-medium text-sm text-gray-700 block"> Invite Commission </label>
                <div class="mt-1">
                  <input id="inviteCommission" v-model="inviteCommission" type="text" name="inviteCommission" autocomplete="inviteCommission" class="rounded-md border-gray-300 shadow-sm w-full block sm:text-sm focus:border-indigo-500 focus:ring-indigo-500">
                </div>
                <p class="mt-2 text-xs text-gray-400">Anyone invite new club member for you will get the commission forever for the member's any club payment</p>
              </div>
            </div>
          </div>
        </div>
        <Error v-model="error" />
        <div class="pt-5">
          <div class="flex justify-end">
            <btn-plain @click="dialogCreateCategoryShow = false" class="mr-2">Cancel</btn-plain>
            <btn-black @click="doSubmit" :isLoading="isLoading">Submit</btn-black>
          </div>
        </div>
      </div>
    </div>
  </DialogWide>
</template>
