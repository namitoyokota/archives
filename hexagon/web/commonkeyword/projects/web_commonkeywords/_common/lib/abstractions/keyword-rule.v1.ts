import { Guid } from '@galileo/web_common-libraries';

export class KeywordRule$v1 {
    /** The ID of the resource corresponding to this node. */
    resourceId?: string;

    /** The Id of the group to witch the rule belongs */
    groupId?: string;

    /** A friendly name for the keyword node */
    friendlyName?: string;

    /** The list of keywords associated with an keyword */
    keywords?: string[];

    constructor(params: KeywordRule$v1 = {} as KeywordRule$v1) {
        const {
            resourceId = Guid.NewGuid(),
            groupId = null,
            friendlyName = null,
            keywords = []
        } = params;

        this.resourceId = resourceId;
        this.groupId = groupId;
        this.friendlyName = friendlyName;
        this.keywords = keywords;
    }
}
