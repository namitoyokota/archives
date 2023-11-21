import { Guid } from '@galileo/web_common-libraries';

/**
 * Represents an primitive icon that can be used to make a composite icon
 */
export class PrimitiveIcon$v2 {

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

    /** The filename to the icon with stroke */
    fileNameWithStroke?: string;

    /** The height in px of the icon */
    baseHeight?: number;

    /** The width in px of the icon */
    baseWidth?: number;

    /** The capability id the icon belongs to */
    capabilityId?: string;

    /** Flag that is true if icon is system defined */
    isSystemDefined?: boolean;

    /** Flag that is true if the icon is a modifier */
    isModifier?: boolean;

    /** Keywords that are commonly associated with this icon */
    keywordTokens?: string[];

    constructor(params: PrimitiveIcon$v2 = {} as PrimitiveIcon$v2) {
        const {
            etag = null,
            id = Guid.NewGuid(),
            nameToken = null,
            categoryToken = null,
            url = null,
            urlWithStroke = null,
            fileNameWithStroke = null,
            baseHeight = 0,
            baseWidth = 0,
            capabilityId = null,
            isSystemDefined = false,
            isModifier = false,
            keywordTokens = []
        } = params;

        this.etag = etag;
        this.id = id;
        this.nameToken = nameToken;
        this.categoryToken = categoryToken;
        this.url = url;
        this.urlWithStroke = urlWithStroke;
        this.fileNameWithStroke = fileNameWithStroke;
        this.baseHeight = baseHeight;
        this.baseWidth = baseWidth;
        this.capabilityId = capabilityId;
        this.isSystemDefined = isSystemDefined;
        this.isModifier = isModifier;
        this.keywordTokens = keywordTokens;
    }
}
