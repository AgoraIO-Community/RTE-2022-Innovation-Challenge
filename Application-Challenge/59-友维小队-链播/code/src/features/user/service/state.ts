import { useApi } from "@/common/api";
import { useOverlay } from "@/common/overlay";
import { useRouter } from "@/router";
import { computed, ref } from "vue";
import { ApiLink } from "../deps";

export const user = ref<
    undefined | { _id: string; profile: { name: string; avatar: string } }
>(undefined);

export const hasLogin = computed(() => !!user.value);

export const useLogin = () => {
    const api = useApi();
    const signinInfo = ref<ApiLink>();
    const signupInfo = ref<ApiLink>();
    const router = useRouter();
    const overlay = useOverlay();
    const tryLogin = async (username: string, password: string) => {
        if (!signinInfo.value) {
            overlay.showWarn(`暂不支持登录`);
            return;
        }
        const { method = "get", url } = signinInfo.value;
        return new Promise((resolve, reject) =>
            Accounts.callLoginMethod({
                methodName: `${method.toUpperCase()}.${url}`,
                methodArguments: [
                    {
                        body: {
                            username,
                            password:
                                typeof password === "string"
                                    ? Accounts._hashPassword(password)
                                    : password,
                        },
                    },
                ],
                userCallback: (err) => (err ? reject(err) : resolve(true)),
            })
        );
    };
    const signup = async (data: { username: string; password: string }) => {
        if (!signupInfo.value) {
            overlay.showWarn(`暂不支持登录`);
            return;
        }
        data.password = Accounts._hashPassword(data.password) as any;
        return api.useLink(signupInfo.value, { data })
    };
    api.get("user/sign")
        .then((res) => {
            console.log(res);
            signupInfo.value = res.getLink("signup");
            signinInfo.value = res.getLink("signin");
        })
        .catch(
            api.handleError((err) => {
                console.warn(err)
                overlay.showWarn(err.reason || `登陆失败 - ${err.code}`);
                if (err.code === 400) {
                    router.back();
                }
            })
        );
    return {
        login: tryLogin,
        signupInfo,
        signinInfo,
        signup,
    };
};
