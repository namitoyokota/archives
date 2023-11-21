import { Guid } from '@galileo/web_common-libraries';

/**
 * Represents an primitive icon that can be used to make a composite icon
 */
export class PrimitiveIcon$v1 {

    /** The server-provided etag for concurrency control */
    etag?: string;

    /** A unique identifier for the icon */
    id?: string;

    /** A token that can be exchanged for a localized name of the icon */
    nameToken?: string;

    /** A token that can be exchanged for a localized category of the icon */
    categoryToken?: string;

    /** The URL to the icon */
    url?: string;

    /** The URL to the icon with stroke */
    urlWithStroke?: string;

    /** The height in px of the icon */
    baseHeight?: number;

    /** The width in px of the icon */
    baseWidth?: number;

    /** Keywords that are commonly associated with this icon */
    keywords?: string[];

    /** The capability id the icon belongs to */
    capabilityId?: string;

    /** Flag that is true if the icon is a modifier */
    isModifier?: boolean;

    constructor(params: PrimitiveIcon$v1 = {} as PrimitiveIcon$v1) {
        const {
            id = Guid.NewGuid(),
            nameToken = null,
            categoryToken = null,
            url = null,
            urlWithStroke = null,
            baseHeight = 0,
            baseWidth = 0,
            keywords = [],
            capabilityId = null,
            etag = null,
            isModifier = false
        } = params;

        this.id = id;
        this.nameToken = nameToken;
        this.categoryToken = categoryToken;
        this.url = url;
        this.urlWithStroke = urlWithStroke;
        this.baseHeight = baseHeight;
        this.baseWidth = baseWidth;
        this.keywords = keywords;
        this.capabilityId = capabilityId;
        this.etag = etag;
        this.isModifier = isModifier;
    }
}
