import { FlagState$v1 } from './flag-state.v1';

export class GroupState$v1 {
    /** Group identifier */
    groupId?: string;

    /** List of flag states */
    flagStates?: FlagState$v1[];

    constructor(params: GroupState$v1 = {} as GroupState$v1) {
        const {
            groupId = null,
            flagStates = null
        } = params;

        this.groupId = groupId;
        this.flagStates = flagStates;
    }
}
