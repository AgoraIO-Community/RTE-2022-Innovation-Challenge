<script setup lang="ts">
import {  MailIcon, PhoneIcon } from '@heroicons/vue/solid'

const { 
  team,
  profile,
  tabs, } = $(secret3Store())
</script>

<template>
  <article>
    <div>
      <div>
        <img class="object-cover h-32 w-full lg:h-48" :src="profile.coverImageUrl" alt="" />
      </div>
      <div class="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div class="-mt-12 sm:flex sm:space-x-5 sm:-mt-16 sm:items-end">
          <div class="flex">
            <img class="rounded-full h-24 ring-white ring-4 w-24 sm:h-32 sm:w-32" :src="profile.imageUrl" alt="" />
          </div>
          <div class="mt-6 sm:flex sm:space-x-6 sm:flex-1 sm:min-w-0 sm:pb-1 sm:items-center sm:justify-end">
            <div class="flex-1 mt-6 min-w-0 sm:hidden 2xl:block">
              <h1 class="font-bold text-2xl text-gray-900 truncate">
                {{ profile.name }}
              </h1>
            </div>
            <div class="flex flex-col space-y-3 mt-6 justify-stretch sm:flex-row sm:space-y-0 sm:space-x-4">
              <button type="button" class="bg-white border rounded-md font-medium border-gray-300 shadow-sm text-sm py-2 px-4 text-gray-700 inline-flex justify-center hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500">
                <MailIcon class="h-5 mr-2 -ml-1 text-gray-400 w-5" aria-hidden="true" />
                <span>Message</span>
              </button>
              <button type="button" class="bg-white border rounded-md font-medium border-gray-300 shadow-sm text-sm py-2 px-4 text-gray-700 inline-flex justify-center hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500">
                <PhoneIcon class="h-5 mr-2 -ml-1 text-gray-400 w-5" aria-hidden="true" />
                <span>Call</span>
              </button>
            </div>
          </div>
        </div>
        <div class="flex-1 mt-6 min-w-0 hidden sm:block 2xl:hidden">
          <h1 class="font-bold text-2xl text-gray-900 truncate">
            {{ profile.name }}
          </h1>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="mt-6 sm:mt-2 2xl:mt-5">
      <div class="border-b border-gray-200">
        <div class="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <nav class="flex -mb-px space-x-8" aria-label="Tabs">
            <a v-for="tab in tabs" :key="tab.name" :href="tab.href" :class="[tab.current ? 'border-pink-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300', 'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm']" :aria-current="tab.current ? 'page' : undefined">
              {{ tab.name }}
            </a>
          </nav>
        </div>
      </div>
    </div>

    <!-- Description list -->
    <div class="mx-auto mt-6 max-w-5xl px-4 sm:px-6 lg:px-8">
      <dl class="grid gap-x-4 gap-y-8 grid-cols-1 sm:grid-cols-2">
        <div v-for="field in Object.keys(profile.fields)" :key="field" class="sm:col-span-1">
          <dt class="font-medium text-sm text-gray-500">
            {{ field }}
          </dt>
          <dd class="mt-1 text-sm text-gray-900">
            {{ profile.fields[field] }}
          </dd>
        </div>
        <div class="sm:col-span-2">
          <dt class="font-medium text-sm text-gray-500">About</dt>
          <dd class="max-w-prose space-y-5 mt-1 text-sm text-gray-900" v-html="profile.about" />
        </div>
      </dl>
    </div>

    <!-- Team member list -->
    <div class="mx-auto mt-8 max-w-5xl px-4 pb-12 sm:px-6 lg:px-8">
      <h2 class="font-medium text-sm text-gray-500">Team members</h2>
      <div class="mt-1 grid gap-4 grid-cols-1 sm:grid-cols-2">
        <div v-for="person in team" :key="person.handle" class="bg-white border rounded-lg flex space-x-3 border-gray-300 shadow-sm py-5 px-6 relative items-center hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-pink-500">
          <div class="flex-shrink-0">
            <img class="rounded-full h-10 w-10" :src="person.imageUrl" alt="" />
          </div>
          <div class="flex-1 min-w-0">
            <a href="#" class="focus:outline-none">
              <span class="inset-0 absolute" aria-hidden="true" />
              <p class="font-medium text-sm text-gray-900">
                {{ person.name }}
              </p>
              <p class="text-sm text-gray-500 truncate">
                {{ person.role }}
              </p>
            </a>
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

