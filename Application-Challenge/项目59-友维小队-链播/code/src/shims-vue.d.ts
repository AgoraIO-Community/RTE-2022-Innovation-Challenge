/* eslint-disable */
declare module "*.vue" {
    import type { DefineComponent } from "vue";
    const component: DefineComponent<{}, {}, any>;
    export default component;
}

declare module Meteor {
    export interface User {
        profile: {
            name: string;
            avatar: string;
            id: string;
        };
    }
}
declare module "meteor/meteor" {
    declare namespace Meteor {
        export interface UserProfile {
            name: string;
            avatar: string;
        }
    }
}
