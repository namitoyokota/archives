import { CompatibleOptions$v1 } from '@galileo/web_commontenant/adapter';

export class CompatibleOptions extends CompatibleOptions$v1 {
    /** Path to icon for the capability */
    capabilityIconPath?: string;

    /** Path to optional industry icon */
    industryIcons?: string;

    /** Feature flag that must be enable to be used in icon manager */
    featureFlag?: string;
}
