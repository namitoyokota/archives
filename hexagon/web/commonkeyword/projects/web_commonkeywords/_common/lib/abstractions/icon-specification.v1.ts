import { KeywordRuleset$v1 } from './keyword-ruleset.v1';
import { CompositeIcon$v1 } from './composite-icon.v1';

export interface IconSpecification$v1 {
    /** Ruleset to create or update */
    ruleset: KeywordRuleset$v1;

    /** Icons to create */
    icons: CompositeIcon$v1[];
}
