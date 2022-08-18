<script setup lang="ts">
const { navigation, secondaryNavigation, user } = $(secret3Store())

import { DialogPanel } from '@headlessui/vue';
import {
  XIcon,
} from '@heroicons/vue/outline'

const emit = defineEmits(['update:show'])
interface Props {
  show: boolean
}
const {
  show,
} = defineProps<Props>()

</script>
<template>
  <TransitionRoot as="template" :show="show">
    <Dialog as="div" class="z-40 relative lg:hidden" @close="$emit('update:show', false)">
      <TransitionChild as="template" enter="transition-opacity ease-linear duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="transition-opacity ease-linear duration-300" leave-from="opacity-100" leave-to="opacity-0">
        <div class="bg-gray-600 bg-opacity-75 inset-0 fixed" />
      </TransitionChild>

      <div class="flex inset-0 z-40 fixed">
        <TransitionChild as="template" enter="transition ease-in-out duration-300 transform" enter-from="-translate-x-full" enter-to="translate-x-0" leave="transition ease-in-out duration-300 transform" leave-from="translate-x-0" leave-to="-translate-x-full">
          <DialogPanel class="bg-white flex flex-col max-w-xs flex-1 w-full relative focus:outline-none">
            <TransitionChild as="template" enter="ease-in-out duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in-out duration-300" leave-from="opacity-100" leave-to="opacity-0">
              <div class="-mr-12 pt-2 top-0 right-0 absolute">
                <button type="button" class="rounded-full flex h-10 ml-1 w-10 items-center justify-center focus:outline-none focus:ring-inset focus:ring-white focus:ring-2" @click="show = false">
                  <span class="sr-only">Close sidebar</span>
                  <XIcon class="h-6 text-white w-6" aria-hidden="true" />
                </button>
              </div>
            </TransitionChild>
            <div class="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div class="flex flex-shrink-0 px-4 items-center">
                <Secret3Logo />
              </div>
              <nav aria-label="Sidebar" class="mt-5">
                <div class="space-y-1 px-2">
                  <a v-for="item in navigation" :key="item.name" :href="item.href" :class="[item.current ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900', 'group flex items-center px-2 py-2 text-base font-medium rounded-md']" :aria-current="item.current ? 'page' : undefined">
                    <component :is="item.icon" :class="[item.current ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500', 'mr-4 h-6 w-6']" aria-hidden="true" />
                    {{ item.name }}
                  </a>
                </div>
                <hr class="border-t border-gray-200 my-5" aria-hidden="true" />
                <div class="space-y-1 px-2">
                  <a v-for="item in secondaryNavigation" :key="item.name" :href="item.href" class="rounded-md flex font-medium text-base py-2 px-2 text-gray-600 group items-center hover:bg-gray-50 hover:text-gray-900">
                    <component :is="item.icon" class="flex-shrink-0 h-6 mr-4 text-gray-400 w-6 group-hover:text-gray-500" aria-hidden="true" />
                    {{ item.name }}
                  </a>
                </div>
              </nav>
            </div>
            <div class="border-t flex border-gray-200 flex-shrink-0 p-4">
              <a href="#" class="flex-shrink-0 group block">
                <div class="flex items-center">
                  <div>
                    <img class="rounded-full h-10 w-10 inline-block" :src="user.imageUrl" alt="" />
                  </div>
                  <div class="ml-3">
                    <p class="font-medium text-base text-gray-700 group-hover:text-gray-900">
                      {{ user.name }}
                    </p>
                    <p class="font-medium text-sm text-gray-500 group-hover:text-gray-700">View profile</p>
                  </div>
                </div>
              </a>
            </div>
          </DialogPanel>
        </TransitionChild>
        <div class="flex-shrink-0 w-14" aria-hidden="true">
          <!-- Force sidebar to shrink to fit close icon -->
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>