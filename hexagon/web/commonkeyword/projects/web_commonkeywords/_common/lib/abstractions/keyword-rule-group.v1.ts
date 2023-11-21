import { Guid } from '@galileo/web_common-libraries';

export class KeywordRuleGroup$v1 {
    /** A unique identifier for the group*/
    id?: string;

    /** A name for the group*/
    name?: string;

    /** The ID of the default resource for the group*/
    resourceId?: string;

    constructor(params: KeywordRuleGroup$v1 = {} as KeywordRuleGroup$v1) {
        const {
            id = Guid.NewGuid(),
            name = null,
            resourceId = null
        } = params;

        this.id = id;
        this.name = name;
        this.resourceId = resourceId;
    }
}
