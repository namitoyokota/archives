/**
 * Used as a node in a keyword rule set tree
 */
export class KeywordNode$v1 {
    /** The resource corresponding to this node. */
    resourceId?: string;

    /** A friendly name for the keyword node */
    friendlyName?: string;

    /** List of keywords associated with an keyword */
    keywords?: string[];

    /** The children on the current node in the rule set tree */
    children?: KeywordNode$v1[];

    constructor(params: KeywordNode$v1 = {} as KeywordNode$v1) {
        const {
            resourceId = null,
            friendlyName = null,
            keywords = [],
            children = []
        } = params;

        this.resourceId = resourceId;
        this.friendlyName = friendlyName;
        this.keywords = keywords;
        this.children = children;
    }
}
