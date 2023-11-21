import { GroupState$v1 } from './group-state.v1';
import { FlagState$v1 } from './flag-state.v1';

export class GlobalStates$v1 {
    /** Flag states at the global level */
    global?: FlagState$v1[];

    /** Flag states at the tenant level */
    tenant?: FlagState$v1[];

    /** Flag states for all enabled groups */
    groups?: GroupState$v1[];

    constructor(params: GlobalStates$v1 = {} as GlobalStates$v1) {
        const {
            global = null,
            tenant = null,
            groups = null
        } = params;

        this.global = global;
        this.tenant = tenant;
        this.groups = groups;
    }
}
