/**
 * Represents notification settings
 */
export class NotificationSettings$v1 {
    /** Handles concurrency */
    etag?: string;

    /** Id of the entity owner tenant */
    tenantId?: string;

    /** Id of preset */
    preset?: string;

    /** Name token of preset. */
    presetName?: string;

    /** Whether or not this is the default settings. */
    isDefault?: boolean;

    /** Gets or sets the list of groups using a settings preset as their default. */
    defaultGroups?: string[];

    /** Maximum notifications to display. */
    maxToDisplay?: number;

    /** Whether or not overlap protection is enabled. */
    overlapProtectionEnabled?: boolean;

    /** Description token of preset. */
    description?: string;

    /** List of disabled capabilities. */
    disabledCapabilities?: string[];

    constructor(params: NotificationSettings$v1 = {} as NotificationSettings$v1) {
        const {
            etag = null,
            tenantId = null,
            preset = null,
            presetName = null,
            isDefault = false,
            defaultGroups = [],
            maxToDisplay = null,
            overlapProtectionEnabled = true,
            description = null,
            disabledCapabilities = []
        } = params;

        this.etag = etag;
        this.tenantId = tenantId;
        this.preset = preset;
        this.presetName = presetName;
        this.isDefault = isDefault;
        this.defaultGroups = defaultGroups ? defaultGroups : [];
        this.maxToDisplay = maxToDisplay;
        this.overlapProtectionEnabled = overlapProtectionEnabled;
        this.description = description;
        this.disabledCapabilities = [...disabledCapabilities];
    }
}
