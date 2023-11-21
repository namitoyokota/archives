import { Guid } from '@galileo/web_common-libraries';

/**
 * Represents an primitive icon to be created from the UI
 */
export class CreatePrimitiveIcon$v1 {

    /** A unique identifier for the icon */
    id?: string;

    /** The name of the icon */
    name?: string;

    /** The URL to the icon */
    url?: string;

    /** The filename to the icon */
    fileName?: string;

    /** The height in px of the icon */
    baseHeight?: number;

    /** The width in px of the icon */
    baseWidth?: number;

    /** The capability id the icon belongs to */
    capabilityId?: string;

    constructor(params: CreatePrimitiveIcon$v1 = {} as CreatePrimitiveIcon$v1) {
        const {
            id = Guid.NewGuid(),
            name = null,
            url = null,
            fileName = null,
            baseHeight = 0,
            baseWidth = 0,
            capabilityId = null
        } = params;

        this.id = id;
        this.name = name;
        this.url = url;
        this.fileName = fileName;
        this.baseHeight = baseHeight;
        this.baseWidth = baseWidth;
        this.capabilityId = capabilityId;
    }
}
