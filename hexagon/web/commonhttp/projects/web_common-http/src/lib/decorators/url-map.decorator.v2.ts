import { UrlHelper } from "../utils/url-helper";

/**
 * Returns a function that defines a property on an object based on a given target and key
 * This property will automatically map to a valid url for a given api url
 */
export function UrlMap$v2() {
    return function (target: any, key: string) {
        Object.defineProperty(target, key, {
            configurable: false,
            get: () => target,
            set: (val) => {
                target = UrlHelper.mapMediaUrl(val);
            }
        });
    };
}
