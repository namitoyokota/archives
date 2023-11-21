export class DataSharingCapabilityOptions$v1 {
    /** List of sharing operations external data sharing cares about */
    externalSharingOperations?: string[];

    /** List of sharing operations internal data sharing cares about */
    internalSharingOperations?: string[];

    constructor(params: DataSharingCapabilityOptions$v1 = {} as DataSharingCapabilityOptions$v1) {
        const {
            externalSharingOperations = [],
            internalSharingOperations = []
        } = params;

        this.externalSharingOperations = externalSharingOperations;
        this.internalSharingOperations = internalSharingOperations;
    }
}
