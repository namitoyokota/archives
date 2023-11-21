import { MapLayerAuthenticationProvider$v1 } from './mapLayerAuthProvider.v1';
import { MapLayerOption$v1 } from './mapLayerOption.v1';

/** Contains Authentication details needed for requesting some map sources. */
export class MapLayerAuthentication$v1 {
    /** Gets or sets the type of Authentication this Map Layer uses. */
    authenticationProvider?: MapLayerAuthenticationProvider$v1;

    /** Gets or sets the Authentication options to use for this map source. */
    options?: MapLayerOption$v1[];

    constructor(params = {} as MapLayerAuthentication$v1) {
        const {
            authenticationProvider = MapLayerAuthenticationProvider$v1.HxCP,
            options = []
        } = params;

        this.authenticationProvider = authenticationProvider;
        if (options) {
            this.options = options.map((option) => {
                return(new MapLayerOption$v1(option));
            });
        }
    }

    encode?() {
        if (this.options) {
            for (const option of this.options) {
                if (option.type === 'string' || option.type === 'secret') {
                    option.value = encodeURIComponent(option.value);
                }
            }
        }
    }

    decode?() {
        if (this.options) {
            for (const option of this.options) {
                if (option.type === 'string' || option.type === 'secret') {
                    option.value = decodeURIComponent(option.value);
                }
            }
        }
    }
}
