import { CompositeIcon$v1 } from './composite-icon.v1';
import { KeywordRule$v1 } from './keyword-rule.v1';

export class IconRule$v1 {
    /** Icon object */
    icon?: CompositeIcon$v1;

    /** Ruleset for icon */
    rule?: KeywordRule$v1;

    constructor(params: IconRule$v1 = {} as IconRule$v1) {
        const {
            icon = null,
            rule = null
        } = params;

        this.icon = icon;
        this.rule = rule;
    }
}
