<script setup lang="ts">
import {
  PlusCircleIcon,
} from '@heroicons/vue/outline'
const { navigation, secondaryNavigation, dialogCreateCategoryShow } = $(secret3Store())
</script>
<template>
  <div class="hidden lg:flex lg:flex-shrink-0">
    <div class="flex flex-col w-64">
      <!-- Sidebar component, swap this element with another sidebar if you like -->
      <div class="border-r flex flex-col bg-gray-100 border-gray-200 flex-1 min-h-0">
        <div class="flex flex-col flex-1 pt-5 pb-4 overflow-y-auto">
          <div class="flex flex-shrink-0 px-4 items-center">
            <Secret3Logo />
          </div>
          <nav class="flex-1 mt-5" aria-label="Sidebar">
            <div class="space-y-1 px-2">
              <button :class="['text-gray-600 hover:bg-gray-50 hover:text-gray-900 w-full', 'group flex items-center px-2 py-2 text-sm font-medium rounded-md']" @click="dialogCreateCategoryShow = true">
                <PlusCircleIcon :class="['text-gray-400 group-hover:text-gray-500', 'mr-3 flex-shrink-0 h-6 w-6']" aria-hidden="true" />
                Create new Club
              </button>
              <Secret3ClubItem v-for="item in navigation" :key="item.cid" :item="item" />
            </div>
            <hr class="border-t border-gray-200 my-5" aria-hidden="true">
            <div class="space-y-1 flex-1 px-2">
              <Secret3ClubItem v-for="item in secondaryNavigation" :key="item.cid" :item="item" />
            </div>
          </nav>
        </div>
        <!-- <div class="border-t flex border-gray-200 flex-shrink-0 p-4">
          <a href="#" class="flex-shrink-0 w-full group block">
            <div class="flex items-center">
              <div>
                <img class="rounded-full h-9 w-9 inline-block" :src="user.imageUrl" alt="" />
              </div>
              <div class="ml-3">
                <p class="font-medium text-sm text-gray-700 group-hover:text-gray-900">
                  {{ user.name }}
                </p>
                <p class="font-medium text-xs text-gray-500 group-hover:text-gray-700">View profile</p>
              </div>
            </div>
          </a>
        </div> -->
      </div>
    </div>
  </div>
</template>
