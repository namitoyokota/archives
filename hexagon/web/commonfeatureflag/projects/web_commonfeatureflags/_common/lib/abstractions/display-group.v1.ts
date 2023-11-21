import { FlagState$v1 } from './flag-state.v1';

export class DisplayedGroup$v1 {
    /** Group identifier */
    groupId: string;

    /** Current states of all flags for this group */
    flagStates: FlagState$v1[];

    constructor(params: DisplayedGroup$v1 = {} as DisplayedGroup$v1) {
        const {
            groupId = null,
            flagStates = null
        } = params;

        this.groupId = groupId;
        this.flagStates = flagStates;
    }
}
