export class AppNotificationGroup$v1 {

    /** Id of notification group. Type or subtype id */
    id: string;

    /** Translated name of the group */
    name: string;

    constructor(params: AppNotificationGroup$v1 = {} as AppNotificationGroup$v1) {
        const {
            id = null,
            name = null
        } = params;

        this.id = id;
        this.name = name;
    }
}
