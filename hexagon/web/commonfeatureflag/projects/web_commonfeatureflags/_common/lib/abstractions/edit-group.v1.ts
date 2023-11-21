export class EditedGroup$v1 {
    /** Group identifier */
    groupId: string;

    /** List of all edited flag ids */
    flagIds: string[];

    constructor(params: EditedGroup$v1 = {} as EditedGroup$v1) {
        const {
            groupId = null,
            flagIds = null
        } = params;

        this.groupId = groupId;
        this.flagIds = flagIds;
    }
}
