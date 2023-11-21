/**
 * Represent an Industry
 */
export class Industries$v1 {
    /** URL where industry icon is located. */
    iconUrl: string;

    /** Industry ID. */
    id: string;

    /** Name token for localization. */
    nameToken: string;

    /** Sector token for localization. */
    sectorToken: string;

    /** ID of tenant that industry belongs to. */
    tenantId: string;

    constructor(params: Industries$v1 = {} as Industries$v1) {
        const {
            iconUrl,
            id,
            nameToken,
            sectorToken,
            tenantId
        } = params;

        this.iconUrl = iconUrl;
        this.id = id;
        this.nameToken = nameToken;
        this.sectorToken = sectorToken;
        this.tenantId = tenantId;
    }
}
