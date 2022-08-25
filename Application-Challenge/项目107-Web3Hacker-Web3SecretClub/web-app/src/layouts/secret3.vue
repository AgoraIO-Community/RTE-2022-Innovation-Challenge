<script setup lang="ts">
const { sidebarOpen } = $(secret3Store())

const {
  initWeb3,
  removeWeb3EventListener,
} = $(web3AuthStore())

onMounted(initWeb3)
onUnmounted(removeWeb3EventListener)
</script>
<template>
  <div class="flex h-full w-full">
    <Secret3MobileSidebar :show="sidebarOpen" />
    <Secret3Sidebar />

    <div class="flex flex-col flex-1 min-w-0 overflow-hidden">
      <Secret3MobileHeader />
      <div class="flex flex-1 z-0 relative overflow-hidden">
        <main class="flex-1 z-0 relative overflow-y-auto xl:order-last focus:outline-none">
          <Secret3MobileSubmenu />
          <router-view />
        </main>
        <Secret3Items />
      </div>
    </div>
    <Secret3DialogCreateCategory />
    <Secret3DialogCreateItem />
  </div>
  <NotificationDefault />
  <LoginModal />
  <OnboardModal />
  <ChainSwitchModal />
</template>
