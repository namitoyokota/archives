import { MapAdminComponentData$v1 } from './mapAdminCompData.v1';

export class AdminCompInfo {
    adminCompData?: MapAdminComponentData$v1;
    registered?: boolean;

    constructor(params = {} as AdminCompInfo) {
        const {
            adminCompData,
            registered = false
        } = params;

        this.adminCompData = adminCompData;
        this.registered = registered;
    }
}
