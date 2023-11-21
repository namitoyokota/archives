/**
 * Returns a function that defines a property on an object based on a given target and key
 * This property will automatically map to a valid url for a given api url
 * @param port The port on which the api is hosted
 * @deprecated The new UrlMap$v2 decorator uses Traefik and no longer requires a port.
 */
export function UrlMap(port: string) {
    return function (target: any, key: string) {
        Object.defineProperty(target, key, {
            configurable: false,
            get: () => target,
            set: (val) => {
                const protocol = window.location.protocol;
                const hostname = window.location.hostname;
                let apiRootURL = val;

                if (hostname === 'localhost') {
                    apiRootURL = `http://localhost:${port}/${apiRootURL}`;
                } else {
                    apiRootURL = `/${apiRootURL}`;
                }
                target = apiRootURL;
            }
        });
    };
}
