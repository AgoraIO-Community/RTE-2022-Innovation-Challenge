<template>
    <h-page :content="{ scrollY: false, fullscreen: true }">
        <h-back-btn class="icon back"></h-back-btn>
        <h-empty v-if="!signupInfo">抱歉，暂时无法注册</h-empty>
        <h-view v-else class="form-container fcol cntx">
            <form novalidate class="fcol cntx">
                <h1>注册帐号</h1>
                <h-el class="input-row">
                    <h-input
                        type="tel"
                        id="name"
                        ref="phone"
                        name="name"
                        placeholder="请输入帐号"
                        v-model.trim="d.username"
                        maxLength="11"
                    />
                </h-el>
                <h-el class="input-row">
                    <h-input
                        type="password"
                        placeholder="请输入新密码"
                        maxlength="16"
                        v-model="d.password"
                    />
                </h-el>
                <h-el class="input-row">
                    <h-input
                        type="password"
                        placeholder="再次输入密码"
                        maxlength="16"
                        enterkeyhint="go"
                        @keydown.enter="trySignup"
                        v-model="d.password2"
                    />
                </h-el>
                <h-btn
                    :disabled="hasErr"
                    class="btn btn-primary"
                    @click="trySignup"
                >
                    <h-txt class="btn-txt">注册</h-txt>
                </h-btn>
            </form>
        </h-view>
    </h-page>
</template>

<script lang="ts" setup>
import { useOverlay } from "@/common/overlay";

import { useIonRouter } from "@ionic/vue";
import { computed, reactive } from "vue";
import { useLogin } from "../service/state";
const d = reactive({
    username: "",
    password: "",
    password2: "",
    left: 0,
});
const { signup, signupInfo } = useLogin();

const pwdOk = computed(
    () =>
        d.password.length >= 4 &&
        d.password.length < 17 &&
        d.password === d.password2
);
const unameOk = computed(() => d.username.length >= 4);

const hasErr = computed(() => !unameOk.value || !pwdOk.value);
const router = useIonRouter();
const overlay = useOverlay();

const trySignup = async (ev: MouseEvent) => {
    ev.preventDefault();
    if (!unameOk.value) {
        return overlay.showWarn(`用户名太短,最少四位`);
    }
    if (!pwdOk.value) {
        return overlay.showWarn(`请检查密码，最少四位`);
    }
    signup({ username: d.username.trim(), password: d.password.trim() }).then(
        () => {
            router.back();
        }
    );
};
</script>

<style scoped lang="scss">
.logo {
    margin-bottom: 8px;
    align-self: center;
    width: 62px;
    height: 62px;
    background: #d8d8d8;
    flex-shrink: 0;
}

h1 {
    margin: 0;
    font-size: 22px;
    color: #333333;
    line-height: 24px;
    font-weight: bold;
    text-align: left;
    margin-bottom: 84px;
}

.form-container {
    height: 100vh;
    padding: 0 32px;
}

.input-row {
    position: relative;
    width: 100%;
    margin-bottom: 8px;

    ion-input {
        --padding-top: 16px;
        --padding-bottom: 16px;
    }

    --padding-start: 0;
    --inner-padding-end: 0;

    .get-code {
        position: absolute;
        right: 0;
        font-size: 16px;
        color: #4593fa;
        line-height: 20px;
        z-index: 3;

        &.disable {
            color: rgb(114, 108, 108);
        }
    }

    .icon {
        &.end {
            width: 32px;
            height: 32px;
            margin-left: 8px;
        }

        &:not(.opened) {
            .opened {
                display: none;
            }
        }

        &.opened {
            .closed {
                display: none;
            }
        }
    }
}

.btn {
    margin: 24px 0 18px;
    width: 100%;

    .btn-txt {
        font-size: 18px;
        color: #ffffff;
        text-align: center;
        line-height: 24px;
        letter-spacing: 2px;
    }
}

.back {
    position: absolute;
    top: 28px;
    left: 12px;
    width: 28px;
    height: 28px;
}

.slide-fade-enter-active {
    transition: all 0.5s ease-out;
}

.slide-fade-leave-active {
    transition: all 0.5s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from {
    transform: translateX(-50vw);
}

.slide-fade-leave-to {
    transform: translateX(50vw);
    opacity: 0;
}
</style>
