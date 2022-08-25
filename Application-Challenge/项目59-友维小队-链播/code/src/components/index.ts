import { defineAsyncComponent } from "vue";
import {
    Image,
    Text,
    HH1,
    HH2,
    HH3,
    HH4,
    HH5,
    Navigator,
    HButton,
    HBackButton,
    HForm,
    HIcon,
    HEmpty,
    HCard,
    HModal,
    HBackButton1,
    HSelect,
    HLoading,
    HError,
    HSkeleton,
    HLoginError,
} from "./base";
import { HUserName, HAvatar, HView } from "./mongo/user";
import NavigatorEl from "./NavListItem.vue";

export const PageHeader = defineAsyncComponent(
    () => import(/* webpackChunkName: "tiny-comp"*/ "./AppHeader.vue")
);

import AppPage from "./AppPage.vue";
import { HIconClose, HIconConfirm, HIconUndo } from "./icons/base";

const EL = defineAsyncComponent({
    async loader() {
        const res = await import(
            /* webpackChunkName: "tiny-comp"*/ "@ionic/vue"
        );
        return res.IonItem;
    },
});
const List = defineAsyncComponent(() =>
    import(/* webpackChunkName: "tiny-comp"*/ "@ionic/vue").then(
        (e) => e.IonList
    )
);

export const useCustomComponent = (app: any) => {
    app.component("h-list", List);
    app.component(
        "h-input",
        defineAsyncComponent(() =>
            import(/* webpackChunkName: "sub-comp"*/ "@ionic/vue").then(
                (e) => e.IonInput
            )
        )
    );
    app.component(
        "h-textarea",
        defineAsyncComponent(() =>
            import(/* webpackChunkName: "sub-comp"*/ "@ionic/vue").then(
                (e) => e.IonTextarea
            )
        )
    );
    app.component(
        "h-btns",
        defineAsyncComponent(() =>
            import(/* webpackChunkName: "sub-comp"*/ "@ionic/vue").then(
                (e) => e.IonButtons
            )
        )
    );
    app.component(
        "h-search",
        defineAsyncComponent(() =>
            import(/* webpackChunkName: "sub-comp"*/ "@ionic/vue").then(
                (e) => e.IonSearchbar
            )
        )
    );
    app.component(
        "h-content",
        defineAsyncComponent(() =>
            import(/* webpackChunkName: "sub-comp"*/ "@ionic/vue").then(
                (e) => e.IonContent
            )
        )
    );

    app.component(
        "h-badge",
        defineAsyncComponent(() =>
            import(/* webpackChunkName: "sub-comp"*/ "@ionic/vue").then(
                (e) => e.IonBadge
            )
        )
    );
    app.component(
        "h-footer",
        defineAsyncComponent(() =>
            import(/* webpackChunkName: "sub-comp"*/ "@ionic/vue").then(
                (e) => e.IonFooter
            )
        )
    );
    app.component(
        "h-help",
        defineAsyncComponent(
            () => import(/* webpackChunkName: "sub-comp"*/ "./FuncHelp.vue")
        )
    );
    app.component(
        "h-label",
        defineAsyncComponent(() =>
            import(/* webpackChunkName: "sub-comp"*/ "@ionic/vue").then(
                (e) => e.IonLabel
            )
        )
    );
    app.component(
        "h-chip",
        defineAsyncComponent(() =>
            import(/* webpackChunkName: "sub-comp"*/ "@ionic/vue").then(
                (e) => e.IonChip
            )
        )
    );
    app.component(
        "h-note",
        defineAsyncComponent(() =>
            import(/* webpackChunkName: "sub-comp"*/ "@ionic/vue").then(
                (e) => e.IonNote
            )
        )
    );
    app.component("h-loading", HLoading);
    app.component(
        "h-list-header",
        defineAsyncComponent(() =>
            import(/* webpackChunkName: "sub-comp"*/ "@ionic/vue").then(
                (e) => e.IonListHeader
            )
        )
    );
    app.component("h-view", HView);
    app.component("h-img", Image);
    app.component("h-txt", Text);
    app.component("h-h1", HH1);
    app.component("h-h2", HH2);
    app.component("h-h3", HH3);
    app.component("h-h4", HH4);
    app.component("h-h5", HH5);
    app.component("h-page", AppPage);
    app.component("h-header", PageHeader);
    app.component(
        "h-header-pure",
        defineAsyncComponent(() => import("./AppHeaderPure.vue"))
    );
    app.component("h-btn", HButton);
    app.component("h-nav", Navigator);
    app.component("h-nav-el", NavigatorEl);
    app.component("h-back", HBackButton);
    app.component("h-back-btn", HBackButton1);
    app.component("h-form", HForm);
    app.component("h-icon", HIcon);
    app.component("h-empty", HEmpty);
    app.component("h-error", HError);
    app.component("h-error-login", HLoginError);
    app.component("h-skeleton", HSkeleton);
    app.component("h-select", HSelect);
    app.component("h-el", EL);
    app.component("h-avatar", HAvatar);
    app.component("h-uname", HUserName);
    app.component("h-card", HCard);
    app.component("h-modal", HModal);
    app.component(
        "h-modal-page",
        defineAsyncComponent(() => import("./AppModal.vue"))
    );
    app.component(
        "h-logined",
        defineAsyncComponent(() => import("./LoginCheck.vue"))
    );
    app.component("h-icon-close", HIconClose);
    app.component("h-icon-undo", HIconUndo);
    app.component("h-icon-do", HIconConfirm);
};
