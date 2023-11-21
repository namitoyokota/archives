import { CompatibleOptions$v1 } from "./compatible-options.v1";

/**
 * Describes the compatibility with another capability.
 */
export class CompatibleCapability$v1 {
    /** The id of the capability that this capability is compatible with. */
    capabilityId?: string;

    /** Options required by the capability that this capability is compatible with. */
    options?: CompatibleOptions$v1;

    constructor(params: CompatibleCapability$v1 = {} as CompatibleCapability$v1) {
        const { capabilityId = null, options = null } = params;

        this.capabilityId = capabilityId;
        this.options = options;
    }
}
