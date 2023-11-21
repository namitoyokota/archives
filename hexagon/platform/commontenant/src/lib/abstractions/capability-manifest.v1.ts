import { CompatibleCapability$v1 } from './compatible-capability.v1';
import { ManifestOperation$v1 } from './manifest-operation.v1';

/**
 * Describes a capability and its interactions with other capabilities.
 */
export class CapabilityManifest$v1 {
    /** Uniquely identifies a version of the capability (e.g @hxgn/{capabilityName}) */
    id?: string;

    /** Used for concurrency control */
    etag?: string;

    /** THe URI of the capability's core module. */
    uri?: string;

    /** A token that can be exchanged for the localized name of the capability. */
    nameToken?: string;

    /** A token that can be exchanged for a localized description of the capability. */
    descriptionToken?: string;

    /** The componentType of the UI component that supports configuring filtering and redaction rules for the capability. */
    dataSharingComponentType?: string;

    /** The componentType of the UI component that supports enabling/disabling filtering and redaction rules for the capability. */
    activeDataFiltersComponentType?: string;

    /** A list of capabilities with which this capability is compatible. */
    compatible?: CompatibleCapability$v1[];

    /**  If true, display the name of the capability in the list of capabilities that can be shared */
    isSharable?: boolean;

    /** Flag that is true if internal data sharing is not supported */
    excludeFromInternalDataSharing?: boolean;

    /** Flag that is true if external data sharing is not supported */
    excludeFromExternalDataSharing?: boolean;

    /**
     * An ordered list of strings that define the criteria levels for a capability.
     * The elements of this list are ordered from highest priority to lowest priority.
     * In the initial UX data sharing design, for example, this list would be
     * ["High", "Medium", "Low"].
     */
    dataSharingLevels?: string[];

    /**  If true, this capability's claims can be included in a personal access token's potential claims */
    hasPatSupport?: boolean;

    /**  A list of operations (e.g. apiRead) supported by the capability. */
    capabilityOperations?: ManifestOperation$v1[];

    /** When true the capability will show up in the icon management UI */
    supportsIconManagement?: boolean;

    constructor(params: CapabilityManifest$v1 = {} as CapabilityManifest$v1) {
        const {
            id = null,
            etag = null,
            uri = null,
            nameToken = null,
            descriptionToken = null,
            dataSharingComponentType = null,
            activeDataFiltersComponentType = null,
            compatible = [],
            dataSharingLevels = defaultDataSharingLevels,
            hasPatSupport = false,
            capabilityOperations = [],
            supportsIconManagement = false,
            excludeFromInternalDataSharing = false,
            excludeFromExternalDataSharing = false,
            isSharable = false
        } = params;

        this.id = id;
        this.etag = etag;
        this.uri = uri;
        this.nameToken = nameToken;
        this.descriptionToken = descriptionToken;
        this.dataSharingComponentType = dataSharingComponentType;
        this.activeDataFiltersComponentType = activeDataFiltersComponentType;
        this.compatible = compatible;
        this.dataSharingLevels = dataSharingLevels;
        this.hasPatSupport = hasPatSupport;
        this.capabilityOperations = capabilityOperations;
        this.supportsIconManagement = supportsIconManagement;
        this.isSharable = isSharable;

        // Exclude from data sharing if isSharable is false or if one of the flag is set
        this.excludeFromInternalDataSharing = !isSharable || excludeFromInternalDataSharing;
        this.excludeFromExternalDataSharing = !isSharable || excludeFromExternalDataSharing;
    }
}

/**
 * The default data sharing levels used if a capability does not override them.
 */
export const defaultDataSharingLevels = [
    'High', 'Medium', 'Low'
];
