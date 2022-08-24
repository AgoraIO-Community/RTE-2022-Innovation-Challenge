import { computed, defineComponent, onUnmounted, ref, useSlots, watch } from "vue";
import { IonAvatar } from "@ionic/vue";
import { useMeteor } from "@/common/meteor";
import { fileTool } from "@/common/FileTool";
import { HError, HLoginError } from "../base";

export const HAvatar = defineComponent({
  name: "h-avatar",
  props: {
    uid: String,
    src: String,
  },
  setup(props) {
    const def = "/static/images/avatars/def.png";
    const fsrc = ref(def);
    const m = useMeteor();
    const mapSource = (src?: string) => {
      fileTool.parseUrlUniverse(src).then((v) => {
        fsrc.value = v ?? "";
      });
    };
    if (props.uid) {
      m.wrapCursor$(Meteor.users.find({ _id: props.uid }))
        .debounce(10)
        .map((v) => v[0])
        .subscribe((info) => {
          const src = info?.profile?.avatar;
          if (src?.includes(".") && !src.includes("/")) {
            fsrc.value = "/static/images/avatar/" + src;
            return;
          }
          mapSource(src);
        });
    } else {
      watch(
        () => props.src,
        (nv) => {
          mapSource(nv);
        },
        { immediate: true }
      );
    }
    return {
      fsrc,
      reset: () => {
        fsrc.value = def;
      },
    };
  },
  render() {
    const ia = IonAvatar as any;
    return (
      <ia>
        <img onError={this.reset} src={this.fsrc} />
      </ia>
    );
  },
});

export const HUserName = defineComponent({
  name: "h-uname",
  props: {
    uid: String,
    name: String,
  },
  setup(props) {
    const fname = ref("");
    const m = useMeteor();
    if (props.uid) {
      m.wrapCursor$(Meteor.users.find({ _id: props.uid }))
        .debounce(10)
        .map((v) => v[0])
        .subscribe((info) => {
          console.error(info);
          fname.value = info?.profile?.name ?? "";
        });
    } else {
      watch(
        props,
        (nv) => {
          fname.value = nv.name ?? "";
        },
        { immediate: true }
      );
    }
    return {
      fname,
    };
  },
  render() {
    return <h-txt> {this.fname} </h-txt>;
  },
});

export const HView = defineComponent({
  name: "h-view",
  props: ['logined', 'online'],
  setup(props) {
    const m = useMeteor();
    const uid = m.wrapObservale$(m.userId$).refRef()
    const online = m.wrapObservale$(m.status$).map(v => v.connected).refRef()
    const slots = useSlots()
    const show = computed(() => {
      if (props.logined !== undefined && !uid.value) {
        console.warn(`need login but not login ${props.logined}`)
        return props.logined === "hide" ? 2 : 3
      }
      if (props.online !== undefined && !online.value) {
        console.warn(`need online but not online ${props.online}`)
        return (props.online as any) === "hide" ? 4 : 5
      }
      return 1
    })
    return {
      show,
      slots
    };
  },
  render() {
    if (this.show === 1) {
      return <div >{this.slots.default?.() ?? ""} </div>
    }
    if (this.show === 5) {
      return <HError>糟糕，当前无法连接服务器</HError>
    }
    if (this.show === 3) {
      return <HLoginError >
      </HLoginError>
    }
    return <span></span>
  },
});