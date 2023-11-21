export interface IconCapabilityIndustryIconOption$v1 {
    /** Friendly name for industry */
    industryName: string;

    /** File path to industry icon */
    filePath: string;
}

export class IconCapabilityOptions$v1 {
    /** File path to capability icon */
    capabilityIconPath?: string;

    /** Map of industry ids to their options */
    industryIcons?: Map<string, IconCapabilityIndustryIconOption$v1>;

    constructor(params: IconCapabilityOptions$v1 = {} as IconCapabilityOptions$v1) {
        const {
            capabilityIconPath = null,
        } = params;

        this.capabilityIconPath = capabilityIconPath;

        const industryIcons = new Map<string, IconCapabilityIndustryIconOption$v1>();
        if (params && params.industryIcons) {
            for (const prop in params.industryIcons) {
                if (Object.prototype.hasOwnProperty.call(params.industryIcons, prop)) {
                    industryIcons.set(prop, params.industryIcons[prop]);
                }
            }
        }

        this.industryIcons = industryIcons;
    }
}
