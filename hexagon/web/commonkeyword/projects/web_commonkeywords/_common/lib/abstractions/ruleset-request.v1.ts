import { ResourceType$v1 } from './resource-type.v1';

export class RulesetRequest$v1 {

    /** The industry (e.g. POLICE) associated with the ruleset */
    industryId?: string;

    /** The type the rule is associated with the ruleset */
    resourceType?: ResourceType$v1;

    /** Name of the ruleset. */
    rulesetName?: string;

    constructor(params: RulesetRequest$v1 = {} as RulesetRequest$v1) {
        const {
            industryId = null,
            resourceType = ResourceType$v1.Icon,
            rulesetName = null
        } = params;

        this.industryId = industryId;
        this.resourceType = resourceType;
        this.rulesetName = rulesetName;
    }
}
