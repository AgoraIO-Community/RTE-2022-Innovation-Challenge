<template>
    <slot v-if="isNorm"></slot>
    <HLoginError v-else-if="showError">
    </HLoginError>
    <span v-else></span>
</template>

<script lang="ts" setup>
import { computed, } from "@vue/reactivity";
import { useMeteor } from "../common/meteor";
import { HLoginError } from "./base"
const props = defineProps<{ hide?: any }>()
const m = useMeteor()
const uid = m.wrapObservale$(m.userId$).refRef()
const isNorm = computed(() => {
    return !!uid.value
})
const showError = computed(() => props.hide === undefined)
</script>

<style lang="scss" scoped>
</style>
