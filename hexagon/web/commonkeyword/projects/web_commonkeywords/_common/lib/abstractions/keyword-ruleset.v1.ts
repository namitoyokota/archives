import { KeywordNode$v1 } from './keyword-node.v1';
import { ResourceType$v1 } from './resource-type.v1';
import { KeywordRuleGroup$v1 } from './keyword-rule-group.v1';
import { KeywordRule$v1 } from './keyword-rule.v1';

/**
 * Represents a collection of keyword rules for a tenant
 */
export class KeywordRuleset$v1 {
    /** The server-provided etag for concurrency control */
    etag?: string;

    /** The type the rule is associated with the ruleset */
    resourceType?: ResourceType$v1;

    /** The id of the capability the ruleset belongs to */
    capabilityId?: string;

    /** The industry (e.g. POLICE) associated with the ruleset */
    industryId?: string;

    /** A collection of groups associated with a ruleset */
    groups?: Map<string, KeywordRuleGroup$v1>;

    /** The list of rules */
    rules?: KeywordRule$v1[];

    /** Display of the ruleset */
    name?: string;

    constructor(params: KeywordRuleset$v1 = {} as KeywordRuleset$v1) {
        const {
            etag = null,
            industryId = null,
            capabilityId = null,
            resourceType = ResourceType$v1.Icon,
            name = null
        } = params;

        this.etag = etag;
        this.industryId = industryId;
        this.capabilityId = capabilityId;
        this.resourceType = resourceType;
        this.name = name;

        const groups = new Map<string, KeywordRuleGroup$v1>();
        if (params && params.groups) {

            try {
                // Object is map
                params.groups.forEach((value, key) => {
                    groups.set(key, new KeywordRuleGroup$v1(value));
                });
            } catch (err) {
                // Try to parse a normal object for groups
                for (const property in params.groups) {
                    if (params.groups.hasOwnProperty(property)) {
                        groups.set(property, params.groups[property]);
                    }
                }
            }
        }
        this.groups = groups;

        let rules: KeywordRule$v1[] = [];
        if (params && params.rules) {
            rules = params.rules.map(rule => {
                return new KeywordRule$v1(rule);
            });
        }
        this.rules = rules;
    }
}
