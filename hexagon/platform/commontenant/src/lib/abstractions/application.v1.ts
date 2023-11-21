/**
 * Represents an Application
 */
export class Application$v1 {
    /** Id of the application */
    id?: string;

    /** Name token for the application */
    nameToken?: string;

    /** Description token for the application */
    descriptionToken?: string;

    /** License feature id. */
    featureId?: string;

    /** License priority. */
    licensePriority?: number;

    constructor(params: Application$v1 = {} as Application$v1) {
        const {
            id = null,
            nameToken = null,
            descriptionToken = null,
            featureId = null,
            licensePriority = 0
        } = params;

        this.id = id;
        this.nameToken = nameToken;
        this.descriptionToken = descriptionToken;
        this.featureId = featureId;
        this.licensePriority = licensePriority;
    }
}
