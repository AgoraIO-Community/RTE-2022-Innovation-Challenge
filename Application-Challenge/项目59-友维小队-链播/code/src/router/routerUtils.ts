import { RouteLocationNormalized } from 'vue-router';

export function isPublicRoute(route: RouteLocationNormalized) {
    return !route || !!route.meta.pub || route.path?.includes('offline');
}
