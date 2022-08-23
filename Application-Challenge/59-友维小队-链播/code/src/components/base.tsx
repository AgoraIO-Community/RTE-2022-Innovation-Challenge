import { ddpState, parseAvatarSrc, parseStaticSrc } from "@/common/api";
import { useRouter } from "@/router";
import {
  IonButton,
  IonIcon,
  IonItem,
  IonText,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonCardTitle,
  IonCardSubtitle,
  IonBackButton,
  IonModal,
  IonPage,
  IonHeader,
  IonButtons,
  IonToolbar,
  IonTitle,
  IonContent,
  IonLabel,
  useIonRouter,
  IonImg,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonSkeletonText,
  IonFooter,
} from "@ionic/vue";
import { warningOutline, closeOutline } from "ionicons/icons";
import { defineComponent, useSlots } from "vue";
import { HIconRouterBack } from "./icons/base";
export const View = function (props: any, { slots }: any) {
  if (props.wrapper !== undefined) {
    return (
      <div {...{ ...props, style: { ...props.style, position: "relative" } }}>
        {slots.default?.() ?? ""}
      </div>
    );
  }
  return <div {...props}>{slots.default?.() ?? ""}</div>;
};

export const Text = (props: any, { slots }: any) => {
  const c = props.label !== undefined ? IonLabel : IonText;
  return <c {...props}> {slots.default?.() ?? ""} </c>;
};

export const Image = (props: any) => {
  let src = props.src;
  if (props.avatar !== undefined) {
    src = parseAvatarSrc(src);
  } else {
    src = parseStaticSrc(src);
  }
  // console.error(src)
  return <IonImg {...props} src={src} />;
};

export const HSeperator = () => {
  return <div style={{ width: "100%", margin: "12px 0" }}></div>;
};

export const HH1 = (props: any, { slots }: any) => {
  return <h1 {...props}> {slots.default?.() ?? ""} </h1>;
};
export const HH2 = (props: any, { slots }: any) => {
  return <h2 {...props}> {slots.default?.() ?? ""} </h2>;
};
export const HH3 = (props: any, { slots }: any) => {
  return <h3 {...props}> {slots.default?.() ?? ""} </h3>;
};
export const HH4 = (props: any, { slots }: any) => {
  return <h4 {...props}> {slots.default?.() ?? ""} </h4>;
};
export const HH5 = (props: any, { slots }: any) => {
  return <h5 {...props}> {slots.default?.() ?? ""} </h5>;
};
const methodMap = {
  to: "navigate",
  back: "back",
};

export const Navigator = defineComponent({
  name: "h-nav",
  props: ["nav-type", "btn", "row", "url"],
  setup(props: any) {
    const router = useRouter();
    const pureLink = props?.row === undefined || !props?.url;
    const Block: any =
      props.btn !== undefined ? IonButton : pureLink ? View : IonItem;
    const p = pureLink ? { ...props } : { ...props, detail: true };
    delete p.row;
    const slots = useSlots();
    p.onClick = () => {
      if (!p.url) return;
      switch (props?.["nav-type"]) {
        case "back":
          router.back();
          break;
        case "base":
          router.rebase(p.url);
          break;
        case "redirect":
          router.redirect(p.url);
          break;
        default:
          router.to(p.url);
          break;
      }
    };
    return () => <Block {...p}> {slots.default ? slots.default() : ""} </Block>;
  },
});
export const HLoginError = () => {
  return (
    <HError class="fcol fcnt h100p">
      <div>需要登录哦</div>
      <Navigator
        btn
        url="/user/signin"
        class="mgt w100p"
        {...{ expand: "block" }}
      >
        前往登录
      </Navigator>
    </HError>
  );
};
export const HButton = (props: any, { slots }: any) => {
  const c = IonButton as any;
  return <c {...props}> {slots.default?.(props) ?? ""} </c>;
};
export const HBackButton1 = defineComponent({
  name: "h-back-btn",
  props: {
    back: Function,
  },
  setup(props) {
    const router = useIonRouter();
    return {
      bp: {
        onClick: () => {
          if (props.back) {
            return props.back();
          }
          router.back();
        },
        class: "h-back-btn",
        routerDirection: "back" as any,
        fill: "clear" as any,
      },
    };
  },
  render() {
    return (
      <IonButton {...this.bp}>
        <HIconRouterBack></HIconRouterBack>
      </IonButton>
    );
  },
});
export const HBackButton = defineComponent({
  name: "h-back",
  props: {
    back: Function,
  },
  setup(props: any) {
    const c = IonBackButton as any;
    const router = useRouter();
    return () => (
      <c
        text="返回"
      ></c>
    );
  },
});

export const HForm = (props: any, { slots }: any) => {
  return (
    <form {...props} onSubmit={(ev) => ev?.preventDefault()}>
      {" "}
      {slots.default?.() ?? ""}{" "}
    </form>
  );
};

export const HError = (props: any, { slots }: any) => {
  return (
    <div class="fcol fcnt pd" {...props}>
      <IonIcon
        style={{ fontSize: "64px" }}
        class="mgb"
        color="danger"
        icon={warningOutline}
      ></IonIcon>
      {slots.default?.() ?? "糟糕，出错了 "}
    </div>
  );
};

export const HSkeleton = (props: any, { slots }: any) => {
  if (props.ready) {
    return slots.default?.() ?? "";
  }
  return <IonSkeletonText {...props}></IonSkeletonText>;
};

export const HIcon = (props: any) => {
  // @ts-ignore
  return <IonIcon {...props}></IonIcon>;
};

export const HCard = (props: { title?: string }, { slots }: any) => {
  const ic = IonCard as any;
  const ich = IonCardHeader as any;
  const ict = IonCardTitle as any;
  const icst = IonCardSubtitle as any;
  const icc = IonCardContent as any;
  return (
    <ic {...props}>
      {props?.title && (
        <ich>
          <ict style={{ fontSize: "18px" }}>{props.title}</ict>
          {slots.subtitle && <icst> {slots.subtitle()} </icst>}
        </ich>
      )}
      {slots.header && <ich>{slots.header()}</ich>}
      <icc>{slots.default?.()} </icc>
    </ic>
  );
};

export const HModal = (props: any, { slots }: any) => {
  return (
    <IonModal {...{ ...props, class: "h-modal" }}>
      <IonPage>
        <IonHeader class="bx-header">
          <IonToolbar>
            <IonButtons {...{ slot: "start" }}>{slots.start?.()}</IonButtons>
            <IonTitle>{props.title}</IonTitle>
            <IonButtons {...{ slot: "end" }}>
              <IonButton
                {...{ onClick: () => (props.onclose || props.onClose)?.() }}
              >
                <IonIcon {...{ src: closeOutline }}></IonIcon>
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent {...props.content}>{slots?.default?.()}</IonContent>
        {slots?.foot && <IonFooter> {slots.foot()} </IonFooter>}
      </IonPage>
    </IonModal>
  );
};

export const HEmpty = (props: { tip: string }, { slots }: any) => {
  return (
    <div class="bx-empty fcol fcnt" style={{ height: "100%", width: "100%" }}>
      <img src="/assets/icon/empty.svg" alt="" />
      <span
        style={{
          fontSize: "13px",
          color: "#999999",
        }}
      >
        {" "}
        {props.tip}{" "}
      </span>
      {slots?.default?.()}
    </div>
  );
};

export const HSelect = (
  props: {
    options: Array<{ val: string; txt: string; ok: boolean }>;
    title: "";
    def: string;
    modelValue: string;
    disabled: any;
  },
  { slots }: any
) => {
  if (!props?.options?.length) {
    return <span></span>;
  }
  const fv = props.modelValue || props?.def || props.options?.[0].val;
  console.log({ fv, props });
  return (
    <IonSelect
      placeholder={props.title}
      cancel-text="取消"
      ok-text="确认"
      value={fv}
      disabled={!!props.disabled}
    >
      {props.options.map((o) => (
        <IonSelectOption value={o.val} disabled={!o.ok}>
          {slots?.default?.(o) || o.txt}
        </IonSelectOption>
      ))}
    </IonSelect>
  );
};

export const HLoading = (props: any, { slots }: any) => {
  return (
    <div class="frow fcnt" {...props}>
      <IonLabel>{slots?.default?.()} </IonLabel>
      <IonSpinner {...props.loader}></IonSpinner>
    </div>
  );
};
