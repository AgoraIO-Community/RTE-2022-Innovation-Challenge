<template>
    <h-page :content="{ scrollY: false }">
        <h-back-btn class="icon back"></h-back-btn>
        <h-empty v-if="signinInfo === null"> 暂时无法登录 </h-empty>
        <h-view v-else class="login-form fcol cntx">
            <form ref="loginForm" novalidate class="fcol fcnt">
                <h1>链播</h1>
                <h5>做生活的导演</h5>
                <h-el class="input-row">
                    <h-input
                        type="text"
                        id="name"
                        name="name"
                        placeholder="请输入用户名"
                        maxLength="11"
                        v-model="d.username"
                    />
                </h-el>
                <h-el class="input-row">
                    <h-input
                        enterkeyhint="go"
                        @keydown.enter="tryLogin"
                        :type="d.showPwd ? 'text' : 'password'"
                        id="password"
                        name="password"
                        placeholder="请输入密码"
                        class="form-control"
                        maxLength="16"
                        v-model="d.password"
                    />
                </h-el>
                <h-btn
                    :disabled="hasErr"
                    class="btn btn-primary"
                    @click="tryLogin"
                >
                    <span class="btn-txt">登录</span>
                </h-btn>
            </form>
            <h-view class="org" v-if="signupInfo">
                <h-nav class="regist" url="/user/signup">注册账号</h-nav>
            </h-view>
        </h-view>
    </h-page>
</template>

<script lang="ts" setup>
import { useOverlay } from "@/common/overlay";
import { computed, reactive, watchEffect } from "vue";
import { useRoute } from "vue-router";
import { useLogin } from "../service/state";
const { login, signinInfo, signupInfo,  } = useLogin();
const overlay = useOverlay();

const d = reactive({
    idErr: true,
    pwErr: true,
    password: "",
    username: "",
    showPwd: false,
});

const hasErr = computed(() => d.idErr || d.pwErr);
watchEffect(() => {
    d.idErr = d.username.length < 4;
    d.pwErr = d.password.length < 4;
});
const refresh = (url = "/") => {
    location.href = url;
    setTimeout(() => {
        location.reload();
    }, 200);
};

const route = useRoute();
const to = route.query.to ? decodeURIComponent(route.query.to as any) : "";
const tryLogin = (ev: MouseEvent) => {
    if (hasErr.value) return;
    ev.preventDefault();
    login(d.username.trim(), d.password.trim())
        .then((res) => {
            // nav();
            refresh(to);
        })
        .catch((err) => {
            if (err === 403) {
                overlay.showWarn(`身份验证失败，请联系组织管理员！`);
            } else if (err.error === 401) {
                overlay.showWarn(`非客户端用户`);
            } else {
                overlay.showWarn("账号或密码错误");
            }
            console.error(err);
        });
};
</script>

<style scoped lang="scss">
.logo {
    margin-bottom: 8px;
    align-self: center;
    width: 62px;
    height: 62px;
    flex-shrink: 0;
}

h1 {
    margin: 0;
    font-size: 22px;
    color: #333333;
    line-height: 24px;
    font-weight: bold;
}

h5 {
    margin: 12px 0 60px;
    font-size: 12px;
    color: #999999;
    line-height: 12px;
}

.login-form {
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
        --padding-start: 8px;
        --padding-end: 8px;
    }

    --padding-start: 0;
    --inner-padding-end: 0;

    .icon.pwd {
        margin-left: 8px;
        width: 32px;
        height: 32px;

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
    margin: 20px 0 18px;
    border-radius: 4px;
    align-self: stretch;

    .btn-txt {
        font-family: PingFangSC-Regular;
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

.forget {
    align-self: flex-end;
    font-size: 14px;
    color: #999999;
    text-align: right;
    line-height: 16px;
    margin-top: 2px;
}

.btn[disabled] {
    opacity: 0.5;
}

.org {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 14px auto 24px;
    position: absolute;
    bottom: 0;

    .regist {
        font-size: 16px;
        color: #1368eb;
        margin-right: 28px;
    }

    .ge {
        width: 1px;
        height: 12px;
        background-color: #bbb;
    }

    .join {
        font-size: 16px;
        color: #1368eb;
        margin-left: 28px;
    }
}
</style>
